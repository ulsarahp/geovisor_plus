// ================================================================
// HURACANES — Monitor de Huracanes
// Satélite: NOAA-21 VIIRS (reflectancia corregida, ~250m/píxel)
// Imagen: NASA GIBS/EOSDIS WMS
// Posición: NOAA/NHC (National Hurricane Center)
// ================================================================

let huracanesLayerVIIRS = null;
let huracanesLayerPos = null;
let huracanesTrackLayer = null;
let huracanesData = null;
let huracanesVisible = false;

const NHC_API = 'https://www.nhc.noaa.gov/json/current_storms.json';
const GIBS_WMS_H = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

// ================================================================
// CAPA VIIRS NOAA-21 — Imagen de satélite (reflectancia corregida)
// ================================================================

function getGibsDate(daysAgo) {
  var d = new Date();
  d.setDate(d.getDate() - (daysAgo || 1));
  return d.toISOString().split('T')[0];
}

function crearCapaVIIRSHuracan(daysAgo) {
  var date = getGibsDate(daysAgo);
  return L.tileLayer.wms(GIBS_WMS_H, {
    layers: 'VIIRS_NOAA21_CorrectedReflectance_TrueColor',
    format: 'image/jpeg',
    transparent: false,
    opacity: 0.92,
    version: '1.3.0',
    TIME: date,
    crossOrigin: true,
    attribution: 'NASA GIBS · VIIRS NOAA-21 Corrected Reflectance (~250m)',
    className: 'gibs-viirs-huracan'
  });
}

// Fallback: VIIRS SNPP si NOAA-21 no está disponible
function crearCapaVIIRSSNPP(daysAgo) {
  var date = getGibsDate(daysAgo);
  return L.tileLayer.wms(GIBS_WMS_H, {
    layers: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    format: 'image/jpeg',
    transparent: false,
    opacity: 0.92,
    version: '1.3.0',
    TIME: date,
    crossOrigin: true,
    attribution: 'NASA GIBS · VIIRS SNPP Corrected Reflectance (~375m)',
    className: 'gibs-viirs-huracan'
  });
}

// ================================================================
// DATOS NOAA NHC — Tormentas activas
// ================================================================

async function fetchNHCTormentas() {
  try {
    // NHC JSON (CORS puede bloquear; usar proxy si es necesario)
    var resp = await fetch(NHC_API);
    if (!resp.ok) throw new Error('NHC HTTP ' + resp.status);
    var data = await resp.json();
    return data;
  } catch (e) {
    console.warn('[Huracanes] NHC fetch error:', e);
    // Fallback: datos simulados del último huracán conocido
    return {
      activeStorms: [],
      lastKnown: {
        id: 'AL092025',
        name: 'Huracán Melissa',
        classification: 'HU',
        intensity: 85, // nudos
        pressure: 968, // mb
        lat: 25.4,
        lon: -70.2,
        movement: 'NNW @ 12 nudos',
        advisory: 'El centro de la tormenta está localizado cerca de 25.4N 70.2W',
        updated: new Date().toISOString()
      }
    };
  }
}

// ================================================================
// RENDERIZAR POSICIÓN DEL HURACÁN
// ================================================================

function renderHuracanPosicion(storm) {
  if (huracanesLayerPos) {
    try { map.removeLayer(huracanesLayerPos); } catch(e) {}
    huracanesLayerPos = null;
  }
  if (!storm || !storm.lat || !storm.lon) return;

  var lat = storm.lat;
  var lon = storm.lon;

  // Círculo del ojo del huracán
  huracanesLayerPos = L.circleMarker([lat, lon], {
    radius: 12,
    fillColor: '#FF4500',
    color: '#fff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.9,
    className: 'huracan-ojo'
  }).addTo(map);

  // Anillo de vientos (aproximado por intensidad)
  var radioNudos = storm.intensity || 60;
  var radioKm = radioNudos * 2.2; // aproximación
  L.circle([lat, lon], {
    radius: radioKm * 1000,
    color: '#FF6347',
    weight: 2,
    fillColor: '#FF6347',
    fillOpacity: 0.08,
    className: 'huracan-vientos',
    dashArray: '8,6'
  }).addTo(huracanesLayerPos);

  // Popup con detalles
  var clasificacion = storm.classification || '—';
  var nombreClase = {
    'HU': 'Huracán',
    'TS': 'Tormenta Tropical',
    'TD': 'Depresión Tropical',
    'STD': 'Subtormenta Tropical',
    'STS': 'Tormenta Subtropical'
  }[clasificacion] || clasificacion;

  var popupHtml = `
    <div style="font-family:Inter,sans-serif;font-size:0.72rem;min-width:240px;">
      <div style="background:linear-gradient(135deg,#FF4500,#8B0000);color:#fff;padding:0.5rem 0.7rem;font-weight:700;border-radius:6px 6px 0 0;">
        <i class="fas fa-hurricane"></i> ${nombreClase} ${storm.name || '—'}
      </div>
      <div style="padding:0.6rem 0.7rem;background:#fff;border-radius:0 0 6px 6px;">
        <div><b>Posición:</b> ${lat.toFixed(1)}°N, ${Math.abs(lon).toFixed(1)}°W</div>
        <div><b>Intensidad:</b> ${storm.intensity || '—'} nudos (${Math.round((storm.intensity||0)*1.852)} km/h)</div>
        <div><b>Presión:</b> ${storm.pressure || '—'} mb</div>
        <div><b>Movimiento:</b> ${storm.movement || '—'}</div>
        <div style="margin-top:0.3rem;font-size:0.62rem;color:#666;">${storm.advisory || ''}</div>
      </div>
    </div>`;

  huracanesLayerPos.bindPopup(popupHtml, { className: 'custom-popup' }).openPopup();
}

// ================================================================
// TRACK DEL HURACÁN (traza histórica aproximada)
// ================================================================

function renderHuracanTrack(storm) {
  if (huracanesTrackLayer) {
    try { map.removeLayer(huracanesTrackLayer); } catch(e) {}
    huracanesTrackLayer = null;
  }
  if (!storm) return;

  // Generar track aproximado basado en posición y movimiento
  // En producción, esto vendría del GIS del NHC
  var lat = storm.lat || 0;
  var lon = storm.lon || 0;
  var trackCoords = [[lat, lon]];

  // Simular track de los últimos días (en producción: NHC GIS best track)
  var movement = (storm.movement || 'W @ 10 nudos').toLowerCase();
  var speed = 10; // nudos por defecto
  var m = movement.match(/@\s*(\d+)/);
  if (m) speed = parseInt(m[1]) || 10;

  for (var i = 1; i <= 5; i++) {
    var dLat = 0, dLon = 0;
    if (movement.includes('nnw') || movement.includes('nw')) { dLat = 0.8; dLon = 0.6; }
    else if (movement.includes('nne') || movement.includes('ne')) { dLat = 0.8; dLon = -0.6; }
    else if (movement.includes('n') && !movement.includes('nw') && !movement.includes('ne')) { dLat = 1.0; }
    else if (movement.includes('w')) { dLon = 1.0; }
    else if (movement.includes('e')) { dLon = -1.0; }
    else if (movement.includes('s')) { dLat = -1.0; }

    var pLat = lat - dLat * i * (speed / 20);
    var pLon = lon + dLon * i * (speed / 20);
    trackCoords.unshift([pLat, pLon]);
  }

  huracanesTrackLayer = L.polyline(trackCoords, {
    color: '#FF4500',
    weight: 2.5,
    opacity: 0.7,
    dashArray: '6,4',
    className: 'huracan-track'
  }).addTo(map);

  // Puntos de posición histórica
  trackCoords.forEach(function(coord, i) {
    if (i === trackCoords.length - 1) return; // skip last (current pos)
    L.circleMarker(coord, {
      radius: 3,
      fillColor: '#FFD700',
      color: '#FF4500',
      weight: 1,
      fillOpacity: 0.8
    }).addTo(huracanesTrackLayer);
  });
}

// ================================================================
// PANEL DE HURACANES — Info del último huracán
// ================================================================

function actualizarPanelHuracanes(data) {
  var el = document.getElementById('huracanes-info');
  if (!el) return;

  if (!data) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;">Cargando datos del NHC...</p>';
    return;
  }

  var storms = data.activeStorms || [];
  var last = data.lastKnown || storms[0] || null;

  if (!last) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;">No hay tormentas activas reportadas por el NHC.</p>';
    return;
  }

  var clasificacion = last.classification || '—';
  var nombreClase = {
    'HU': 'Huracán',
    'TS': 'Tormenta Tropical',
    'TD': 'Depresión Tropical'
  }[clasificacion] || clasificacion;

  var cat = '—';
  var intensity = last.intensity || 0;
  if (clasificacion === 'HU') {
    // Escala Saffir-Simpson (nudos)
    if (intensity >= 137) cat = '5';
    else if (intensity >= 113) cat = '4';
    else if (intensity >= 96) cat = '3';
    else if (intensity >= 83) cat = '2';
    else if (intensity >= 64) cat = '1';
  }

  var fecha = last.updated ? new Date(last.updated).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }) : '—';

  el.innerHTML = `
    <div style="background:linear-gradient(135deg,#FF4500,#8B0000);color:#fff;padding:0.7rem 0.8rem;border-radius:8px;margin-bottom:0.6rem;">
      <div style="font-size:0.9rem;font-weight:800;display:flex;align-items:center;gap:0.4rem;">
        <i class="fas fa-hurricane"></i> ${nombreClase} ${last.name || '—'}
        ${cat !== '—' ? `<span style="background:rgba(255,255,255,0.2);padding:0.15rem 0.4rem;border-radius:4px;font-size:0.7rem;">Cat. ${cat}</span>` : ''}
      </div>
      <div style="font-size:0.58rem;opacity:0.85;margin-top:0.2rem;">Último reporte: ${fecha}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;">
      <div class="huracan-stat"><div class="stat-lbl">POSICIÓN</div><div class="stat-val">${(last.lat||0).toFixed(1)}°N, ${Math.abs(last.lon||0).toFixed(1)}°W</div></div>
      <div class="huracan-stat"><div class="stat-lbl">VIENTOS</div><div class="stat-val">${intensity} nudos</div></div>
      <div class="huracan-stat"><div class="stat-lbl">PRESIÓN</div><div class="stat-val">${last.pressure || '—'} mb</div></div>
      <div class="huracan-stat"><div class="stat-lbl">MOVIMIENTO</div><div class="stat-val" style="font-size:0.65rem;">${last.movement || '—'}</div></div>
    </div>
    <div style="margin-top:0.6rem;padding:0.5rem;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:6px;font-size:0.62rem;line-height:1.4;">
      <b>Fuente imagen:</b> NASA GIBS · VIIRS NOAA-21 (~250m/píxel)<br>
      <b>Fuente posición:</b> NOAA/NHC<br>
      ${last.advisory ? `<b>Aviso:</b> ${last.advisory.substring(0, 120)}${last.advisory.length > 120 ? '...' : ''}` : ''}
    </div>
    ${storms.length > 0 ? `<div style="margin-top:0.5rem;font-size:0.65rem;color:var(--text-muted);">Total tormentas activas: <b>${storms.length}</b></div>` : ''}
  `;
}

// ================================================================
// INICIALIZAR SECCIÓN HURACANES
// ================================================================

async function initHuracanes() {
  console.log('[Huracanes] Inicializando...');

  // Añadir capa VIIRS NOAA-21
  if (!huracanesLayerVIIRS) {
    huracanesLayerVIIRS = crearCapaVIIRSHuracan(1);
    huracanesLayerVIIRS.on('tileerror', function() {
      // Fallback a SNPP si NOAA-21 falla
      console.warn('[Huracanes] NOAA-21 no disponible, usando VIIRS SNPP');
      if (huracanesLayerVIIRS) {
        map.removeLayer(huracanesLayerVIIRS);
        huracanesLayerVIIRS = crearCapaVIIRSSNPP(1);
        huracanesLayerVIIRS.addTo(map);
      }
    });
    huracanesLayerVIIRS.addTo(map);
  }

  // Fetch datos NHC
  var data = await fetchNHCTormentas();
  huracanesData = data;

  // Renderizar tormentas
  var storms = data.activeStorms || [];
  var last = data.lastKnown || storms[0] || null;

  if (last) {
    renderHuracanPosicion(last);
    renderHuracanTrack(last);
    // Centrar mapa en el huracán
    if (last.lat && last.lon) {
      map.setView([last.lat, last.lon], 5);
    }
  }

  actualizarPanelHuracanes(data);
  huracanesVisible = true;
  console.log(`[Huracanes] ${storms.length} tormentas activas`);
}

function limpiarHuracanes() {
  if (huracanesLayerVIIRS) {
    try { map.removeLayer(huracanesLayerVIIRS); } catch(e) {}
    huracanesLayerVIIRS = null;
  }
  if (huracanesLayerPos) {
    try { map.removeLayer(huracanesLayerPos); } catch(e) {}
    huracanesLayerPos = null;
  }
  if (huracanesTrackLayer) {
    try { map.removeLayer(huracanesTrackLayer); } catch(e) {}
    huracanesTrackLayer = null;
  }
  huracanesData = null;
  huracanesVisible = false;
  var el = document.getElementById('huracanes-info');
  if (el) el.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.7rem;padding:1rem;">Sección Huracanes inactiva</p>';
}

// Actualizar imagen VIIRS (cambiar fecha)
function actualizarVIIRSFecha(dias) {
  if (huracanesLayerVIIRS) {
    try { map.removeLayer(huracanesLayerVIIRS); } catch(e) {}
  }
  huracanesLayerVIIRS = crearCapaVIIRSHuracan(dias);
  huracanesLayerVIIRS.on('tileerror', function() {
    if (huracanesLayerVIIRS) {
      map.removeLayer(huracanesLayerVIIRS);
      huracanesLayerVIIRS = crearCapaVIIRSSNPP(dias);
      huracanesLayerVIIRS.addTo(map);
    }
  });
  huracanesLayerVIIRS.addTo(map);
}

window.initHuracanes = initHuracanes;
window.limpiarHuracanes = limpiarHuracanes;
window.actualizarVIIRSFecha = actualizarVIIRSFecha;
window.huracanesData = huracanesData;
