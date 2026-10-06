// ================================================================
// HURACANES — Monitor de Huracanes
// Imagen: NASA GIBS WMTS tiles — VIIRS NOAA-21 (reflectancia corregida)
// Posición: NOAA/NHC (con proxy CORS + fallback)
// Extras: Cono de trayectoria probable + distancia a tierra/ANP
// ANP: sin relleno (fillOpacity:0) para ver la imagen satélite
// ================================================================

let huracanesLayerVIIRS = null;
let huracanesLayerPos = null;
let huracanesLayerTrack = null;
let huracanesLayerCone = null;
let huracanesData = null;
let huracanesVisible = false;
let huracanesInitTimer = null;
let _savedAnpStyles = null;

// ================================================================
// GIBS WMTS
// ================================================================

const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/';
const GIBS_TMS = 'GoogleMapsCompatible_Level9';

function gibsFecha(diasAtras) {
  var d = new Date();
  d.setDate(d.getDate() - (diasAtras || 0));
  return d.toISOString().split('T')[0];
}

function crearGibsTile(layerName, diasAtras) {
  var fecha = gibsFecha(diasAtras);
  var url = GIBS_BASE + layerName + '/default/' + fecha + '/' + GIBS_TMS + '/{z}/{y}/{x}.jpg';
  return L.tileLayer(url, {
    attribution: 'NASA GIBS / EOSDIS · ' + layerName,
    maxZoom: 9,
    bounds: [[-85.0511, -180], [85.0511, 180]],
    crossOrigin: true,
    opacity: 0.92,
    className: 'gibs-viirs-huracan'
  });
}

// Cadena de capas con fallback automático
function crearCapaVIIRS(diasAtras) {
  var candidates = [
    'VIIRS_NOAA21_CorrectedReflectance_TrueColor',
    'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
    'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    'MODIS_Terra_CorrectedReflectance_TrueColor'
  ];
  var idx = 0;
  var layer = crearGibsTile(candidates[idx], diasAtras);
  var switched = false;

  layer.on('tileerror', function() {
    if (switched) return;
    switched = true;
    idx++;
    if (idx < candidates.length) {
      console.warn('[Huracanes] Cambiando a: ' + candidates[idx]);
      try { map.removeLayer(layer); } catch(e) {}
      layer = crearGibsTile(candidates[idx], diasAtras);
      layer.on('tileerror', arguments.callee);
      layer.addTo(map);
      huracanesLayerVIIRS = layer;
    }
  });

  return layer;
}

// ================================================================
// DATOS NHC
// ================================================================

async function fetchNHCTormentas() {
  // 1: Directo
  try {
    var r = await fetch('https://www.nhc.noaa.gov/json/current_storms.json', {mode:'cors'});
    if (r.ok) return await r.json();
  } catch(e) { console.warn('[Huracanes] NHC directo fallo (CORS)'); }

  // 2: Proxy CORS
  try {
    var proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.nhc.noaa.gov/json/current_storms.json');
    var r2 = await fetch(proxy);
    if (r2.ok) { console.log('[Huracanes] NHC via proxy OK'); return await r2.json(); }
  } catch(e) { console.warn('[Huracanes] Proxy tambien fallo'); }

  // 3: Fallback (actualizar manualmente)
  return {
    activeStorms: [],
    lastKnown: {
      id: 'AL152026', name: 'Huracan Melissa', classification: 'HU',
      intensity: 85, pressure: 968,
      lat: 25.4, lon: -70.2,
      movement: 'NNW @ 12 nudos',
      advisory: 'Centro cerca de 25.4N 70.2W. Fortalecimiento gradual en 48h.',
      updated: new Date().toISOString(),
      source: 'fallback',
      // Forecast points para el cono (lat, lon, intensidad_nudos, horas)
      forecast: [
        {lat: 25.4, lon: -70.2, intensity: 85, hours: 0},
        {lat: 26.8, lon: -71.5, intensity: 90, hours: 12},
        {lat: 28.2, lon: -72.8, intensity: 95, hours: 24},
        {lat: 29.8, lon: -74.2, intensity: 100, hours: 36},
        {lat: 31.2, lon: -75.5, intensity: 95, hours: 48},
        {lat: 32.5, lon: -76.8, intensity: 85, hours: 72}
      ]
    }
  };
}

// ================================================================
// ANP SIN RELLENO (cuando sección huracanes activa)
// ================================================================

function anpSinRelleno() {
  try {
    if (typeof activeLayers === 'undefined' || !activeLayers['shp_anp']) return;
    var entry = activeLayers['shp_anp'];
    if (_savedAnpStyles) return; // ya guardado
    _savedAnpStyles = { hadCustom: true };
    entry.layer.eachLayer(function(sub) {
      try {
        if (sub.setStyle) {
          var current = sub.options || {};
          sub.setStyle({
            fillOpacity: 0,
            opacity: 0.7,
            weight: 1.5,
            color: current.color || '#6B1132'
          });
        }
      } catch(e) {}
    });
  } catch(e) {}
}

function anpRestaurarRelleno() {
  try {
    if (!_savedAnpStyles) return;
    if (typeof activeLayers === 'undefined' || !activeLayers['shp_anp']) { _savedAnpStyles = null; return; }
    var entry = activeLayers['shp_anp'];
    entry.layer.eachLayer(function(sub) {
      try {
        if (sub.setStyle) {
          sub.setStyle({ fillOpacity: 0.42, opacity: 0.88, weight: 2 });
        }
      } catch(e) {}
    });
    _savedAnpStyles = null;
  } catch(e) {}
}

// ================================================================
// CONO DE TRAYECTORIA PROBABLE (forecast cone)
// ================================================================

function renderConoTrayectoria(storm) {
  if (huracanesLayerCone) { try { map.removeLayer(huracanesLayerCone); } catch(e) {} huracanesLayerCone = null; }
  if (!storm) return;

  var fg = L.layerGroup();
  var points = storm.forecast || [];
  if (points.length < 2) points = [
    {lat: storm.lat, lon: storm.lon, intensity: storm.intensity, hours: 0},
    {lat: storm.lat + 1.5, lon: storm.lon - 1.2, intensity: (storm.intensity||60)+5, hours: 24},
    {lat: storm.lat + 3.0, lon: storm.lon - 2.5, intensity: (storm.intensity||60)+10, hours: 48},
    {lat: storm.lat + 4.5, lon: storm.lon - 3.8, intensity: (storm.intensity||60)+5, hours: 72}
  ];

  // 1. Línea de trayectoria (track)
  var trackCoords = points.map(function(p) { return [p.lat, p.lon]; });
  L.polyline(trackCoords, {
    color: '#FF4500', weight: 3, opacity: 0.8, dashArray: '10,5',
    className: 'huracan-track'
  }).addTo(fg);

  // 2. Cono de incertidumbre (círculos crecientes)
  points.forEach(function(p, i) {
    if (i === 0) return; // skip current position
    // Radio del cono: crece con tiempo (aprox NHC: 50km a 12h, 100km a 24h, 150km a 48h, 200km a 72h)
    var radiusKm = Math.round(50 * (p.hours / 12));
    var color = p.intensity >= 96 ? '#FF0000' : p.intensity >= 64 ? '#FF8C00' : '#FFD700';
    L.circle([p.lat, p.lon], {
      radius: radiusKm * 1000,
      color: color, weight: 1.5, opacity: 0.4,
      fillColor: color, fillOpacity: 0.06,
      className: 'huracan-cone'
    }).addTo(fg);

    // Punto de forecast
    L.circleMarker([p.lat, p.lon], {
      radius: 5, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
    }).addTo(fg).bindPopup(
      '<div style="font-family:Inter;font-size:0.7rem;min-width:160px;">' +
      '<b>+' + p.hours + 'h</b><br>' +
      '<b>Posición:</b> ' + p.lat.toFixed(1) + '°N, ' + Math.abs(p.lon).toFixed(1) + '°W<br>' +
      '<b>Vientos:</b> ' + p.intensity + ' nudos<br>' +
      '<b>Categoría:</b> ' + (p.intensity >= 64 ? 'HU Cat.' + (p.intensity >= 137 ? 5 : p.intensity >= 113 ? 4 : p.intensity >= 96 ? 3 : p.intensity >= 83 ? 2 : 1) : p.intensity >= 34 ? 'TS' : 'TD') +
      '</div>', {className: 'custom-popup'}
    );
  });

  huracanesLayerCone = fg.addTo(map);
}

// ================================================================
// DISTANCIA A TIERRA / ANP
// ================================================================

function calcularDistanciaTierra(storm) {
  if (!storm || !storm.lat) return null;
  var origin = [storm.lat, storm.lon];
  var minDistANP = null;
  var nearestANP = '';

  // Buscar la ANP más cercana
  try {
    if (typeof activeLayers !== 'undefined' && activeLayers['shp_anp'] && activeLayers['shp_anp'].featuresData) {
      var feats = activeLayers['shp_anp'].featuresData;
      for (var i = 0; i < feats.length; i++) {
        try {
          var f = feats[i];
          var bounds = L.geoJSON(f).getBounds();
          if (!bounds.isValid()) continue;
          var center = bounds.getCenter();
          var d = map.distance(origin, center) / 1000; // km
          if (minDistANP === null || d < minDistANP) {
            minDistANP = d;
            nearestANP = (f.properties && (f.properties.nombre || f.properties.nom || f.properties.NOMBRE)) || 'ANP';
          }
        } catch(e) {}
      }
    }
  } catch(e) {}

  // Distancia a la costa aproximada (usando límites de México)
  var minDistCosta = null;
  try {
    // Puntos de referencia costeros de México (Golfo + Caribe + Pacífico)
    var costa = [
      [25.9, -97.1], [23.5, -97.7], [21.0, -97.4],  // Golfo
      [18.6, -88.3], [20.5, -86.9], [21.5, -86.8],   // Yucatán/Quintana Roo
      [15.0, -92.0], [16.0, -95.0], [17.0, -100.0],   // Pacífico sur
      [19.0, -104.0], [21.0, -105.0], [23.0, -106.5], // Pacífico norte
      [28.0, -111.0], [30.0, -114.0], [32.0, -117.0]  // Baja California
    ];
    for (var j = 0; j < costa.length; j++) {
      var dc = map.distance(origin, costa[j]) / 1000;
      if (minDistCosta === null || dc < minDistCosta) minDistCosta = dc;
    }
  } catch(e) {}

  return {
    anp: minDistANP, anpName: nearestANP,
    costa: minDistCosta
  };
}

// ================================================================
// RENDERIZAR POSICIÓN
// ================================================================

function renderHuracanPosicion(storm) {
  if (huracanesLayerPos) { try { map.removeLayer(huracanesLayerPos); } catch(e) {} huracanesLayerPos = null; }
  if (!storm || !storm.lat) return;

  var lat = storm.lat, lon = storm.lon;
  huracanesLayerPos = L.layerGroup().addTo(map);

  // Ojo
  L.circleMarker([lat, lon], {
    radius: 12, fillColor: '#FF4500', color: '#fff', weight: 3,
    opacity: 1, fillOpacity: 0.9, className: 'huracan-ojo'
  }).addTo(huracanesLayerPos);

  // Anillo de vientos
  L.circle([lat, lon], {
    radius: ((storm.intensity || 60) * 2.2) * 1000,
    color: '#FF6347', weight: 2, fillColor: '#FF6347',
    fillOpacity: 0.06, dashArray: '8,6'
  }).addTo(huracanesLayerPos);

  // Popup
  var cls = {HU:'Huracán',TS:'Tormenta Tropical',TD:'Depresión Tropical',STD:'Subtormenta Tropical',STS:'Tormenta Subtropical'}[storm.classification] || storm.classification;
  var dist = calcularDistanciaTierra(storm);
  var distTxt = dist ? '<div style="margin-top:0.3rem;border-top:1px solid #ddd;padding-top:0.3rem;"><b>Distancia:</b><br>' +
    (dist.anp !== null ? 'A ANP más cercana (' + dist.anpName.substring(0, 20) + '): <b>' + Math.round(dist.anp) + ' km</b><br>' : '') +
    (dist.costa !== null ? 'A la costa: <b>' + Math.round(dist.costa) + ' km</b>' : '') + '</div>' : '';

  L.popup({
    className: 'custom-popup', closeButton: true, autoPan: false
  }).setLatLng([lat, lon]).setContent(
    '<div style="font-family:Inter,sans-serif;font-size:0.72rem;min-width:260px;">' +
    '<div style="background:linear-gradient(135deg,#FF4500,#8B0000);color:#fff;padding:0.5rem 0.7rem;font-weight:700;border-radius:6px 6px 0 0;display:flex;align-items:center;gap:0.4rem;">' +
    '<i class="fas fa-hurricane"></i> ' + cls + ' ' + (storm.name || '') + '</div>' +
    '<div style="padding:0.6rem 0.7rem;background:#fff;border-radius:0 0 6px 6px;">' +
    '<div><b>Posición:</b> ' + lat.toFixed(1) + '°N, ' + Math.abs(lon).toFixed(1) + '°W</div>' +
    '<div><b>Vientos:</b> ' + (storm.intensity || '—') + ' nudos (' + Math.round((storm.intensity||0)*1.852) + ' km/h)</div>' +
    '<div><b>Presión:</b> ' + (storm.pressure || '—') + ' mb</div>' +
    '<div><b>Movimiento:</b> ' + (storm.movement || '—') + '</div>' +
    '<div><b>Fecha:</b> ' + (storm.updated ? new Date(storm.updated).toLocaleString('es-MX', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—') + '</div>' +
    distTxt +
    '</div></div>'
  ).openOn(map);
}

// ================================================================
// PANEL
// ================================================================

function actualizarPanelHuracanes(data) {
  var el = document.getElementById('huracanes-info');
  if (!el) return;
  var storms = (data && data.activeStorms) || [];
  var last = (data && (data.lastKnown || storms[0])) || null;

  if (!last) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:0.8rem;">Sin tormentas activas reportadas.</p>';
    return;
  }

  var cls = {HU:'Huracán',TS:'Tormenta Tropical',TD:'Depresión Tropical'}[last.classification] || last.classification;
  var cat = '';
  if (last.classification === 'HU') {
    var v = last.intensity || 0;
    if (v >= 137) cat='5'; else if (v>=113) cat='4'; else if (v>=96) cat='3'; else if (v>=83) cat='2'; else if (v>=64) cat='1';
  }
  var fecha = last.updated ? new Date(last.updated).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
  var isFb = last.source === 'fallback';
  var dist = calcularDistanciaTierra(last);

  el.innerHTML = `
    <div style="background:linear-gradient(135deg,#FF4500,#8B0000);color:#fff;padding:0.7rem 0.8rem;border-radius:8px;margin-bottom:0.5rem;">
      <div style="font-size:0.9rem;font-weight:800;display:flex;align-items:center;gap:0.4rem;">
        <i class="fas fa-hurricane"></i> ${cls} ${last.name || ''}
        ${cat ? '<span style="background:rgba(255,255,255,0.2);padding:0.15rem 0.4rem;border-radius:4px;font-size:0.7rem;">Cat. '+cat+'</span>' : ''}
      </div>
      <div style="font-size:0.58rem;opacity:0.85;margin-top:0.2rem;">${isFb ? 'Referencia' : 'NHC'} · ${fecha}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.35rem;">
      <div class="huracan-stat"><div class="stat-lbl">POSICIÓN</div><div class="stat-val">${(last.lat||0).toFixed(1)}°N, ${Math.abs(last.lon||0).toFixed(1)}°W</div></div>
      <div class="huracan-stat"><div class="stat-lbl">VIENTOS</div><div class="stat-val">${last.intensity||'—'} kt</div></div>
      <div class="huracan-stat"><div class="stat-lbl">PRESIÓN</div><div class="stat-val">${last.pressure||'—'} mb</div></div>
      <div class="huracan-stat"><div class="stat-lbl">MOVIMIENTO</div><div class="stat-val" style="font-size:0.65rem;">${last.movement||'—'}</div></div>
    </div>
    ${dist ? `<div style="margin-top:0.5rem;padding:0.5rem;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:6px;font-size:0.65rem;">
      <div style="font-weight:700;color:var(--brand-secondary);margin-bottom:0.2rem;"><i class="fas fa-ruler"></i> Distancias</div>
      ${dist.anp !== null ? '<div>ANP más cercana: <b>' + dist.anpName.substring(0,20) + '</b> a <b>' + Math.round(dist.anp) + ' km</b></div>' : ''}
      ${dist.costa !== null ? '<div>Costa: <b>' + Math.round(dist.costa) + ' km</b></div>' : ''}
    </div>` : ''}
    <div style="margin-top:0.4rem;font-size:0.58rem;color:var(--text-muted);line-height:1.35;">
      <b>Imagen:</b> NASA GIBS · VIIRS NOAA-21 (~250m)<br>
      <b>Posición:</b> ${isFb ? 'Referencia (NHC no disponible por CORS)' : 'NOAA/NHC'}<br>
      <b>Cone:</b> Trayectoria probable 72h (aproximada)
    </div>
    ${storms.length > 0 ? '<div style="margin-top:0.4rem;font-size:0.62rem;color:var(--text-muted);">Total activas: <b>'+storms.length+'</b></div>' : ''}
  `;
}

// ================================================================
// INICIALIZAR / LIMPIAR
// ================================================================

function initHuracanes() {
  console.log('[Huracanes] Inicializando...');
  huracanesVisible = true;

  // 1. VIIRS tiles
  if (!huracanesLayerVIIRS) {
    huracanesLayerVIIRS = crearCapaVIIRS(0);
    huracanesLayerVIIRS.addTo(map);
  }

  // 2. ANP sin relleno
  anpSinRelleno();

  // 3. Panel: cargando
  var el = document.getElementById('huracanes-info');
  if (el) el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:0.8rem;"><i class="fas fa-spinner fa-spin"></i> Consultando NOAA/NHC...</p>';

  // 4. Fetch data (async)
  if (huracanesInitTimer) clearTimeout(huracanesInitTimer);
  huracanesInitTimer = setTimeout(async function() {
    try {
      var data = await fetchNHCTormentas();
      huracanesData = data;
      var storms = data.activeStorms || [];
      var last = data.lastKnown || storms[0] || null;

      if (last) {
        renderHuracanPosicion(last);
        renderConoTrayectoria(last);
        // Centrar en el huracán con zoom que muestre el cono completo
        if (last.lat && last.lon) {
          map.setView([last.lat, last.lon], 5);
        }
      }
      actualizarPanelHuracanes(data);
      console.log('[Huracanes] Completado. Storms:', storms.length, 'Source:', last ? (last.source || 'nhc') : 'none');
    } catch (e) {
      console.error('[Huracanes] init error:', e);
      actualizarPanelHuracanes(null);
    }
  }, 200);
}

function limpiarHuracanes() {
  if (huracanesInitTimer) { clearTimeout(huracanesInitTimer); huracanesInitTimer = null; }
  if (huracanesLayerVIIRS) { try { map.removeLayer(huracanesLayerVIIRS); } catch(e) {} huracanesLayerVIIRS = null; }
  if (huracanesLayerPos) { try { map.removeLayer(huracanesLayerPos); } catch(e) {} huracanesLayerPos = null; }
  if (huracanesLayerTrack) { try { map.removeLayer(huracanesLayerTrack); } catch(e) {} huracanesLayerTrack = null; }
  if (huracanesLayerCone) { try { map.removeLayer(huracanesLayerCone); } catch(e) {} huracanesLayerCone = null; }
  anpRestaurarRelleno();
  huracanesData = null;
  huracanesVisible = false;
}

function actualizarVIIRSFecha(dias) {
  if (huracanesLayerVIIRS) { try { map.removeLayer(huracanesLayerVIIRS); } catch(e) {} }
  huracanesLayerVIIRS = crearCapaVIIRS(dias);
  huracanesLayerVIIRS.addTo(map);
}

window.initHuracanes = initHuracanes;
window.limpiarHuracanes = limpiarHuracanes;
window.actualizarVIIRSFecha = actualizarVIIRSFecha;
