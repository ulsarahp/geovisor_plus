// ================================================================
// CONFIG — única definición de constantes del proyecto Geovisor CONANP
// Este es el único lugar donde se definen. El resto del código
// las consume como globales (clásico) o vía import (módulo).
// El servicio WFS es siempre el institucional de CONANP.
// ================================================================
var GEOSERVER_URL = 'https://geoserver.conanp.gob.mx/geoserver/SIG-DES/wfs?';
function resolveGeoserverBase(){
  try{ localStorage.removeItem('geovisor-geoserver'); }catch(e){}
  return GEOSERVER_URL;
}

var GEOSERVER_BASE = resolveGeoserverBase();
var WORKSPACE = 'SIG-DES';
var CAPAS_CONOCIDAS = ['shp_advc','shp_anp','shp_kba_mex','shp_ramsar','shp_ramsar_mex','shp_reg_conanp','shp_reg_conanp_mex','shp_unescomab_mex','shp_unescopatrimonio_mex','shp_zp_anp_mex','shp_00ent','shp_00mun'];
var NOMBRES_ESPECIALES = {'shp_00ent':'Límite estatal','shp_00mun':'Límite municipal','shp_ramsar':'Sitios RAMSAR México','shp_unescomab_mex':'UNESCO MaB'};
var SHAPE_URLS = {
  'shp_advc': 'https://sig.conanp.gob.mx/container/descargas/files/shape/623_ADVC_VIGENTES_JUNIO_2026.zip',
  'shp_anp': 'https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip'
};

try{
  window.GEOSERVER_BASE = GEOSERVER_BASE;
  window.WORKSPACE = WORKSPACE;
  window.CAPAS_CONOCIDAS = CAPAS_CONOCIDAS;
  window.NOMBRES_ESPECIALES = NOMBRES_ESPECIALES;
  window.SHAPE_URLS = SHAPE_URLS;
  window.resolveGeoserverBase = resolveGeoserverBase;
}catch(e){}

// NOTA: este archivo se carga como script clásico (compatible file://).
// main.js lo importa como módulo por efectos laterales y re-exporta
// los valores desde window.* (ver assets/js/main.js).
