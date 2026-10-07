// ================================================================
// HURACANES — Monitor de Huracanes (Atlántico + Pacífico Oriental)
// Fuentes: NOAA/NHC GIS RSS feeds (gis-at.xml + gis-ep.xml)
// Imagen: NASA GIBS WMTS — VIIRS NOAA-21 (reflectancia corregida)
// Panel: tarjeta expandible por cada tormenta activa
// ================================================================

let huracanesLayerVIIRS = null;
let huracanesLayerPos = null;
let huracanesLayerCone = null;
let huracanesData = null;
let huracanesVisible = false;
let huracanesInitTimer = null;
let _savedAnpStyles = null;
let _selectedStorm = null;

// Riesgo quintiles (rojo intenso → verde intenso)
const RIESGO = [
  { key:'muy_alto', label:'Muy Alto',  color:'#CC0000', bg:'#CC0000', text:'#fff', desc:'Impacto directo esperado' },
  { key:'alto',     label:'Alto',      color:'#FF4444', bg:'#FF4444', text:'#fff', desc:'Impacto probable' },
  { key:'medio',    label:'Medio',     color:'#FFAA00', bg:'#FFAA00', text:'#333', desc:'Riesgo moderado' },
  { key:'bajo',      label:'Bajo',      color:'#FFDD00', bg:'#FFDD00', text:'#333', desc:'Riesgo bajo' },
  { key:'muy_bajo',  label:'Muy Bajo',  color:'#00AA00', bg:'#00AA00', text:'#fff', desc:'Riesgo mínimo' }
];

const RSS_ATLANTICO = 'https://www.nhc.noaa.gov/gis-at.xml';
const RSS_PACIFICO = 'https://www.nhc.noaa.gov/gis-ep.xml';
const PROXY = 'https://api.allorigins.win/raw?url=';

// ================================================================
// GIBS (usa constantes de incendios.js que carga primero)
// ================================================================

function gibsFecha(d) { var dt = new Date(); dt.setDate(dt.getDate()-(d||1)); return dt.toISOString().split('T')[0]; }

function crearGibsTile(layer, dias) {
  var fecha = gibsFecha(dias);
  var url = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/' + layer +
    '/default/' + fecha + '/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';
  console.log('[Huracanes] Tile URL:', url.replace('{z}','3').replace('{y}','4').replace('{x}','5'));
  return L.tileLayer(url, {
    attribution: 'NASA GIBS / EOSDIS · ' + layer,
    maxNativeZoom: 9, maxZoom: (map ? map.getMaxZoom() : 19),
    zIndex: 500, crossOrigin: true, opacity: 0.92,
    className: 'gibs-viirs-huracan'
  });
}

function crearCapaVIIRS(dias) {
  var chain = ['VIIRS_NOAA21_CorrectedReflectance_TrueColor','VIIRS_NOAA20_CorrectedReflectance_TrueColor','VIIRS_SNPP_CorrectedReflectance_TrueColor','MODIS_Terra_CorrectedReflectance_TrueColor'];
  var idx = 0, switched = false;
  var layer = crearGibsTile(chain[idx], dias);
  layer.on('tileerror', function() {
    if (switched) return; switched = true; idx++;
    if (idx < chain.length) {
      console.warn('[Huracanes] Cambiando a: ' + chain[idx]);
      try { map.removeLayer(layer); } catch(e) {}
      layer = crearGibsTile(chain[idx], dias);
      layer.on('tileerror', arguments.callee);
      layer.addTo(map); huracanesLayerVIIRS = layer;
    }
  });
  return layer;
}

// ================================================================
// PARSER NHC RSS — extrae tormentas activas de ambos feeds
// ================================================================

function parseNHCRss(xmlText, basin) {
  var storms = [];
  try {
    var parser = new DOMParser();
    var xml = parser.parseFromString(xmlText, 'text/xml');
    var items = xml.querySelectorAll('item');

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var title = (item.querySelector('title') || {}).textContent || '';
      var desc = (item.querySelector('description') || {}).textContent || '';

      // Solo procesar "Summary" items (evita advisories, watches, etc.)
      if (!title.toLowerCase().includes('summary')) continue;

      // Extraer nombre y clasificación: "Summary - Hurricane Rachel (EP3/EP182026)"
      var nameMatch = title.match(/Summary\s*-\s*(Hurricane|Tropical Storm|Tropical Depression|Subtropical Storm|Potential Tropical Cyclone)\s+(.+?)\s*\((.+)\)/i);
      if (!nameMatch) continue;

      var classification_full = nameMatch[1];
      var name = nameMatch[2];
      var storm_id = nameMatch[3];

      // Clasificación corta
      var classification = 'TS';
      if (classification_full.toLowerCase().includes('hurricane')) classification = 'HU';
      else if (classification_full.toLowerCase().includes('tropical depression')) classification = 'TD';
      else if (classification_full.toLowerCase().includes('subtropical')) classification = 'STS';

      // Parsear posición del description:
      // "the center of Rachel was located near 20.5, -120.1 with movement W at 7 mph"
      var posMatch = desc.match(/center of\s+.+?\s+was located near\s+(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
      var lat = posMatch ? parseFloat(posMatch[1]) : null;
      var lon = posMatch ? parseFloat(posMatch[2]) : null;

      // Movement: "with movement W at 7 mph"
      var mvMatch = desc.match(/movement\s+(\w+)\s+at\s+(\d+)\s+mph/i);
      var movement = mvMatch ? (mvMatch[1] + ' @ ' + mvMatch[2] + ' mph') : '—';

      // Pressure: "minimum central pressure was 979 mb"
      var prMatch = desc.match(/pressure\s+was\s+(\d+)\s+mb/i);
      var pressure = prMatch ? parseInt(prMatch[1]) : null;

      // Wind speed: "maximum sustained winds of about 80 mph"
      var windMatch = desc.match(/sustained winds?\s+of\s+(?:about\s+)?(\d+)\s+mph/i);
      var windMph = windMatch ? parseInt(windMatch[1]) : null;
      var intensity = windMph ? Math.round(windMph * 0.869) : null; // mph → nudos

      if (lat === null || lon === null) continue;

      storms.push({
        id: storm_id, name: name, classification: classification,
        classification_full: classification_full,
        lat: lat, lon: lon, movement: movement,
        pressure: pressure, intensity: intensity,
        windMph: windMph,
        advisory: desc.substring(0, 250),
        updated: new Date().toISOString(),
        source: 'nhc-rss', basin: basin,
        forecast: generarForecastSimple(lat, lon, movement, intensity)
      });
    }
  } catch (e) { console.warn('[Huracanes] RSS parse error:', e); }
  return storms;
}

// Generar forecast track aproximado basado en movimiento actual
function generarForecastSimple(lat, lon, movement, intensity) {
  var pts = [{lat: lat, lon: lon, intensity: intensity || 40, hours: 0}];
  // Parse direction: "WNW @ 13 mph" or "W at 7 mph"
  var dirMatch = movement.match(/(\w+)/);
  var speedMatch = movement.match(/(\d+)/);
  var dir = dirMatch ? dirMatch[1].toUpperCase() : 'W';
  var speed = speedMatch ? parseInt(speedMatch[1]) : 8; // mph
  var speedKt = speed * 0.869 || 7;

  // Direcciones → dLat/dLon por 6h
  var dirMap = { N:[1,0], NNE:[0.9,-0.4], NE:[0.7,-0.7], ENE:[0.4,-0.9], E:[0,-1], ESE:[-0.4,-0.9], SE:[-0.7,-0.7], SSE:[-0.9,-0.4], S:[-1,0], SSW:[-0.9,0.4], SW:[-0.7,0.7], WSW:[-0.4,0.9], W:[0,1], WNW:[0.4,0.9], NW:[0.7,0.7], NNW:[0.9,0.4] };
  var d = dirMap[dir] || [0, 1];
  // En el Atlántico, oeste = lon más negativo (hacia México)
  var dLon = -d[1]; // negate porque en hemisferio occidental, W = lon más negativo
  var dLat = d[0];

  var hours = [12, 24, 36, 48, 72];
  hours.forEach(function(h) {
    var steps = h / 6;
    var fLat = lat + dLat * steps * (speedKt / 30);
    var fLon = lon + dLon * steps * (speedKt / 30);
    var fIntensity = Math.max(25, (intensity || 40) + Math.round((Math.random() - 0.4) * 20));
    pts.push({lat: fLat, lon: fLon, intensity: fIntensity, hours: h});
  });
  return pts;
}

// Fetch ambos feeds (Atlántico + Pacífico) con proxy CORS
async function fetchTormentasNHC() {
  var storms = [];

  // Intento 1: fetch directo (probablemente CORS bloqueado)
  var urls = [
    { url: RSS_ATLANTICO, basin: 'Atlántico' },
    { url: RSS_PACIFICO, basin: 'Pacífico Oriental' }
  ];

  for (var i = 0; i < urls.length; i++) {
    var u = urls[i];
    // Directo
    try {
      var r = await fetch(u.url, { mode: 'cors' });
      if (r.ok) {
        var txt = await r.text();
        var s = parseNHCRss(txt, u.basin);
        if (s.length) { storms = storms.concat(s); console.log(`[Huracanes] ${u.basin}: ${s.length} tormenta(s) via directo`); }
        continue;
      }
    } catch (e) { console.warn(`[Huracanes] ${u.basin} directo fallo (CORS)`); }

    // Proxy
    try {
      var r2 = await fetch(PROXY + encodeURIComponent(u.url));
      if (r2.ok) {
        var txt2 = await r2.text();
        var s2 = parseNHCRss(txt2, u.basin);
        if (s2.length) { storms = storms.concat(s2); console.log(`[Huracanes] ${u.basin}: ${s2.length} tormenta(s) via proxy`); }
      }
    } catch (e) { console.warn(`[Huracanes] ${u.basin} proxy fallo`); }
  }

  // Fallback con datos de referencia
  if (storms.length === 0) {
    console.warn('[Huracanes] Ningún feed accesible, usando datos de referencia');
    return getFallbackTormentas();
  }
  return storms;
}

function getFallbackTormentas() {
  return [
    {
      id: 'EP182026', name: 'Rachel', classification: 'HU', classification_full: 'Hurricane',
      lat: 20.5, lon: -120.1, movement: 'W @ 7 mph',
      pressure: 979, intensity: 70, windMph: 80,
      advisory: 'Centro cerca de 20.5N 120.1W, al OSW de la Península de Baja California. Debilitamiento gradual.',
      updated: new Date().toISOString(), source: 'fallback', basin: 'Pacífico Oriental',
      forecast: [
        {lat:20.5, lon:-120.1, intensity:70, hours:0},
        {lat:20.3, lon:-122.0, intensity:60, hours:12},
        {lat:20.1, lon:-124.0, intensity:50, hours:24},
        {lat:19.9, lon:-126.0, intensity:40, hours:36},
        {lat:19.7, lon:-128.0, intensity:35, hours:48},
        {lat:19.5, lon:-130.0, intensity:30, hours:72}
      ]
    },
    {
      id: 'AL092026', name: 'Nine', classification: 'TD', classification_full: 'Tropical Depression',
      lat: 22.1, lon: -95.6, movement: 'E @ 5 mph',
      pressure: 1007, intensity: 30, windMph: 35,
      advisory: 'Depresión Tropical Nine en el Golfo de México. Se prevé fortalecimiento rápido.',
      updated: new Date().toISOString(), source: 'fallback', basin: 'Atlántico',
      forecast: [
        {lat:22.1, lon:-95.6, intensity:30, hours:0},
        {lat:22.0, lon:-94.8, intensity:35, hours:12},
        {lat:21.9, lon:-94.0, intensity:45, hours:24},
        {lat:21.8, lon:-93.2, intensity:55, hours:36},
        {lat:21.7, lon:-92.5, intensity:60, hours:48},
        {lat:21.6, lon:-91.8, intensity:50, hours:72}
      ]
    }
  ];
}

// ================================================================
// CÁLCULOS (riesgo, distancia, etc.)
// ================================================================

function getSaffirSimpson(intensity) {
  if (intensity >= 137) return {cat:5, label:'Categoría 5'};
  if (intensity >= 113) return {cat:4, label:'Categoría 4'};
  if (intensity >= 96) return {cat:3, label:'Categoría 3'};
  if (intensity >= 83) return {cat:2, label:'Categoría 2'};
  if (intensity >= 64) return {cat:1, label:'Categoría 1'};
  return {cat:0, label:'Tropical'};
}

function getAmplitudMax(intensity) {
  var kt = intensity || 60;
  if (kt >= 137) return {radio: 60, label: 'Extrema'};
  if (kt >= 96) return {radio: 80, label: 'Muy fuerte'};
  if (kt >= 64) return {radio: 100, label: 'Fuerte'};
  if (kt >= 34) return {radio: 150, label: 'Moderada'};
  return {radio: 200, label: 'Moderada'};
}

function getDireccion(storm) {
  if (!storm || !storm.movement) return '—';
  var mv = storm.movement.toUpperCase();
  var dirs = {N:'Norte (N)',NNE:'Noroeste-Norte (NNE)',NE:'Noreste (NE)',ENE:'Este-Noreste (ENE)',E:'Este (E)',ESE:'Este-Sureste (ESE)',SE:'Sureste (SE)',SSE:'Sur-Sureste (SSE)',S:'Sur (S)',SSW:'Sur-Suroeste (SSO)',SW:'Suroeste (SO)',WSW:'Oeste-Suroeste (OSO)',W:'Oeste (O)',WNW:'Oeste-Noroeste (ONO)',NW:'Noroeste (NO)',NNW:'Norte-Noroeste (NNO)'};
  for (var k in dirs) { if (mv.startsWith(k)) return dirs[k]; }
  return storm.movement;
}

function evaluarRiesgoANP(distKm, intensity) {
  var kt = intensity || 60;
  var factor = kt >= 96 ? 1.0 : kt >= 64 ? 0.8 : kt >= 34 ? 0.6 : 0.4;
  var dn = distKm / factor;
  if (dn < 100) return 0;
  if (dn < 200) return 1;
  if (dn < 350) return 2;
  if (dn < 500) return 3;
  return 4;
}

function evaluarANPs(storm) {
  if (!storm || !storm.lat) return [];
  var results = [];
  try {
    if (typeof activeLayers === 'undefined' || !activeLayers['shp_anp'] || !activeLayers['shp_anp'].featuresData) return results;
    var feats = activeLayers['shp_anp'].featuresData;
    var origin = [storm.lat, storm.lon];
    var trackCoords = (storm.forecast || []).map(function(p) { return [p.lat, p.lon]; });
    if (trackCoords.length < 2) trackCoords = [[storm.lat, storm.lon]];

    for (var i = 0; i < feats.length; i++) {
      try {
        var f = feats[i];
        var bounds = L.geoJSON(f).getBounds();
        if (!bounds.isValid()) continue;
        var center = bounds.getCenter();
        var dist = map.distance(origin, center) / 1000;
        var minDT = dist;
        for (var j = 0; j < trackCoords.length; j++) {
          var dt = map.distance(center, trackCoords[j]) / 1000;
          if (dt < minDT) minDT = dt;
        }
        var nombre = (f.properties && (f.properties.nombre || f.properties.nom || f.properties.NOMBRE)) || 'ANP';
        results.push({nombre: nombre, dist: Math.round(dist), distTrack: Math.round(minDT), riesgo: evaluarRiesgoANP(minDT, storm.intensity), lat: center.lat, lng: center.lng});
      } catch(e) {}
    }
    results.sort(function(a, b) { return a.riesgo - b.riesgo || a.distTrack - b.distTrack; });
  } catch(e) {}
  return results;
}

// ================================================================
// ANP ESTILO
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
        for (var i = 0; i < anpEval.length; i++) { if (anpEval[i].nombre === nombre) { riesgo = anpEval[i].riesgo; break; } }
        var color = riesgo >= 0 ? RIESGO[riesgo].color : '#6B1132';
        sub.setStyle({ fillOpacity: 0, opacity: 0.8, weight: riesgo >= 0 && riesgo <= 2 ? 3 : 1.5, color: color });
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

// ================================================================
// RENDER MAPA
// ================================================================

function renderPosicion(storm) {
  if (!storm || !storm.lat) return;
  if (!huracanesLayerPos) huracanesLayerPos = L.layerGroup().addTo(map);
  var lat = storm.lat, lon = storm.lon;
  var color = storm.classification === 'HU' ? '#FF4500' : storm.classification === 'TS' ? '#FF8C00' : '#FFD700';

  L.circleMarker([lat, lon], {
    radius: storm.classification === 'HU' ? 12 : 8,
    fillColor: color, color: '#fff', weight: 3, opacity: 1, fillOpacity: 0.9,
    className: 'huracan-ojo'
  }).addTo(huracanesLayerPos);

  L.circle([lat, lon], {
    radius: ((storm.intensity || 60) * 2.2) * 1000,
    color: color, weight: 2, fillColor: color, fillOpacity: 0.06, dashArray: '8,6'
  }).addTo(huracanesLayerPos);

  var cls = {HU:'Huracán',TS:'Tormenta Tropical',TD:'Depresión Tropical'}[storm.classification] || '';
  var ss = getSaffirSimpson(storm.intensity);
  var amp = getAmplitudMax(storm.intensity);
  var anpEval = evaluarANPs(storm);
  var distCerca = anpEval.length ? anpEval[0].distTrack : null;

  L.popup({className:'custom-popup', closeButton:true}).setLatLng([lat,lon]).setContent(
    '<div style="font-family:Inter;font-size:0.72rem;min-width:280px;">' +
    '<div style="background:linear-gradient(135deg,'+color+',#8B0000);color:#fff;padding:0.5rem 0.7rem;font-weight:700;border-radius:6px 6px 0 0;">' +
    '<i class="fas fa-hurricane"></i> ' + cls + ' ' + storm.name + ' (' + (storm.basin||'') + ')' + (ss.cat>0?' · Cat.'+ss.cat:'') + '</div>' +
    '<div style="padding:0.6rem 0.7rem;background:#fff;border-radius:0 0 6px 6d6px;">' +
    '<div><b>Posición:</b> ' + lat.toFixed(1) + '°N, ' + Math.abs(lon).toFixed(1) + '°W</div>' +
    '<div><b>Vientos:</b> ' + (storm.windMph||'—') + ' mph (' + (storm.intensity||'—') + ' kt)</div>' +
    '<div><b>Presión:</b> ' + (storm.pressure||'—') + ' mb</div>' +
    '<div><b>Amplitud:</b> ~' + amp.radio + ' km</div>' +
    '<div><b>Dirección:</b> ' + getDireccion(storm) + '</div>' +
    (distCerca !== null ? '<div><b>ANP más cercana:</b> ' + distCerca + ' km</div>' : '') +
    '</div></div>'
  ).openOn(map);
}

function renderCono(storm) {
  if (!storm || !storm.forecast) return;
  if (!huracanesLayerCone) huracanesLayerCone = L.layerGroup().addTo(map);
  var points = storm.forecast;
  if (points.length < 2) return;

  var trackCoords = points.map(function(p) { return [p.lat, p.lon]; });
  L.polyline(trackCoords, {color:'#FF4500', weight:3, opacity:0.8, dashArray:'10,5', className:'huracan-track'}).addTo(huracanesLayerCone);

  points.forEach(function(p, i) {
    if (i === 0) return;
    var radiusKm = Math.round(50 * (p.hours / 12));
    var color = p.intensity >= 96 ? '#CC0000' : p.intensity >= 64 ? '#FF8C00' : '#FFD700';
    L.circle([p.lat, p.lon], {radius:radiusKm*1000, color:color, weight:1.5, opacity:0.4, fillColor:color, fillOpacity:0.06, className:'huracan-cone'}).addTo(huracanesLayerCone);
    L.circleMarker([p.lat, p.lon], {radius:4, fillColor:color, color:'#fff', weight:2, fillOpacity:0.9}).addTo(huracanesLayerCone)
      .bindPopup('<b>+' + p.hours + 'h</b> · ' + p.lat.toFixed(1) + 'N, ' + Math.abs(p.lon).toFixed(1) + 'W · ' + p.intensity + ' kt', {className:'custom-popup'});
  });
}

// ================================================================
// PANEL — una tarjeta por cada tormenta
// ================================================================

function renderPanelTormentas(storms) {
  var el = document.getElementById('huracanes-info');
  if (!el) return;

  if (!storms || storms.length === 0) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;">Sin tormentas activas reportadas por el NHC.</p>';
    return;
  }

  var html = '<div style="margin-bottom:0.4rem;font-size:0.68rem;font-weight:800;color:var(--text-primary);"><i class="fas fa-hurricane"></i> Tormentas Activas: ' + storms.length + '</div>';

  storms.forEach(function(storm, idx) {
    var isSel = _selectedStorm === idx;
    var cls = {HU:'Huracán',TS:'Tormenta Tropical',TD:'Depresión Tropical'}[storm.classification] || '';
    var ss = getSaffirSimpson(storm.intensity);
    var amp = getAmplitudMax(storm.intensity);
    var dir = getDireccion(storm);
    var anpEval = evaluarANPs(storm);
    var isFb = storm.source === 'fallback';
    var fecha = storm.updated ? new Date(storm.updated).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
    var stormColor = storm.classification === 'HU' ? '#FF4500' : storm.classification === 'TS' ? '#FF8C00' : '#FFD700';

    var anpPorRiesgo = [[],[],[],[],[]];
    anpEval.forEach(function(a) { if (a.riesgo >= 0 && a.riesgo < 5) anpPorRiesgo[a.riesgo].push(a); });
    var totalRiesgo = anpPorRiesgo[0].length + anpPorRiesgo[1].length + anpPorRiesgo[2].length;

    // Tarjeta de cada tormenta (expandible)
    html += `
    <div class="huracan-card" data-idx="${idx}" style="margin-bottom:0.5rem;border:1px solid var(--border-subtle);border-radius:8px;overflow:hidden;">
      <!-- HEADER (siempre visible, clicable) -->
      <div onclick="toggleHuracanCard(${idx})" style="background:linear-gradient(135deg,${stormColor},${stormColor}aa);color:#fff;padding:0.5rem 0.7rem;cursor:pointer;display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
        <i class="fas ${isSel ? 'fa-chevron-down' : 'fa-chevron-right'}" style="font-size:0.65rem;"></i>
        <span style="font-size:0.82rem;font-weight:800;flex:1;">${cls} ${storm.name}</span>
        ${ss.cat > 0 ? '<span style="background:rgba(255,255,255,0.25);padding:0.1rem 0.4rem;border-radius:4px;font-size:0.65rem;">Cat.' + ss.cat + '</span>' : ''}
        <span style="font-size:0.58rem;opacity:0.85;">${storm.basin||''}</span>
      </div>

      <!-- CONTENIDO (visible solo si seleccionada) -->
      <div class="huracan-card-body" style="display:${isSel ? 'block' : 'none'};padding:0.5rem 0.6rem;background:var(--bg-glass);">
        <div style="font-size:0.55rem;color:var(--text-muted);margin-bottom:0.3rem;">${isFb?'Referencia':'NHC'} · ${fecha}</div>

        <div class="incendios-kpi-row">
          <div class="incendios-kpi" style="border-left:4px solid #FF4500;padding:0.3rem 0.4rem;">
            <div class="kpi-lbl">VIENTOS</div>
            <div class="kpi-val" style="color:#FF4500;font-size:0.85rem;">${storm.windMph||storm.intensity||'—'}</div>
            <div style="font-size:0.5rem;color:var(--text-muted);">${storm.windMph?'mph':storm.intensity?'kt':''} · ${Math.round((storm.intensity||0)*1.852)} km/h</div>
          </div>
          <div class="incendios-kpi" style="border-left:4px solid #4682B4;padding:0.3rem 0.4rem;">
            <div class="kpi-lbl">PRESIÓN</div>
            <div class="kpi-val" style="color:#4682B4;font-size:0.85rem;">${storm.pressure||'—'}</div>
            <div style="font-size:0.5rem;color:var(--text-muted);">mb</div>
          </div>
          <div class="incendios-kpi" style="border-left:4px solid #FF8C00;padding:0.3rem 0.4rem;">
            <div class="kpi-lbl">AMPL.</div>
            <div class="kpi-val" style="color:#FF8C00;font-size:0.85rem;">${amp.radio}</div>
            <div style="font-size:0.5rem;color:var(--text-muted);">km · ${amp.label}</div>
          </div>
        </div>
        <div class="incendios-kpi-row">
          <div class="incendios-kpi" style="border-left:4px solid #6B1132;grid-column:span 2;padding:0.3rem 0.4rem;">
            <div class="kpi-lbl">DIRECCIÓN</div>
            <div class="kpi-val" style="font-size:0.72rem;">${dir}</div>
            <div style="font-size:0.5rem;color:var(--text-muted);">${storm.movement||''}</div>
          </div>
          <div class="incendios-kpi" style="border-left:4px solid #1a5c4e;padding:0.3rem 0.4rem;">
            <div class="kpi-lbl">ANP RIESGO</div>
            <div class="kpi-val" style="color:${totalRiesgo>0?'#CC0000':'#00AA00'};font-size:0.85rem;">${totalRiesgo}</div>
            <div style="font-size:0.5rem;color:var(--text-muted);">de ${anpEval.length}</div>
          </div>
        </div>

        <!-- Semáforo -->
        <div style="display:flex;gap:0.2rem;margin-top:0.35rem;flex-wrap:wrap;">
          ${RIESGO.map(function(r,ri) {
            var count = anpPorRiesgo[ri].length;
            return '<div style="flex:1;min-width:48px;text-align:center;padding:0.15rem 0.2rem;background:'+r.bg+';color:'+r.text+';border-radius:4px;font-size:0.5rem;font-weight:700;">'+r.label+'<br><span style="font-size:0.65rem;">'+count+'</span></div>';
          }).join('')}
        </div>

        <!-- Top ANP -->
        ${anpEval.length > 0 ? `
        <div style="margin-top:0.35rem;max-height:140px;overflow-y:auto;">
          ${anpEval.slice(0,6).map(function(a) {
            var r = RIESGO[a.riesgo];
            return '<div style="display:flex;align-items:center;gap:0.25rem;padding:0.18rem 0.25rem;margin-bottom:0.08rem;background:var(--bg-glass);border-radius:4px;border-left:3px solid '+r.color+';font-size:0.56rem;">' +
              '<span style="flex:1;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+a.nombre+'</span>' +
              '<span style="color:var(--text-muted);min-width:38px;text-align:right;">'+a.distTrack+' km</span>' +
              '<span style="background:'+r.bg+';color:'+r.text+';padding:0.05rem 0.25rem;border-radius:3px;font-weight:700;font-size:0.48rem;min-width:44px;text-align:center;">'+r.label+'</span>' +
            '</div>';
          }).join('')}
        </div>` : ''}

        <!-- Aviso -->
        ${storm.advisory ? '<div style="margin-top:0.3rem;font-size:0.56rem;color:var(--text-secondary);line-height:1.3;padding:0.3rem;background:var(--bg-glass);border-radius:4px;">'+storm.advisory.substring(0,180)+'...</div>' : ''}
      </div>
    </div>`;
  });

  // Nota
  html += `
  <div style="margin-top:0.4rem;padding:0.35rem 0.4rem;background:rgba(70,130,180,0.08);border:1px solid rgba(70,130,180,0.2);border-radius:6px;font-size:0.52rem;color:var(--text-secondary);line-height:1.3;">
    <b>Nota:</b> NHC monitorea Atlántico + Pacífico Oriental (hasta 140°W). Huracanes en el Pacífico Occidental no aparecen aquí (ver <a href="https://www.metoc.navy.mil/jtwc" target="_blank" style="color:var(--brand-secondary);">JTWC</a>).
    <br><b>Fuentes:</b> NASA GIBS (VIIRS NOAA-21 ~250m) · NOAA/NHC RSS
  </div>`;

  el.innerHTML = html;
}

function toggleHuracanCard(idx) {
  _selectedStorm = _selectedStorm === idx ? null : idx;
  var cards = document.querySelectorAll('.huracan-card');
  cards.forEach(function(card) {
    var cardIdx = parseInt(card.dataset.idx);
    var body = card.querySelector('.huracan-card-body');
    var icon = card.querySelector('i');
    var isSel = _selectedStorm === cardIdx;
    if (body) body.style.display = isSel ? 'block' : 'none';
    if (icon) icon.className = isSel ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
  });
  // Centrar mapa en la tormenta seleccionada
  if (_selectedStorm !== null && huracanesData && huracanesData[_selectedStorm]) {
    var s = huracanesData[_selectedStorm];
    if (s.lat && s.lon) map.setView([s.lat, s.lon], 5);
  }
}
window.toggleHuracanCard = toggleHuracanCard;

// ================================================================
// INIT / CLEANUP
// ================================================================

function initHuracanes() {
  console.log('[Huracacanes] init');
  huracanesVisible = true;
  _selectedStorm = 0; // primera tormenta seleccionada por defecto

  if (!huracanesLayerVIIRS) {
    huracanesLayerVIIRS = crearCapaVIIRS(2);
    huracanesLayerVIIRS.on('tileload', function(ev) { console.log('[Huracanes] Tile OK:', ev.coords.z+'/'+ev.coords.y+'/'+ev.coords.x); });
    huracanesLayerVIIRS.on('tileerror', function(ev) { console.warn('[Huracanes] Tile ERROR:', ev.coords ? ev.coords.z+'/'+ev.coords.y+'/'+ev.coords.x : 'unknown'); });
    huracanesLayerVIIRS.addTo(map);
  }

  var el = document.getElementById('huracanes-info');
  if (el) el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;"><i class="fas fa-spinner fa-spin"></i> Consultando NOAA/NHC (Atlántico + Pacífico)...</p>';

  if (huracanesInitTimer) clearTimeout(huracanesInitTimer);
  huracanesInitTimer = setTimeout(async function() {
    try {
      var storms = await fetchTormentasNHC();
      huracanesData = storms;
      console.log('[Huracanes] Total tormentas:', storms.length);

      if (huracanesLayerPos) { try { map.removeLayer(huracanesLayerPos); } catch(e) {} huracanesLayerPos = null; }
      if (huracanesLayerCone) { try { map.removeLayer(huracanesLayerCone); } catch(e) {} huracanesLayerCone = null; }

      storms.forEach(function(s) {
        renderPosicion(s);
        renderCono(s);
      });

      // Seleccionar la tormenta más cercana a México
      var closest = 0;
      var minDist = Infinity;
      storms.forEach(function(s, i) {
        var d = Math.abs(s.lat - 23) + Math.abs(s.lon + 102);
        if (d < minDist) { minDist = d; closest = i; }
      });
      _selectedStorm = closest;

      var centro = storms[closest];
      if (centro && centro.lat) {
        anpSinRelleno(centro);
        map.setView([centro.lat, centro.lon], 4);
      }
      renderPanelTormentas(storms);
    } catch (e) {
      console.error('[Huracanes] init error:', e);
      renderPanelTormentas([]);
    }
  }, 200);
}

function limpiarHuracanes() {
  if (huracanesInitTimer) { clearTimeout(huracanesInitTimer); huracanesInitTimer = null; }
  if (huracanesLayerVIIRS) { try { map.removeLayer(huracanesLayerVIIRS); } catch(e) {} huracanesLayerVIIRS = null; }
  if (huracanesLayerPos) { try { map.removeLayer(huracanesLayerPos); } catch(e) {} huracanesLayerPos = null; }
  if (huracanesLayerCone) { try { map.removeLayer(huracanesLayerCone); } catch(e) {} huracanesLayerCone = null; }
  try { map.closePopup(); } catch(e) {}
  anpRestaurar();
  huracanesData = null;
  huracanesVisible = false;
  _selectedStorm = null;
  console.log('[Huracanes] Limpieza completa');
}

function actualizarVIIRSFecha(dias) {
  if (huracanesLayerVIIRS) { try { map.removeLayer(huracanesLayerVIIRS); } catch(e) {} }
  huracanesLayerVIIRS = crearCapaVIIRS(dias);
  huracanesLayerVIIRS.addTo(map);
}

window.initHuracanes = initHuracanes;
window.limpiarHuracanes = limpiarHuracanes;
window.actualizarVIIRSFecha = actualizarVIIRSFecha;
