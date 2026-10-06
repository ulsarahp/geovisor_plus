// ================================================================
// HURACANES — Monitor de Huracanes con Panel de Riesgo
// Imagen: NASA GIBS WMTS — VIIRS NOAA-21 (reflectancia corregida)
// Posición: NOAA/NHC (proxy CORS + fallback)
// Panel: amplitud, dirección, ANP afectadas con semáforo quintiles
// ================================================================

let huracanesLayerVIIRS = null;
let huracanesLayerPos = null;
let huracanesLayerCone = null;
let huracanesLayerANP = null;
let huracanesData = null;
let huracanesVisible = false;
let huracanesInitTimer = null;
let _savedAnpStyles = null;

// Riesgo quintiles (rojo intenso → verde intenso)
const RIESGO = [
  { key:'muy_alto', label:'Muy Alto',  color:'#CC0000', bg:'#CC0000', text:'#fff', desc:'Impacto directo esperado' },
  { key:'alto',     label:'Alto',      color:'#FF4444', bg:'#FF4444', text:'#fff', desc:'Impacto probable' },
  { key:'medio',    label:'Medio',     color:'#FFAA00', bg:'#FFAA00', text:'#333', desc:'Riesgo moderado' },
  { key:'bajo',      label:'Bajo',      color:'#FFDD00', bg:'#FFDD00', text:'#333', desc:'Riesgo bajo' },
  { key:'muy_bajo',  label:'Muy Bajo',  color:'#00AA00', bg:'#00AA00', text:'#fff', desc:'Riesgo mínimo' }
];

const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/';
const GIBS_TMS = 'GoogleMapsCompatible_Level9';

function gibsFecha(d) { var dt = new Date(); dt.setDate(dt.getDate()-(d||1)); return dt.toISOString().split('T')[0]; }

function crearGibsTile(layer, dias) {
  return L.tileLayer(GIBS_BASE + layer + '/default/' + gibsFecha(dias) + '/' + GIBS_TMS + '/{z}/{y}/{x}.jpg', {
    attribution: 'NASA GIBS / EOSDIS · ' + layer,
    maxZoom: 9, bounds: [[-85.0511,-180],[85.0511,180]],
    crossOrigin: true, opacity: 0.92, className: 'gibs-viirs-huracan', pane: 'gibsPane'
  });
}

function crearCapaVIIRS(dias) {
  var chain = ['VIIRS_NOAA21_CorrectedReflectance_TrueColor','VIIRS_NOAA20_CorrectedReflectance_TrueColor','VIIRS_SNPP_CorrectedReflectance_TrueColor','MODIS_Terra_CorrectedReflectance_TrueColor'];
  var idx = 0, switched = false;
  var layer = crearGibsTile(chain[idx], dias);
  layer.on('tileerror', function() {
    if (switched) return; switched = true; idx++;
    if (idx < chain.length) {
      try { map.removeLayer(layer); } catch(e) {}
      layer = crearGibsTile(chain[idx], dias);
      layer.on('tileerror', arguments.callee);
      layer.addTo(map); huracanesLayerVIIRS = layer;
    }
  });
  return layer;
}

// ================================================================
// NHC DATA
// ================================================================

async function fetchNHCTormentas() {
  try {
    var r = await fetch('https://www.nhc.noaa.gov/json/current_storms.json', {mode:'cors'});
    if (r.ok) return await r.json();
  } catch(e) {}
  try {
    var r2 = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.nhc.noaa.gov/json/current_storms.json'));
    if (r2.ok) return await r2.json();
  } catch(e) {}
  return {
    activeStorms: [],
    lastKnown: {
      name: 'Melissa', classification: 'HU', intensity: 85, pressure: 968,
      lat: 22.4, lon: -78.2, movement: 'WNW @ 13 nudos',
      advisory: 'Centro cerca de 22.4N 78.2W, al E de Cuba. Se espera giro hacia el N y fortalecimiento.',
      updated: new Date().toISOString(), source: 'fallback',
      forecast: [
        {lat:22.4, lon:-78.2, intensity:85, hours:0},
        {lat:23.6, lon:-79.5, intensity:90, hours:12},
        {lat:25.0, lon:-80.8, intensity:95, hours:24},
        {lat:26.5, lon:-82.0, intensity:100, hours:36},
        {lat:28.0, lon:-83.2, intensity:95, hours:48},
        {lat:29.5, lon:-84.5, intensity:85, hours:72}
      ]
    }
  };
}

// ================================================================
// CÁLCULOS
// ================================================================

function getSaffirSimpson(intensity) {
  if (intensity >= 137) return {cat:5, label:'Categoría 5'};
  if (intensity >= 113) return {cat:4, label:'Categoría 4'};
  if (intensity >= 96) return {cat:3, label:'Categoría 3'};
  if (intensity >= 83) return {cat:2, label:'Categoría 2'};
  if (intensity >= 64) return {cat:1, label:'Categoría 1'};
  return {cat:0, label:'Tormenta Tropical'};
}

function getAmplitudMax(intensity) {
  // Amplitud = radio de vientos máximos sostenidos (km, aproximación)
  var kt = intensity || 60;
  if (kt >= 137) return { radio: 60, vientos: kt, label: 'Extrema (>250 km/h)' };
  if (kt >= 96) return { radio: 80, vientos: kt, label: 'Muy fuerte (180-250 km/h)' };
  if (kt >= 64) return { radio: 100, vientos: kt, label: 'Fuerte (120-180 km/h)' };
  if (kt >= 34) return { radio: 150, vientos: kt, label: 'Moderada (63-120 km/h)' };
  return { radio: 200, vientos: kt, label: 'Moderada (<63 km/h)' };
}

function getDireccion(storm) {
  if (!storm || !storm.movement) return '—';
  var mv = storm.movement.toLowerCase();
  var dirs = {
    'n':'Norte (N, 0°)','nne':'Noroeste-Norte (NNE, 22.5°)','ne':'Noreste (NE, 45°)',
    'ene':'Este-Noreste (ENE, 67.5°)','e':'Este (E, 90°)','ese':'Este-Sureste (ESE, 112.5°)',
    'se':'Sureste (SE, 135°)','sse':'Sur-Sureste (SSE, 157.5°)','s':'Sur (S, 180°)',
    'ssw':'Sur-Suroeste (SSO, 202.5°)','sw':'Suroeste (SO, 225°)','wsw':'Oeste-Suroeste (OSO, 247.5°)',
    'w':'Oeste (O, 270°)','wnw':'Oeste-Noroeste (ONO, 292.5°)','nw':'Noroeste (NO, 315°)',
    'nnw':'Norte-Noroeste (NNO, 337.5°)'
  };
  for (var k in dirs) { if (mv.includes(k)) return dirs[k]; }
  return storm.movement;
}

// Evaluar riesgo de un ANP según distancia al track del huracán
function evaluarRiesgoANP(distKm, intensity) {
  var kt = intensity || 60;
  // Normalizar distancia por intensidad
  var factor = kt >= 96 ? 1.0 : kt >= 64 ? 0.8 : kt >= 34 ? 0.6 : 0.4;
  var distNorm = distKm / factor;
  if (distNorm < 100) return 0; // muy_alto
  if (distNorm < 200) return 1; // alto
  if (distNorm < 350) return 2; // medio
  if (distNorm < 500) return 3; // bajo
  return 4; // muy_bajo
}

// Calcular distancias y riesgos para todas las ANP
function evaluarANPs(storm) {
  if (!storm || !storm.lat) return [];
  var results = [];
  try {
    if (typeof activeLayers === 'undefined' || !activeLayers['shp_anp'] || !activeLayers['shp_anp'].featuresData) return results;
    var feats = activeLayers['shp_anp'].featuresData;
    var origin = [storm.lat, storm.lon];

    // Track forecast para distancia mínima al track
    var trackCoords = (storm.forecast || []).map(function(p) { return [p.lat, p.lon]; });
    if (trackCoords.length < 2) trackCoords = [[storm.lat, storm.lon]];

    for (var i = 0; i < feats.length; i++) {
      try {
        var f = feats[i];
        var bounds = L.geoJSON(f).getBounds();
        if (!bounds.isValid()) continue;
        var center = bounds.getCenter();
        var dist = map.distance(origin, center) / 1000;

        // Distancia mínima al track (simplificada: distancia a cada punto del track)
        var minDistTrack = dist;
        for (var j = 0; j < trackCoords.length; j++) {
          var dt = map.distance(center, trackCoords[j]) / 1000;
          if (dt < minDistTrack) minDistTrack = dt;
        }

        var nombre = (f.properties && (f.properties.nombre || f.properties.nom || f.properties.NOMBRE)) || 'ANP';
        var riesgo = evaluarRiesgoANP(minDistTrack, storm.intensity);

        results.push({
          nombre: nombre,
          dist: Math.round(dist),
          distTrack: Math.round(minDistTrack),
          riesgo: riesgo,
          lat: center.lat, lng: center.lng,
          layer: f
        });
      } catch(e) {}
    }
    // Ordenar por riesgo (más crítico primero) y luego por distancia
    results.sort(function(a, b) { return a.riesgo - b.riesgo || a.distTrack - b.distTrack; });
  } catch(e) {}
  return results;
}

// ================================================================
// RENDER MAPA
// ================================================================

function anpSinRelleno(storm) {
  try {
    if (typeof activeLayers === 'undefined' || !activeLayers['shp_anp']) return;
    var entry = activeLayers['shp_anp'];
    var anpEval = evaluarANPs(storm);
    if (_savedAnpStyles) return;
    _savedAnpStyles = true;

    entry.layer.eachLayer(function(sub) {
      try {
        if (!sub.setStyle || !sub.feature) return;
        var p = sub.feature.properties;
        var nombre = (p && (p.nombre || p.nom || p.NOMBRE)) || '';
        var riesgo = -1;
        for (var i = 0; i < anpEval.length; i++) {
          if (anpEval[i].nombre === nombre) { riesgo = anpEval[i].riesgo; break; }
        }
        var color = riesgo >= 0 ? RIESGO[riesgo].color : '#6B1132';
        sub.setStyle({
          fillOpacity: 0,
          opacity: 0.8,
          weight: riesgo >= 0 && riesgo <= 2 ? 3 : 1.5,
          color: color
        });
      } catch(e) {}
    });
  } catch(e) {}
}

function anpRestaurar() {
  try {
    if (!_savedAnpStyles) return;
    if (typeof activeLayers !== 'undefined' && activeLayers['shp_anp']) {
      activeLayers['shp_anp'].layer.eachLayer(function(sub) {
        try { if (sub.setStyle) sub.setStyle({fillOpacity: 0.42, opacity: 0.88, weight: 2, color: '#6B1132'}); } catch(e) {}
      });
    }
    _savedAnpStyles = null;
  } catch(e) {}
}

function renderPosicion(storm) {
  if (huracanesLayerPos) { try { map.removeLayer(huracanesLayerPos); } catch(e) {} huracanesLayerPos = null; }
  if (!storm || !storm.lat) return;
  var fg = L.layerGroup();
  var lat = storm.lat, lon = storm.lon;

  L.circleMarker([lat, lon], {
    radius: 12, fillColor: '#FF4500', color: '#fff', weight: 3,
    opacity: 1, fillOpacity: 0.9, className: 'huracan-ojo'
  }).addTo(fg);

  L.circle([lat, lon], {
    radius: ((storm.intensity || 60) * 2.2) * 1000,
    color: '#FF6347', weight: 2, fillColor: '#FF6347', fillOpacity: 0.06, dashArray: '8,6'
  }).addTo(fg);

  var cls = {HU:'Huracán',TS:'Tormenta Tropical',TD:'Depresión Tropical'}[storm.classification] || '';
  var amp = getAmplitudMax(storm.intensity);
  var dist = null;
  try {
    var anpE = evaluarANPs(storm);
    if (anpE.length) dist = anpE[0].distTrack;
  } catch(e) {}

  L.popup({className:'custom-popup', closeButton:true}).setLatLng([lat,lon]).setContent(
    '<div style="font-family:Inter;font-size:0.72rem;min-width:280px;">' +
    '<div style="background:linear-gradient(135deg,#FF4500,#8B0000);color:#fff;padding:0.5rem 0.7rem;font-weight:700;border-radius:6px 6px 0 0;">' +
    '<i class="fas fa-hurricane"></i> ' + cls + ' ' + (storm.name||'') + '</div>' +
    '<div style="padding:0.6rem 0.7rem;background:#fff;border-radius:0 0 6px 6px;">' +
    '<div><b>Posición:</b> ' + lat.toFixed(1) + '°N, ' + Math.abs(lon).toFixed(1) + '°W</div>' +
    '<div><b>Vientos:</b> ' + (storm.intensity||'—') + ' kt (' + Math.round((storm.intensity||0)*1.852) + ' km/h)</div>' +
    '<div><b>Presión:</b> ' + (storm.pressure||'—') + ' mb</div>' +
    '<div><b>Amplitud máx:</b> ~' + amp.radio + ' km (' + amp.label + ')</div>' +
    '<div><b>Dirección:</b> ' + getDireccion(storm) + '</div>' +
    (dist !== null ? '<div><b>ANP más cercana:</b> ' + dist + ' km</div>' : '') +
    '</div></div>'
  ).openOn(map);

  huracanesLayerPos = fg.addTo(map);
}

function renderCono(storm) {
  if (huracanesLayerCone) { try { map.removeLayer(huracanesLayerCone); } catch(e) {} huracanesLayerCone = null; }
  if (!storm) return;
  var fg = L.layerGroup();
  var points = storm.forecast || [];
  if (points.length < 2) return;

  var trackCoords = points.map(function(p) { return [p.lat, p.lon]; });
  L.polyline(trackCoords, {color:'#FF4500', weight:3, opacity:0.8, dashArray:'10,5', className:'huracan-track'}).addTo(fg);

  points.forEach(function(p, i) {
    if (i === 0) return;
    var radiusKm = Math.round(50 * (p.hours / 12));
    var color = p.intensity >= 96 ? '#CC0000' : p.intensity >= 64 ? '#FF8C00' : '#FFD700';
    L.circle([p.lat, p.lon], {radius:radiusKm*1000, color:color, weight:1.5, opacity:0.4, fillColor:color, fillOpacity:0.06, className:'huracan-cone'}).addTo(fg);
    L.circleMarker([p.lat, p.lon], {radius:5, fillColor:color, color:'#fff', weight:2, fillOpacity:0.9}).addTo(fg)
      .bindPopup('<b>+' + p.hours + 'h</b> · ' + p.lat.toFixed(1) + '°N, ' + Math.abs(p.lon).toFixed(1) + '°W · ' + p.intensity + ' kt', {className:'custom-popup'});
  });

  huracanesLayerCone = fg.addTo(map);
}

// ================================================================
// PANEL HTML (estilo incendios)
// ================================================================

function renderPanel(storm) {
  var el = document.getElementById('huracanes-info');
  if (!el) return;

  if (!storm) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;">Sin datos de huracanes disponibles.</p>';
    return;
  }

  var cls = {HU:'Huracán',TS:'Tormenta Tropical',TD:'Depresión Tropical'}[storm.classification] || '';
  var ss = getSaffirSimpson(storm.intensity);
  var amp = getAmplitudMax(storm.intensity);
  var dir = getDireccion(storm);
  var anpEval = evaluarANPs(storm);
  var isFb = storm.source === 'fallback';
  var fecha = storm.updated ? new Date(storm.updated).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';

  // Agrupar ANP por riesgo
  var anpPorRiesgo = [[],[],[],[],[]];
  anpEval.forEach(function(a) { if (a.riesgo >= 0 && a.riesgo < 5) anpPorRiesgo[a.riesgo].push(a); });
  var totalEnRiesgo = anpPorRiesgo[0].length + anpPorRiesgo[1].length + anpPorRiesgo[2].length;

  // Calcular distancias resumen
  var distCerca = anpEval.length ? anpEval[0].distTrack : null;

  var html = `
    <!-- TARJETA PRINCIPAL -->
    <div style="background:linear-gradient(135deg,#FF4500,#8B0000);color:#fff;padding:0.7rem 0.8rem;border-radius:8px;margin-bottom:0.5rem;">
      <div style="font-size:0.95rem;font-weight:800;display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
        <i class="fas fa-hurricane"></i> ${cls} ${storm.name||''}
        ${ss.cat > 0 ? '<span style="background:rgba(255,255,255,0.25);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.75rem;">Cat. '+ss.cat+'</span>' : ''}
      </div>
      <div style="font-size:0.58rem;opacity:0.85;margin-top:0.15rem;">${isFb?'Referencia':'NHC'} · ${fecha}</div>
    </div>

    <!-- KPIs BÁSICOS -->
    <div class="incendios-kpi-row">
      <div class="incendios-kpi" style="border-left:4px solid #FF4500;">
        <div class="kpi-lbl">VIENTOS</div>
        <div class="kpi-val" style="color:#FF4500;font-size:0.95rem;">${storm.intensity||'—'}</div>
        <div style="font-size:0.5rem;color:var(--text-muted);">${Math.round((storm.intensity||0)*1.852)} km/h</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #4682B4;">
        <div class="kpi-lbl">PRESIÓN</div>
        <div class="kpi-val" style="color:#4682B4;font-size:0.95rem;">${storm.pressure||'—'}</div>
        <div style="font-size:0.5rem;color:var(--text-muted);">mb</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #FF8C00;">
        <div class="kpi-lbl">AMPL. MÁX</div>
        <div class="kpi-val" style="color:#FF8C00;font-size:0.95rem;">${amp.radio}</div>
        <div style="font-size:0.5rem;color:var(--text-muted);">km · ${amp.label}</div>
      </div>
    </div>
    <div class="incendios-kpi-row">
      <div class="incendios-kpi" style="border-left:4px solid #6B1132;grid-column:span 2;">
        <div class="kpi-lbl">DIRECCIÓN PROBABLE</div>
        <div class="kpi-val" style="font-size:0.78rem;">${dir}</div>
        <div style="font-size:0.5rem;color:var(--text-muted);">${storm.movement||''}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #1a5c4e;">
        <div class="kpi-lbl">ANP EN RIESGO</div>
        <div class="kpi-val" style="color:${totalEnRiesgo > 0 ? '#CC0000' : '#00AA00'};font-size:0.95rem;">${totalEnRiesgo}</div>
        <div style="font-size:0.5rem;color:var(--text-muted);">de ${anpEval.length} ANP</div>
      </div>
    </div>

    <!-- LEYENDA SEMÁFORO -->
    <div style="margin-top:0.5rem;padding:0.4rem 0.5rem;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:6px;">
      <div style="font-size:0.6rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem;display:flex;align-items:center;gap:0.3rem;">
        <i class="fas fa-traffic-light"></i> Nivel de Riesgo por ANP
      </div>
      <div style="display:flex;gap:0.25rem;flex-wrap:wrap;">
        ${RIESGO.map(function(r) {
          var count = anpPorRiesgo[RIESGO.indexOf(r)].length;
          return '<div style="flex:1;min-width:55px;text-align:center;padding:0.2rem 0.3rem;background:'+r.bg+';color:'+r.text+';border-radius:4px;font-size:0.55rem;font-weight:700;" title="'+r.desc+'">'+r.label+'<br><span style="font-size:0.7rem;">'+count+'</span></div>';
        }).join('')}
      </div>
    </div>

    <!-- TABLA ANP CON RIESGO (top 10) -->
    ${anpEval.length > 0 ? `
    <div style="margin-top:0.5rem;max-height:220px;overflow-y:auto;">
      <div style="font-size:0.6rem;font-weight:700;color:var(--text-primary);margin-bottom:0.25rem;">
        <i class="fas fa-map-marker-alt"></i> ANP con Posibles Afectaciones (${Math.min(anpEval.length,10)} de ${anpEval.length})
      </div>
      ${anpEval.slice(0,10).map(function(a) {
        var r = RIESGO[a.riesgo];
        return '<div style="display:flex;align-items:center;gap:0.35rem;padding:0.25rem 0.35rem;margin-bottom:0.15rem;background:var(--bg-glass);border-radius:4px;border-left:3px solid '+r.color+';font-size:0.6rem;">' +
          '<span style="flex:1;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+a.nombre+'">'+a.nombre+'</span>' +
          '<span style="color:var(--text-muted);min-width:45px;text-align:right;">'+a.distTrack+' km</span>' +
          '<span style="background:'+r.bg+';color:'+r.text+';padding:0.1rem 0.35rem;border-radius:3px;font-weight:700;font-size:0.52rem;min-width:52px;text-align:center;">'+r.label+'</span>' +
        '</div>';
      }).join('')}
    </div>` : '<div style="margin-top:0.5rem;text-align:center;font-size:0.65rem;color:var(--text-muted);padding:0.5rem;">Carga la capa ANP para evaluar afectaciones.</div>'}

    <!-- FUENTES -->
    <div style="margin-top:0.5rem;font-size:0.55rem;color:var(--text-muted);line-height:1.35;border-top:1px solid var(--border-subtle);padding-top:0.4rem;">
      <b>Imagen:</b> NASA GIBS · VIIRS NOAA-21 (~250m)<br>
      <b>Posición:</b> ${isFb?'Referencia (NHC no disponible por CORS)':'NOAA/NHC'}<br>
      <b>Riesgo:</b> Estimación por distancia al track + intensidad<br>
      ${storm.advisory ? '<b>Aviso:</b> '+storm.advisory.substring(0,100)+'...' : ''}
    </div>
  `;

  el.innerHTML = html;
}

// ================================================================
// INIT / CLEANUP
// ================================================================

function initHuracanes() {
  console.log('[Huracanes] init');
  huracanesVisible = true;

  if (!huracanesLayerVIIRS) {
    huracanesLayerVIIRS = crearCapaVIIRS(2);
    try{ if(!map.getPane("gibsPane")){ map.createPane("gibsPane"); map.getPane("gibsPane").style.zIndex = 450; map.getPane("gibsPane").style.pointerEvents = "none"; } }catch(e){} huracanesLayerVIIRS.addTo(map);
  }

  var el = document.getElementById('huracanes-info');
  if (el) el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;"><i class="fas fa-spinner fa-spin"></i> Consultando NOAA/NHC...</p>';

  if (huracanesInitTimer) clearTimeout(huracanesInitTimer);
  huracanesInitTimer = setTimeout(async function() {
    try {
      var data = await fetchNHCTormentas();
      huracanesData = data;
      var storms = data.activeStorms || [];
      var last = data.lastKnown || storms[0] || null;

      if (last) {
        renderPosicion(last);
        renderCono(last);
        anpSinRelleno(last);
        map.setView([last.lat, last.lon], 5);
      }
      renderPanel(last);
    } catch (e) {
      console.error('[Huracanes] error:', e);
      renderPanel(null);
    }
  }, 200);
}

function limpiarHuracanes() {
  if (huracanesInitTimer) { clearTimeout(huracanesInitTimer); huracanesInitTimer = null; }
  ['huracanesLayerVIIRS','huracanesLayerPos','huracanesLayerCone'].forEach(function(k) {
    if (window[k]) { try { map.removeLayer(window[k]); } catch(e) {} }
  });
  huracanesLayerVIIRS = null; huracanesLayerPos = null; huracanesLayerCone = null;
  anpRestaurar();
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
window.RIESGO_HURACAN = RIESGO;
