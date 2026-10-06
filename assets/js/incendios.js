// ================================================================
// INCENDIOS — Alerta Temprana de Incendios Forestales
// Puntos de calor MODIS (Terra/Aqua) + VIIRS (SNPP/NOAA-20/21)
// Fuente: NASA FIRMS (Fire Information for Resource Management System)
// ================================================================

let incendiosLayer = null;
let incendiosData = [];
let incendiosVisible = false;
let incendiosFecha = 1; // 1=24h, 2=48h, 7=7d

// Bounding box México (para FIRMS)
const MX_BBOX = { w: -118.4, s: 14.5, e: -86.7, n: 32.8 };

// Colores por nivel de confianza
const FIRMS_CONF = {
  low:    { color: '#FFD700', label: 'Baja',    desc: 'Detección con baja confianza' },
  nominal:{ color: '#FF8C00', label: 'Nominal', desc: 'Detección nominal' },
  high:   { color: '#FF0000', label: 'Alta',    desc: 'Detección con alta confianza' }
};

// ================================================================
// CAPAS NASA GIBS — WMS para teselas de satélite
// ================================================================

const GIBS_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

function getGibsDateOffset(daysAgo) {
  var d = new Date();
  d.setDate(d.getDate() - (daysAgo || 1));
  return d.toISOString().split('T')[0];
}

// MODIS Terra Thermal Anomalies (hotspots) — WMS GIBS
function crearCapaModisFuego(daysAgo) {
  var date = getGibsDateOffset(daysAgo);
  return L.tileLayer.wms(GIBS_WMS, {
    layers: 'MODIS_Terra_Thermal_Anomalies_All',
    format: 'image/png',
    transparent: true,
    opacity: 0.85,
    version: '1.3.0',
    TIME: date,
    crossOrigin: true,
    attribution: 'NASA FIRMS · MODIS Terra Thermal Anomalies',
    className: 'firms-wms-layer'
  });
}

// VIIRS SNPP Thermal Anomalies — WMS GIBS
function crearCapaViirsFuego(daysAgo) {
  var date = getGibsDateOffset(daysAgo);
  return L.tileLayer.wms(GIBS_WMS, {
    layers: 'VIIRS_SNPP_Thermal_Anomalies_All',
    format: 'image/png',
    transparent: true,
    opacity: 0.85,
    version: '1.3.0',
    TIME: date,
    crossOrigin: true,
    attribution: 'NASA FIRMS · VIIRS SNPP Thermal Anomalies',
    className: 'firms-wms-layer'
  });
}

// ================================================================
// DATOS FIRMS — Puntos de calor como GeoJSON (fetch CSV abierto)
// ================================================================

async function fetchFirmsPuntos(dias, sensor) {
  // FIRMS Area CSV (público, sin API key para downloads limitados)
  // sensor: 'VIIRS_NOAA20_NRT' | 'VIIRS_SNPP_NRT' | 'MODIS_C6_1'
  var s = sensor || 'VIIRS_NOAA20_NRT';
  var d = dias || 1;
  var url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/1/${s}/` +
            `${MX_BBOX.w},${MX_BBOX.s},${MX_BBOX.e},${MX_BBOX.n}/${d}`;
  try {
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('FIRMS HTTP ' + resp.status);
    var csv = await resp.text();
    return parseFirmsCSV(csv);
  } catch (e) {
    console.warn('FIRMS fetch error:', e);
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
    // Normalizar confianza
    var conf = 'nominal';
    var cv = parseInt(props.confidence);
    if (!isNaN(cv)) {
      if (cv >= 80) conf = 'high';
      else if (cv < 30) conf = 'low';
    } else if (props.confidence) {
      var cl = String(props.confidence).toLowerCase();
      if (cl === 'h' || cl === 'high') conf = 'high';
      else if (cl === 'l' || cl === 'low') conf = 'low';
    }
    feats.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        latitude: lat,
        longitude: lon,
        brightness: parseFloat(props.bright_ti4 || props.brightness) || 0,
        confidence: conf,
        confidence_raw: props.confidence,
        acq_date: props.acq_date || '',
        acq_time: props.acq_time || '',
        satellite: props.satellite || s,
        frp: parseFloat(props.frp) || 0, // Fire Radiative Power (MW)
        daynight: props.daynight || ''
      }
    });
  }
  return feats;
}

// ================================================================
// CAPA DE PUNTOS DE CALOR
// ================================================================

function renderIncendiosPuntos(feats) {
  if (incendiosLayer) {
    try { map.removeLayer(incendiosLayer); } catch(e) {}
    incendiosLayer = null;
  }
  if (!feats || !feats.length) return;

  incendiosLayer = L.geoJSON({
    type: 'FeatureCollection',
    features: feats
  }, {
    pointToLayer: function(feature, latlng) {
      var conf = feature.properties.confidence || 'nominal';
      var color = FIRMS_CONF[conf] ? FIRMS_CONF[conf].color : '#FF8C00';
      var radius = 5;
      if (conf === 'high') radius = 7;
      return L.circleMarker(latlng, {
        radius: radius,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.85,
        className: 'firms-point'
      });
    },
    onEachFeature: function(feature, layer) {
      var p = feature.properties;
      var conf = FIRMS_CONF[p.confidence] || FIRMS_CONF.nominal;
      var popup = `
        <div style="font-family:Inter,sans-serif;font-size:0.72rem;min-width:200px;">
          <div style="background:${conf.color};color:#fff;padding:0.4rem 0.6rem;font-weight:700;border-radius:6px 6px 0 0;">
            <i class="fas fa-fire"></i> Punto de Calor — ${conf.label}
          </div>
          <div style="padding:0.5rem 0.6rem;background:#fff;border-radius:0 0 6px 6px;">
            <div><b>Fecha:</b> ${p.acq_date} ${p.acq_time} UTC</div>
            <div><b>Coordenadas:</b> ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>
            <div><b>Brillo (T4):</b> ${p.brightness ? p.brightness.toFixed(1) + ' K' : '—'}</div>
            <div><b>FRP:</b> ${p.frp ? p.frp.toFixed(1) + ' MW' : '—'}</div>
            <div><b>Satélite:</b> ${p.satellite || '—'}</div>
            <div><b>Día/Noche:</b> ${p.daynight === 'D' ? 'Día' : p.daynight === 'N' ? 'Noche' : '—'}</div>
          </div>
        </div>`;
      layer.bindPopup(popup, { className: 'custom-popup' });
    }
  }).addTo(map);
  incendiosData = feats;
}

// ================================================================
// PANEL DE INCENDIOS — Estadísticas
// ================================================================

function actualizarPanelIncendios() {
  var el = document.getElementById('incendios-stats');
  if (!el) return;

  var total = incendiosData.length;
  var high = 0, nominal = 0, low = 0;
  var frpTotal = 0;

  incendiosData.forEach(function(f) {
    var c = f.properties.confidence;
    if (c === 'high') high++;
    else if (c === 'low') low++;
    else nominal++;
    frpTotal += f.properties.frp || 0;
  });

  // Contar cuántos están dentro de ANP
  var enANP = 0;
  try {
    if (typeof activeLayers !== 'undefined' && activeLayers['shp_anp'] && activeLayers['shp_anp'].featuresData) {
      var anpFeats = activeLayers['shp_anp'].featuresData;
      incendiosData.forEach(function(f) {
        var pt = turf.point([f.properties.longitude, f.properties.latitude]);
        for (var i = 0; i < Math.min(anpFeats.length, 50); i++) {
          try {
            if (turf.booleanPointInPolygon(pt, anpFeats[i])) {
              enANP++;
              break;
            }
          } catch(e) {}
        }
      });
    }
  } catch(e) {}

  el.innerHTML = `
    <div class="incendios-kpi-row">
      <div class="incendios-kpi" style="border-left:4px solid #FF0000;">
        <div class="kpi-lbl">ALTA CONFIANZA</div>
        <div class="kpi-val" style="color:#FF0000;">${high}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #FF8C00;">
        <div class="kpi-lbl">NOMINAL</div>
        <div class="kpi-val" style="color:#FF8C00;">${nominal}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #FFD700;">
        <div class="kpi-lbl">BAJA</div>
        <div class="kpi-val" style="color:#DAA520;">${low}</div>
      </div>
    </div>
    <div class="incendios-kpi-row">
      <div class="incendios-kpi" style="border-left:4px solid #6B1132;">
        <div class="kpi-lbl">TOTAL DETECCIONES</div>
        <div class="kpi-val">${total}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #1a5c4e;">
        <div class="kpi-lbl">EN ANP</div>
        <div class="kpi-val" style="color:#1a5c4e;">${enANP}</div>
      </div>
      <div class="incendios-kpi" style="border-left:4px solid #4682B4;">
        <div class="kpi-lbl">FRP TOTAL (MW)</div>
        <div class="kpi-val" style="color:#4682B4;">${frpTotal.toFixed(0)}</div>
      </div>
    </div>
    <div style="margin-top:0.6rem;font-size:0.6rem;color:var(--text-muted);">
      Fuente: NASA FIRMS · ${incendiosFecha === 1 ? 'Últimas 24 horas' : incendiosFecha === 2 ? 'Últimas 48 horas' : 'Últimos 7 días'} · Satélite: VIIRS NOAA-20
    </div>
  `;
}

// ================================================================
// INICIALIZAR SECCIÓN INCENDIOS
// ================================================================

async function initIncendios() {
  console.log('[Incendios] Inicializando...');
  actualizarPanelIncendios(); // muestra vacío

  // Cargar puntos
  var feats = await fetchFirmsPuntos(incendiosFecha, 'VIIRS_NOAA20_NRT');
  if (feats.length > 0) {
    renderIncendiosPuntos(feats);
    actualizarPanelIncendios();
    console.log(`[Incendios] ${feats.length} puntos de calor cargados`);
  } else {
    console.warn('[Incendios] No se obtuvieron datos de FIRMS, usando WMS GIBS');
    // Fallback: mostrar capa WMS GIBS MODIS Thermal Anomalies
    var wmsLayer = crearCapaModisFuego(1);
    wmsLayer.addTo(map);
    incendiosLayer = wmsLayer;
  }
}

function limpiarIncendios() {
  if (incendiosLayer) {
    try { map.removeLayer(incendiosLayer); } catch(e) {}
    incendiosLayer = null;
  }
  incendiosData = [];
  incendiosVisible = false;
  var el = document.getElementById('incendios-stats');
  if (el) el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;">Sección Incendios inactiva</p>';
}

// Cambiar rango de fechas
async function cambiarRangoIncendios(dias) {
  incendiosFecha = dias;
  var feats = await fetchFirmsPuntos(dias, 'VIIRS_NOAA20_NRT');
  renderIncendiosPuntos(feats);
  actualizarPanelIncendios();
}

window.initIncendios = initIncendios;
window.limpiarIncendios = limpiarIncendios;
window.cambiarRangoIncendios = cambiarRangoIncendios;
window.incendiosData = incendiosData;
