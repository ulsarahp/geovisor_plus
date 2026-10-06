// ================================================================
// INCENDIOS — Alerta Temprana de Incendios Forestales
// Puntos de calor: NASA FIRMS (MODIS Terra + VIIRS NOAA-20/SNPP)
// MAP_KEY: obtener en https://firms.modaps.eosdis.nasa.gov/api/map_key/
// ================================================================

let incendiosLayerPuntos = null;
let incendiosLayerWMS = null;
let incendiosData = [];
let incendiosVisible = false;
let incendiosFecha = 1; // días
let incendiosInitTimer = null;

// ⚠️ CONFIGURACIÓN: Inserta aquí tu MAP_KEY de NASA FIRMS
// Obtén uno GRATIS en: https://firms.modaps.eosdis.nasa.gov/api/map_key/
const FIRMS_MAP_KEY = ''; // ← PONER TU MAP_KEY AQUÍ

// Bounding box México
const MX_BBOX = { w: -118.4, s: 14.5, e: -86.7, n: 32.8 };

// NASA GIBS WMTS — MODIS Thermal Anomalies (hotspots visibles como overlay)
const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/';
const GIBS_TMS = 'GoogleMapsCompatible_Level9';

function getGibsFecha(diasAtras) {
  var d = new Date();
  d.setDate(d.getDate() - (diasAtras || 1));
  return d.toISOString().split('T')[0];
}

// Capa GIBS: MODIS Terra Thermal Anomalies (píxeles rojos = puntos de calor)
function crearCapaModisFuego(diasAtras) {
  var fecha = getGibsFecha(diasAtras);
  var url = GIBS_BASE + 'MODIS_Terra_Thermal_Anomalies_All' +
    '/default/' + fecha + '/' + GIBS_TMS + '/{z}/{y}/{x}.png';
  return L.tileLayer(url, {
    attribution: 'NASA FIRMS · MODIS Terra Thermal Anomalies',
    maxZoom: 9,
    bounds: [[-85.0511, -180], [85.0511, 180]],
    transparent: true,
    crossOrigin: true,
    opacity: 0.85,
    className: 'firms-wms-layer'
  });
}

// Capa GIBS: VIIRS SNPP Thermal Anomalies
function crearCapaViirsFuego(diasAtras) {
  var fecha = getGibsFecha(diasAtras);
  var url = GIBS_BASE + 'VIIRS_SNPP_Thermal_Anomalies_All' +
    '/default/' + fecha + '/' + GIBS_TMS + '/{z}/{y}/{x}.png';
  return L.tileLayer(url, {
    attribution: 'NASA FIRMS · VIIRS SNPP Thermal Anomalies',
    maxZoom: 9,
    bounds: [[-85.0511, -180], [85.0511, 180]],
    transparent: true,
    crossOrigin: true,
    opacity: 0.85,
    className: 'firms-wms-layer'
  });
}

// ================================================================
// FIRMS API — Puntos de calor como GeoJSON
// Requiere MAP_KEY (gratuito)
// ================================================================

async function fetchFirmsPuntos(dias, sensor) {
  if (!FIRMS_MAP_KEY) {
    console.warn('[Incendios] FIRMS_MAP_KEY no configurada. Obtenla gratis en: https://firms.modaps.eosdis.nasa.gov/api/map_key/');
    return [];
  }
  var s = sensor || 'VIIRS_NOAA20_NRT';
  var d = dias || 1;
  var url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/${s}/` +
            `${MX_BBOX.w},${MX_BBOX.s},${MX_BBOX.e},${MX_BBOX.n}/${d}`;
  try {
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('FIRMS HTTP ' + resp.status);
    var csv = await resp.text();
    return parseFirmsCSV(csv);
  } catch (e) {
    console.warn('[Incendios] FIRMS fetch error:', e);
    return [];
  }
}

function parseFirmsCSV(csv) {
  var lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  var headers = lines[0].split(',').map(function(h){ return h.trim(); });
  var feats = [];
  for (var i = 1; i < lines.length; i++) {
    var vals = lines[i].split(',');
    if (vals.length < 5) continue;
    var props = {};
    headers.forEach(function(h, j) { props[h] = vals[j]; });
    var lat = parseFloat(props.latitude);
    var lon = parseFloat(props.longitude);
    if (isNaN(lat) || isNaN(lon)) continue;
    var conf = 'nominal';
    var cv = parseInt(props.confidence);
    if (!isNaN(cv)) {
      if (cv >= 80) conf = 'high';
      else if (cv < 30) conf = 'low';
    }
    feats.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        latitude: lat, longitude: lon,
        brightness: parseFloat(props.bright_ti4 || props.brightness) || 0,
        confidence: conf,
        acq_date: props.acq_date || '',
        acq_time: props.acq_time || '',
        satellite: props.satellite || '',
        frp: parseFloat(props.frp) || 0,
        daynight: props.daynight || ''
      }
    });
  }
  return feats;
}

// ================================================================
// RENDERIZAR PUNTOS
// ================================================================

function renderIncendiosPuntos(feats) {
  if (incendiosLayerPuntos) { try { map.removeLayer(incendiosLayerPuntos); } catch(e) {} incendiosLayerPuntos = null; }
  if (!feats || !feats.length) return;

  incendiosLayerPuntos = L.geoJSON({
    type: 'FeatureCollection', features: feats
  }, {
    pointToLayer: function(feature, latlng) {
      var conf = feature.properties.confidence || 'nominal';
      var color = conf === 'high' ? '#FF0000' : conf === 'low' ? '#FFD700' : '#FF8C00';
      var radius = conf === 'high' ? 7 : 5;
      return L.circleMarker(latlng, {
        radius: radius, fillColor: color, color: '#fff',
        weight: 1, opacity: 0.9, fillOpacity: 0.85, className: 'firms-point'
      });
    },
    onEachFeature: function(feature, layer) {
      var p = feature.properties;
      var conf = p.confidence === 'high' ? 'Alta' : p.confidence === 'low' ? 'Baja' : 'Nominal';
      var confColor = p.confidence === 'high' ? '#FF0000' : p.confidence === 'low' ? '#FFD700' : '#FF8C00';
      layer.bindPopup(`
        <div style="font-family:Inter,sans-serif;font-size:0.72rem;min-width:200px;">
          <div style="background:${confColor};color:#fff;padding:0.4rem 0.6rem;font-weight:700;border-radius:6px 6px 0 0;">
            <i class="fas fa-fire"></i> Punto de Calor — Confianza ${conf}
          </div>
          <div style="padding:0.5rem 0.6rem;background:#fff;border-radius:0 0 6px 6px;">
            <div><b>Fecha:</b> ${p.acq_date} ${p.acq_time} UTC</div>
            <div><b>Coordenadas:</b> ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>
            <div><b>Brillo:</b> ${p.brightness ? p.brightness.toFixed(1) + ' K' : '—'}</div>
            <div><b>FRP:</b> ${p.frp ? p.frp.toFixed(1) + ' MW' : '—'}</div>
            <div><b>Satélite:</b> ${p.satellite || '—'}</div>
            <div><b>Día/Noche:</b> ${p.daynight === 'D' ? 'Día' : p.daynight === 'N' ? 'Noche' : '—'}</div>
          </div>
        </div>`, { className: 'custom-popup' });
    }
  }).addTo(map);
  incendiosData = feats;
}

// ================================================================
// PANEL DE ESTADÍSTICAS
// ================================================================

function actualizarPanelIncendios() {
  var el = document.getElementById('incendios-stats');
  if (!el) return;

  if (!incendiosData.length) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.65rem;padding:0.6rem;">' +
      (FIRMS_MAP_KEY ? 'Sin detecciones en el rango seleccionado.' :
      '<i class="fas fa-key"></i> <b>FIRMS_MAP_KEY</b> no configurada.<br>Obtenla gratis en:<br><a href="https://firms.modaps.eosdis.nasa.gov/api/map_key/" target="_blank" style="color:var(--brand-secondary);">firms.modaps.eosdis.nasa.gov/api/map_key</a><br>y colocala en <code>assets/js/incendios.js</code> linea 15.') + '</p>';
    return;
  }

  var total = incendiosData.length;
  var high = 0, nominal = 0, low = 0, frpTotal = 0;
  incendiosData.forEach(function(f) {
    var c = f.properties.confidence;
    if (c === 'high') high++; else if (c === 'low') low++; else nominal++;
    frpTotal += f.properties.frp || 0;
  });

  // Contar dentro de ANP
  var enANP = 0;
  try {
    if (typeof activeLayers !== 'undefined' && activeLayers['shp_anp'] && activeLayers['shp_anp'].featuresData) {
      var anpFeats = activeLayers['shp_anp'].featuresData;
      incendiosData.forEach(function(f) {
        try {
          var pt = turf.point([f.properties.longitude, f.properties.latitude]);
          for (var i = 0; i < Math.min(anpFeats.length, 50); i++) {
            if (turf.booleanPointInPolygon(pt, anpFeats[i])) { enANP++; break; }
          }
        } catch(e) {}
      });
    }
  } catch(e) {}

  el.innerHTML = `
    <div class="incendios-kpi-row">
      <div class="incendios-kpi" style="border-left:4px solid #FF0000;">
        <div class="kpi-lbl">ALTA</div><div class="kpi-val" style="color:#FF0000;">${high}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #FF8C00;">
        <div class="kpi-lbl">NOMINAL</div><div class="kpi-val" style="color:#FF8C00;">${nominal}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #FFD700;">
        <div class="kpi-lbl">BAJA</div><div class="kpi-val" style="color:#DAA520;">${low}</div>
      </div>
    </div>
    <div class="incendios-kpi-row">
      <div class="incendios-kpi" style="border-left:4px solid #6B1132;">
        <div class="kpi-lbl">TOTAL</div><div class="kpi-val">${total}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #1a5c4e;">
        <div class="kpi-lbl">EN ANP</div><div class="kpi-val" style="color:#1a5c4e;">${enANP}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #4682B4;">
        <div class="kpi-lbl">FRP (MW)</div><div class="kpi-val" style="color:#4682B4;">${frpTotal.toFixed(0)}</div>
      </div>
    </div>
    <div style="margin-top:0.5rem;font-size:0.58rem;color:var(--text-muted);">
      NASA FIRMS · ${incendiosFecha === 1 ? '24h' : incendiosFecha === 2 ? '48h' : '7 días'} · VIIRS NOAA-20
    </div>`;
}

// ================================================================
// INICIALIZAR / LIMPIAR
// ================================================================

function initIncendios() {
  console.log('[Incendios] Inicializando...');
  incendiosVisible = true;

  // 1. Añadir capa GIBS MODIS Thermal Anomalies inmediatamente (siempre funciona, no necesita key)
  if (!incendiosLayerWMS) {
    incendiosLayerWMS = crearCapaModisFuego(incendiosFecha);
    incendiosLayerWMS.addTo(map);
  }

  // 2. Panel con estado inicial
  actualizarPanelIncendios();

  // 3. Si hay MAP_KEY, cargar puntos FIRMS (async)
  if (FIRMS_MAP_KEY) {
    if (incendiosInitTimer) clearTimeout(incendiosInitTimer);
    incendiosInitTimer = setTimeout(async function() {
      var feats = await fetchFirmsPuntos(incendiosFecha, 'VIIRS_NOAA20_NRT');
      if (feats.length > 0) {
        renderIncendiosPuntos(feats);
        actualizarPanelIncendios();
        console.log('[Incendios] ' + feats.length + ' puntos cargados');
      }
    }, 300);
  }

  // 4. Encuadrar México
  try { map.fitBounds([[MX_BBOX.s, MX_BBOX.w], [MX_BBOX.n, MX_BBOX.e]], {padding: [30, 30]}); } catch(e) {}
}

function limpiarIncendios() {
  if (incendiosInitTimer) { clearTimeout(incendiosInitTimer); incendiosInitTimer = null; }
  if (incendiosLayerPuntos) { try { map.removeLayer(incendiosLayerPuntos); } catch(e) {} incendiosLayerPuntos = null; }
  if (incendiosLayerWMS) { try { map.removeLayer(incendiosLayerWMS); } catch(e) {} incendiosLayerWMS = null; }
  incendiosData = [];
  incendiosVisible = false;
}

async function cambiarRangoIncendios(dias) {
  incendiosFecha = dias;
  // Actualizar capa GIBS
  if (incendiosLayerWMS) { try { map.removeLayer(incendiosLayerWMS); } catch(e) {} }
  incendiosLayerWMS = crearCapaModisFuego(dias);
  incendiosLayerWMS.addTo(map);
  // Actualizar puntos si hay key
  if (FIRMS_MAP_KEY) {
    var feats = await fetchFirmsPuntos(dias, 'VIIRS_NOAA20_NRT');
    renderIncendiosPuntos(feats);
  }
  actualizarPanelIncendios();
}

window.initIncendios = initIncendios;
window.limpiarIncendios = limpiarIncendios;
window.cambiarRangoIncendios = cambiarRangoIncendios;
window.FIRMS_MAP_KEY = FIRMS_MAP_KEY;
