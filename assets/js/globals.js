// ================================================================
// GLOBALS
// ================================================================
const activeLayers={};let allFeaturesForSearch=[],userLayerCounter=0,drawCounter=0,temaActual='general',tablaActual='anp';
const filtrosPorCapa={}; let printAreaBounds=null, printAreaLayer=null;
let chartAnpCount=null,chartAnpArea=null,chartAdvc=null;
let dashChartTerrestre=null,dashChartBarCat=null,dashChartBarEstados=null,dashChartAdvcProp=null,dashChartPeriodo=null,dashChartPeriodoAdvc=null;
let advPeriodoMode='area';
let periodoDetalleModo='area';
let barCatMode='area',barEstadosMode='area',barCatData=null,barEstadosData=null;
const PERIODOS=[
  {lbl:'1917-20', s:'1917-01-01', e:'1920-12-31'}, {lbl:'1920-24', s:'1920-12-01', e:'1924-11-30'},
  {lbl:'1924-28', s:'1924-12-01', e:'1928-11-30'}, {lbl:'1928-34', s:'1928-12-01', e:'1934-11-30'},
  {lbl:'1934-40', s:'1934-12-01', e:'1940-11-30'}, {lbl:'1940-46', s:'1940-12-01', e:'1946-11-30'},
  {lbl:'1946-52', s:'1946-12-01', e:'1952-11-30'}, {lbl:'1952-58', s:'1952-12-01', e:'1958-11-30'},
  {lbl:'1958-64', s:'1958-12-01', e:'1964-11-30'}, {lbl:'1964-70', s:'1964-12-01', e:'1970-11-30'},
  {lbl:'1970-76', s:'1970-12-01', e:'1976-11-30'}, {lbl:'1976-82', s:'1976-12-01', e:'1982-11-30'},
  {lbl:'1982-88', s:'1982-12-01', e:'1988-11-30'}, {lbl:'1988-94', s:'1988-12-01', e:'1994-11-30'},
  {lbl:'1994-00', s:'1994-12-01', e:'2000-11-30'}, {lbl:'2000-06', s:'2000-12-01', e:'2006-11-30'},
  {lbl:'2006-12', s:'2006-12-01', e:'2012-11-30'}, {lbl:'2012-18', s:'2012-12-01', e:'2018-11-30'},
  {lbl:'2018-24', s:'2018-12-01', e:'2024-09-30'}, {lbl:'2024-30', s:'2024-10-01', e:'2030-12-31'}
];
function parseDOF(v){
  if(!v) return null;
  const s=String(v).trim();
  let d=new Date(s);
  if(!isNaN(d)) return d;
  const m=s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if(m) { d=new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`); if(!isNaN(d)) return d; }
  return null;
}
function periodoDeFecha(d){ if(!d) return null; for(const p of PERIODOS){ const s=new Date(p.s), e=new Date(p.e); if(d>=s && d<=e) return p.lbl; } return null; }

// ================================================================
// DASHBOARD INTERACTIVITY · filter state
// ================================================================
const TABLE_PAGE_SIZE=25, TABLE_EXPANDED_SIZE=100;
let tableExpanded=false;
let dashboardFilters={cat:null,estado:null,propiedad:null};
function getFilteredFeatures(layerKey){
 if(!layerKey||!activeLayers[layerKey])return[];
 const entry=activeLayers[layerKey];
 try{ if(!map.hasLayer(entry.layer)) return []; }catch(e){}
 let f=entry.featuresData||[];
 const bounds=map.getBounds();
 f=f.filter(ft=>{try{return bounds.intersects(L.geoJSON(ft).getBounds());}catch(e){return false;}});
 if(dashboardFilters.cat&&esCapaAnpPrincipal(layerKey)){
  const catCol=activeLayers[layerKey].categoriaCol;
  if(catCol)f=f.filter(ft=>String(ft.properties[catCol]).trim()===dashboardFilters.cat);
 }
 if(dashboardFilters.estado&&esCapaAnpPrincipal(layerKey)){
  const q=dashboardFilters.estado.toLowerCase();
  f=f.filter(ft=>{ const p=ft.properties||{}; return [p.estados,p.estado].some(v=>String(v||'').toLowerCase().includes(q)); });
 }
 if(dashboardFilters.estado&&esCapaAdvc(layerKey)){
  f=f.filter(ft=>String(ft.properties.estado||'').trim()===dashboardFilters.estado);
 }
  if(dashboardFilters.propiedad&&esCapaAdvc(layerKey)){
   let tipoCol=null;const p0=f[0]?.properties||{};
   for(const k of['tipo_prop','tipo_propietario','propietario','tenencia']){if(p0[k]!==undefined){tipoCol=k;break;}}
   if(!tipoCol)for(const k of Object.keys(p0)){if(k.toLowerCase().includes('prop')||k.toLowerCase().includes('tenencia')){tipoCol=k;break;}}
   if(tipoCol)f=f.filter(ft=>agruparPropiedad(estandarizarTipoPropietario(ft.properties[tipoCol]||''))===dashboardFilters.propiedad);
  }
  return f;
}
function clearDashboardFilters(){dashboardFilters={cat:null,estado:null,propiedad:null};tableExpanded=false;actualizarDashboard();}

function applyDashboardFilterToMap(){
 const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));
 const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));
 if(anpK&&activeLayers[anpK].layer){
  const entry=activeLayers[anpK];
  const catCol=entry.categoriaCol;
  const hasFilter=dashboardFilters.cat!==null;
  activeLayers[anpK].layer.eachLayer(layer=>{
   if(!layer.setStyle)return;
   if(hasFilter&&catCol){
    const cat=String(layer.feature?.properties?.[catCol]||'').trim();
    if(cat===dashboardFilters.cat){layer.setStyle({fillOpacity:0.55,opacity:0.9,weight:2});}
    else{layer.setStyle({fillOpacity:0.06,opacity:0.15,weight:0.8});}
   }else{
    const gt=entry.geomType||'';
    if(gt.includes('Point'))layer.setStyle({fillOpacity:0.88,opacity:1,radius:6,weight:1});
    else if(gt.includes('Line'))layer.setStyle({opacity:0.82,weight:2.5});
    else layer.setStyle({fillOpacity:0.42,opacity:0.88,weight:2});
   }
  });
 }
 if(advcK&&activeLayers[advcK].layer){
  const entry=activeLayers[advcK];
  const hasEstado=dashboardFilters.estado!==null;
  const hasProp=dashboardFilters.propiedad!==null;
  let tipoCol=null;
  if(hasProp&&(activeLayers[advcK].featuresData||[]).length){
   const p0=activeLayers[advcK].featuresData[0].properties;
   for(const k of['tipo_prop','tipo_propietario','propietario','tenencia']){if(p0[k]!==undefined){tipoCol=k;break;}}
   if(!tipoCol)for(const k of Object.keys(p0)){if(k.toLowerCase().includes('prop')||k.toLowerCase().includes('tenencia')){tipoCol=k;break;}}
  }
  activeLayers[advcK].layer.eachLayer(layer=>{
   if(!layer.setStyle)return;
   const p=layer.feature?.properties||{};
   let match=true;
   if(hasEstado){const est=String(p.estado||'').trim();if(est!==dashboardFilters.estado)match=false;}
   if(hasProp&&tipoCol){const grupo=agruparPropiedad(estandarizarTipoPropietario(p[tipoCol]||''));if(grupo!==dashboardFilters.propiedad)match=false;}
   if(match)layer.setStyle({fillOpacity:0.55,opacity:0.9,weight:2});
   else layer.setStyle({fillOpacity:0.06,opacity:0.15,weight:0.8});
  });
 }
}