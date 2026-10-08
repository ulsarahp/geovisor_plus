(function(){
'use strict';
// ================================================================
// MAIN — punto de entrada único del proyecto Geovisor CONANP
// index.html solo programa la vista; toda la lógica vive en assets/js.
// Flujo: config.js (constantes, una sola definición) -> legados
// clásicos (mapa, panel, dashboard) -> main.js (verificación y arranque).
// Los módulos ES se difieren por defecto: este archivo se ejecuta
// antes de DOMContentLoaded, así que los legados (que solo leen las
// constantes dentro de funciones) ya encuentran window.* listo.
// Migración total a módulos: ver docs/FUNCIONAMIENTO.md.
// ================================================================

const GEOSERVER_BASE = window.GEOSERVER_BASE;
const WORKSPACE = window.WORKSPACE;
const CAPAS_CONOCIDAS = window.CAPAS_CONOCIDAS;
const NOMBRES_ESPECIALES = window.NOMBRES_ESPECIALES;
const SHAPE_URLS = window.SHAPE_URLS;
const resolveGeoserverBase = window.resolveGeoserverBase;

const APP_INFO = Object.freeze({
  nombre: 'Geovisor CONANP',
  subtitulo: 'Sistema de Información Geográfica CONANP',
  norma: 'ISO 19115:2003',
  crs: 'EPSG:4326'
});

function environmentReport(){
  return {
    app: APP_INFO.nombre,
    geoserver: window.GEOSERVER_BASE,
    workspace: window.WORKSPACE,
    capas: (window.CAPAS_CONOCIDAS || []).length,
    protocolo: (function(){ try{ return location.protocol; }catch(e){ return '?'; } })(),
    host: (function(){ try{ return location.hostname || '(archivo local)'; }catch(e){ return '?'; } })()
  };
}

try{
  document.addEventListener('DOMContentLoaded', function(){
    try{
      if(typeof window.updateSystemStatus === 'function') window.updateSystemStatus();
    }catch(e){}
    try{ console.info('[Geovisor CONANP]', environmentReport()); }catch(e){}
  });
}catch(e){}


window.APP_INFO = APP_INFO;
window.environmentReport = environmentReport;

})();
