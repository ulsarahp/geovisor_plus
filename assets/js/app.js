
// ================================================================
// CONFIG
/* Constantes centrales en assets/js/config.js (única definición). main.js las expone en window.*. */
// ================================================================

// ================================================================
// MAPEO PROPIETARIO
// ================================================================
const MAPEO_TIPO_PROPIETARIO={'Asociaciones':'Persona moral','Comunidades':'Comunidad (Bienes comunales)','Ejido (Tierras de Uso Común)':'Ejido (Tierras de Uso Común)','Empresas de Participación Estatal':'Empresa de Participación Estatal','Estatal':'Público Estatal','Federal':'Público Federal','Municipal':'Público Municipal','Parcelas':'Ejido (Parcela)','Persona Física':'Persona física','Personas Físicas':'Persona física','Personas físicas':'Persona física','Persona Moral':'Persona moral','Prop publico_municipal':'Público Municipal','Prop. Privada_ Persona física':'Persona física','Prop.Privada_Persona moral':'Persona moral','Prop.Social_Comunidad_TUC':'Comunidad (Bienes comunales)','Prop.Social_Ejido_Parcela':'Ejido (Parcela)','Prop.Social_Ejido_TUC':'Ejido (Tierras de Uso Común)','Propiedad Federal Personales Morales Públicas (FINABIEN)':'Propiedad pública','Propiedad Privada':'Persona moral','Propiedad Social Comunidad (Bienes comunales)':'Comunidad (Bienes comunales)','Propiedad Social Ejido (Tierras de Uso Común)':'Ejido (Tierras de Uso Común)','Propiedad social':'Ejido (Tierras de Uso Común)','Pública Estatal':'Público Estatal','Público-Centralizado Federal':'Público Federal','Público-Descentralizado Estatal':'Público Estatal','Público-Descentralizado Federal':'Público Federal','Sociedades':'Persona moral','Tierras de Uso Común':'Ejido (Tierras de Uso Común)','Tierras de Uso Común y Parcelas':'Ejido (Tierras de Uso Común y Parcelas)'};
function estandarizarTipoPropietario(v){if(!v)return'Otros';const s=String(v).trim();if(MAPEO_TIPO_PROPIETARIO[s])return MAPEO_TIPO_PROPIETARIO[s];for(const[k,m]of Object.entries(MAPEO_TIPO_PROPIETARIO)){if(s.includes(k)||k.includes(s))return m;}return s;}
function agruparPropiedad(c){const soc=['Ejido (Tierras de Uso Común)','Comunidad (Bienes comunales)','Ejido (Tierras de Uso Común y Parcelas)','Ejido (Parcela)','Tierras de Uso Común','Tierras de uso común','Comunidades','Prop.Social_Ejido_Parcela','Prop.Social_Ejido_TUC','Parcelas','Tierras de Uso Común y Parcelas','Prop.Social_Comunidad_TUC','Propiedad Social Comunidad (Bienes comunales)','Propiedad Social Ejido (Tierras de Uso Común)','Propiedad social'];const pri=['Persona física','Persona moral','Empresa de Participación Estatal','Empresas de Participación Estatal','Personas Físicas','Sociedades','Asociaciones','Propiedad privada','Prop.Privada_Persona moral','Prop. Privada_ Persona física','Propiedad privada_ Persona física','Propiedad privada_ Persona moral','Propiedad privada_Persona Moral','Propiedad privada_Persona Física'];const pub=['Público Federal','Público Estatal','Público Municipal','Propiedad pública','Municipal','Federal','Estatal','Público-Descentralizado Estatal','Público-Descentralizado Federal','Público-Centralizado Federal','Pública Estatal','Prop publico_municipal','Propiedad Federal Personales Morales Públicas (FINABIEN)'];if(soc.includes(c))return'Social';if(pri.includes(c))return'Privada';if(pub.includes(c))return'Pública';return'Otros';}
function clasificarPropiedadDetalle(raw){
 if(!raw) return 'Otros';
 const s=String(raw).trim();
 const lo=s.toLowerCase();
 if(lo.includes('tierras de uso com') ) return 'Tierras de uso común';
 if(lo.includes('propiedad privada') && lo.includes('moral')) return 'Propiedad privada_ Persona moral';
 if(lo.includes('propiedad privada') && (lo.includes('física')||lo.includes('fisica'))) return 'Propiedad privada_ Persona física';
 if(lo.includes('prop. privada') && lo.includes('moral')) return 'Propiedad privada_ Persona moral';
 if(lo.includes('prop. privada') && (lo.includes('física')||lo.includes('fisica'))) return 'Propiedad privada_ Persona física';
 const est=estandarizarTipoPropietario(s);
 const grp=agruparPropiedad(est);
 if(grp==='Social') return 'Tierras de uso común';
 if(grp==='Privada'){
   if(lo.includes('moral')) return 'Propiedad privada_ Persona moral';
   if(lo.includes('física')||lo.includes('fisica')) return 'Propiedad privada_ Persona física';
   return est;
 }
 return grp;
}

// ================================================================
// HELPERS
// ================================================================
function getNombreAmigable(t){if(NOMBRES_ESPECIALES[t])return NOMBRES_ESPECIALES[t];const l=t.toLowerCase();if(l.includes('shp_anp'))return'Áreas Naturales Protegidas';if(l.includes('shp_advc'))return'Áreas Destinadas Voluntariamente a la Conservación';if(l.includes('shp_reg_conanp'))return'Regiones CONANP';if(l.includes('shp_zp_anp'))return'Zonas Núcleo de ANP';if(l.includes('shp_kba'))return'KBA México';if(l.includes('shp_ramsar'))return'Sitios RAMSAR México';if(l.includes('shp_unescomab'))return'UNESCO MaB';if(l.includes('shp_unescopatrimonio'))return'UNESCO Patrimonio';return t;}
function esCapaAnpPrincipal(t){const l=t.toLowerCase();return l.includes('shp_anp')&&!l.includes('zp_anp')&&!l.includes('reg_conanp');}
function esCapaAdvc(t){return t.toLowerCase().includes('shp_advc');}
function getColorPorNombreCapa(t){const l=t.toLowerCase();if(l.includes('shp_anp')||l.includes('shp_reg_conanp')||l.includes('shp_zp_anp'))return'#6B1132';if(l.includes('shp_advc'))return'#6F4489';if(l.includes('shp_ramsar'))return'#38BAB4';if(l.includes('shp_unesco'))return'#1E90FF';if(l.includes('shp_kba'))return'#FF8C00';if(l.includes('shp_00ent'))return'#667';if(l.includes('shp_00mun'))return'#99a';return'#aaa';}
const SIGLA_COLOR={'rb':'#ABCD66','pn':'#A77100','mn':'#E70101','aprn':'#BCB602','apff':'#FDC03D','s':'#0546DA','advc':'#6F4489','ramsar':'#38BAB4'};
const CATEGORIA_COLOR={'reservas de la biosfera':'#ABCD66','parques nacionales':'#A77100','monumentos naturales':'#E70101','areas de proteccion de recursos naturales':'#BCB602','areas de proteccion de flora y fauna':'#FDC03D','santuarios':'#0546DA','areas destinadas voluntariamente a la conservacion':'#6F4489','sitios ramsar':'#38BAB4'};
function getNombreCompleto(s){if(!s)return s;const m={'RB':'Reservas de la Biosfera','PN':'Parques Nacionales','MN':'Monumentos Naturales','APRN':'Áreas de Protección de Recursos Naturales','APFF':'Áreas de Protección de Flora y Fauna','SANT':'Santuarios','ADVC':'Áreas Destinadas Voluntariamente a la Conservación','RAMSAR':'Sitios RAMSAR'};return m[s.trim().toUpperCase()]||s;}
function getColorPorCategoria(c){if(!c)return'#888';const v=String(c).trim().toLowerCase();if(SIGLA_COLOR[v])return SIGLA_COLOR[v];for(const[n,col]of Object.entries(CATEGORIA_COLOR)){if(v.includes(n)||n.includes(v))return col;}let h=0;for(let i=0;i<v.length;i++)h=v.charCodeAt(i)+((h<<5)-h);return`hsl(${Math.abs(h)%360},70%,52%)`;}
function detectarColumnaCategoria(features){if(!features||!features.length)return null;const cols=Object.keys(features[0].properties);const pref=['cat_man','categoria','categoria_manejo','cat_manejo','tipo','clase','siglas','cve_cat'];for(const c of pref){if(cols.includes(c)){const v=new Set();features.forEach(f=>{const x=f.properties[c];if(x&&x!=='null')v.add(String(x).trim());});if(v.size>1)return c;}}for(const c of cols){const l=c.toLowerCase();if(l.includes('cat')||l.includes('tipo')||l.includes('clase')){const v=new Set();features.forEach(f=>{const x=f.properties[c];if(x&&x!=='null')v.add(String(x).trim());});if(v.size>1)return c;}}return null;}
function toHa(v){ if(v===null||v===undefined||v==='') return NaN; const n=Number(String(v).replace(/,/g,'').trim()); return Number.isFinite(n)? n : NaN; }
function detectarColumnaSuperficie(features){
  if(!features||!features.length) return null;
  const sample=features.slice(0,5);
  const isAdvcSample=sample.some(f=> JSON.stringify(f.properties).toLowerCase().includes('ha_cert'));
  const prefAdvc=['ha_cert','ha','certificada','superficie','sup_ha','area_ha'];
  const prefAnp=['superficie','sup_ha','s_terres','s_marina','shape_area','area_ha','area'];
  const pref=isAdvcSample? prefAdvc : prefAnp;
  for(const k of pref){
    for(const f of sample){
      const v=f.properties[k];
      const n=toHa(v);
      if(Number.isFinite(n) && n>=0) return k;
    }
  }
  const allKeys=[...new Set(sample.flatMap(f=>Object.keys(f.properties)))];
  for(const k of allKeys){
    const l=k.toLowerCase();
    if(l.includes('area')||l.includes('sup')||l.includes('hect')||l.includes('ha_')){
      let vals=new Set();
      for(const f of sample){ const n=toHa(f.properties[k]); if(Number.isFinite(n)) vals.add(n); }
      if(vals.size>0) return k;
    }
  }
  for(const k of allKeys){
    let vals=new Set();
    for(const f of sample){ const n=toHa(f.properties[k]); if(Number.isFinite(n)) vals.add(n); }
    if(vals.size>1) return k;
  }
  return null;
}
function getFeatureName(p){for(const c of['nombre','advc','nom','NOM','NOMBRE','NAME','descripcion','nombre_sitio','nombre_anp','advc_nombre']){if(p[c]!==undefined&&p[c]!==null&&p[c]!=='')return String(p[c]);}return p.gid?`Elemento ${p.gid}`:p.id?`Elemento ${p.id}`:'Sin nombre';}
function formatearNumero(v){if(v===null||v===undefined||isNaN(v))return'—';return v.toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:2});}
function formatearValor(v){if(v===null||v===undefined)return'—';if(typeof v==='number')return formatearNumero(v);if(typeof v==='boolean')return v?'Sí':'No';return String(v);}
function getGrupoYTema(t){const l=t.toLowerCase();if(l.includes('shp_00ent')||l.includes('shp_00mun'))return{grupo:'Contexto Geográfico',tema:'general'};if(l.includes('shp_advc'))return{grupo:'CONANP',tema:'advc'};if(l.includes('shp_anp')||l.includes('shp_reg_conanp')||l.includes('shp_zp_anp'))return{grupo:'CONANP',tema:'general'};if(l.includes('shp_ramsar')||l.includes('shp_unesco')||l.includes('shp_kba'))return{grupo:'Designaciones Internacionales',tema:'general'};return{grupo:'Otras',tema:'general'};}
function aplicarFiltro(tema){document.querySelectorAll('.capa-item').forEach(item=>{const t=item.dataset.tema;if(tema==='general'){item.classList.remove('atenuado');}else if(tema==='advc'){if(t==='general'||t==='advc')item.classList.remove('atenuado');else item.classList.add('atenuado');}});}
// en la sección ADVC se atenúan las ANP y se resaltan las ADVC sobre el mapa
function resaltarTemaEnMapa(tema){
 const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));
 const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));
 Object.entries(activeLayers).forEach(([k,entry])=>{
  if(!entry||!entry.layer) return;
  if(k.startsWith('usuario_')||k.startsWith('dibujo_')) return;
  const gt=entry.geomType||'';
  const isLine=gt.includes('Line'), isPoint=gt.includes('Point');
  try{
   entry.layer.eachLayer(sub=>{
    if(!sub.setStyle) return;
    if(tema==='advc'){
     if(k===advcK) sub.setStyle(isPoint?{fillOpacity:0.9,opacity:1,weight:1.5}:isLine?{opacity:0.9,weight:3}:{fillOpacity:0.6,opacity:1,weight:2.5});
     else if(k===anpK) sub.setStyle(isPoint?{fillOpacity:0.08,opacity:0.2}:isLine?{opacity:0.2,weight:1}:{fillOpacity:0.07,opacity:0.18,weight:1});
     else sub.setStyle(isPoint?{fillOpacity:0.25,opacity:0.4}:isLine?{opacity:0.35,weight:1.5}:{fillOpacity:0.12,opacity:0.35,weight:1});
    }else{
     if(isPoint) sub.setStyle({fillOpacity:0.88,opacity:1,weight:1});
     else if(isLine) sub.setStyle({opacity:0.82,weight:2.5});
     else sub.setStyle({fillOpacity:0.42,opacity:0.88,weight:2});
    }
   });
  }catch(e){}
 });
}
function descargarGeoJSON(tbl){const e=activeLayers[tbl];if(!e){alert('Capa no cargada.');return;}const f=e.featuresData;if(!f||!f.length){alert('Sin datos.');return;}const b=new Blob([JSON.stringify({type:'FeatureCollection',features:f},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${tbl}.geojson`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);}
function descargarKML(){alert('KML no implementado — use GeoJSON/CSV.');}
function descargarCSV(){alert('CSV no implementado — use descargarCapa.');}
function descargarSHP(){alert('Shapefile no implementado — use GeoJSON/CSV.');}
function descargarCapa(tbl, fmt){
 const e=activeLayers[tbl];
 if(fmt==='shp'){
   const key = tbl.toLowerCase();
   const direct = SHAPE_URLS[key] || SHAPE_URLS[key.replace('shp_','')] || null;
   if(direct){
     window.open(direct, '_blank', 'noopener');
     return;
   }
   // Para otras capas CONANP, redirigir a SIG; para no CONANP, avisar
   const isConanpLayer = tbl.toLowerCase().includes('anp') || tbl.toLowerCase().includes('advc') || tbl.toLowerCase().includes('conanp') || tbl.toLowerCase().includes('kba') || tbl.toLowerCase().includes('ramsar');
   if(isConanpLayer){
     window.open('https://sig.conanp.gob.mx/', '_blank', 'noopener');
     return;
   } else {
     alert('Descarga Shapefile solo disponible para capas CONANP. Visita https://sig.conanp.gob.mx/');
     return;
   }
 }
 if(!e){alert('Capa no cargada.');return;}
 if(fmt==='geojson') return descargarGeoJSON(tbl);
 if(fmt==='csv'){
  const feats=e.featuresData||[]; if(!feats.length){alert('Sin datos.');return;}
  let csv='';
  try{
   if(window.Papa && Papa.unparse){
    const rows=feats.map(f=>f.properties); csv=Papa.unparse(rows);
   } else throw new Error('no Papa');
  }catch(err){
   const props=feats[0]?.properties||{};
   const headers=Object.keys(props);
   csv=headers.map(h=>`"${h.replace(/"/g,'""')}"`).join(',')+'\n';
   feats.forEach(f=>{
    const row=headers.map(h=>{ let v=f.properties[h]; if(v===null||v===undefined) return ''; v=String(v).replace(/"/g,'""'); return `"${v}"`; }).join(',');
    csv+=row+'\n';
   });
  }
  const b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${tbl}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
  return;
 }
 if(fmt==='kml'){ alert(fmt.toUpperCase()+' no implementado — use GeoJSON/CSV.'); return; }
}
function descargarGraficoUnificado(inst, fmt, titulo){
 if(!inst){alert('Sin datos.');return;}
 if(fmt==='csv'){
  let csv=`"${(titulo||'Categoría').replace(/"/g,'""')}",Valor\n`;
  const labels=inst.data.labels||[]; const data=inst.data.datasets?.[0]?.data||[];
  labels.forEach((l,i)=>{ const lab=String(l).replace(/"/g,'""'); csv+=`"${lab}",${data[i]||0}\n`; });
  const b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`grafico_${Date.now()}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href); return;
 }
 const mime=fmt==='jpg'?'image/jpeg':'image/png'; const ext=fmt;
 const a=document.createElement('a'); a.download=`grafico_${Date.now()}.${ext}`; a.href=inst.canvas.toDataURL(mime,0.95); document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ================================================================
// THEME MANAGER · tema oscuro/claro
// ================================================================
const TEMA_KEY='geovisor-theme';
const CFG_TEMA={dark:{icono:'fa-sun',titulo:'Cambiar a tema claro'},light:{icono:'fa-moon',titulo:'Cambiar a tema oscuro'}};
function temaActualUI(){return document.documentElement.getAttribute('data-theme')==='light'?'light':'dark';}
function coloresTema(){return temaActualUI()==='light'
 ?{texto:'#51617a',grid:'rgba(15,23,42,0.10)',donut:'#ffffff'}
 :{texto:'#94a3b8',grid:'rgba(255,255,255,0.06)',donut:'rgba(0,0,0,0.3)'};}
function graficosActivos(){
 try{
  return[chartAnpCount,chartAnpArea,chartAdvc,dashChartTerrestre,dashChartBarCat,dashChartBarEstados,dashChartAdvcProp,modalChartInstance].filter(Boolean);
 }catch(e){return[];}
}
function aplicarColoresCharts(){
 const c=coloresTema();
 Chart.defaults.color=c.texto;
 Chart.defaults.borderColor=c.grid;
 graficosActivos().forEach(ch=>{
  try{
   if(ch.config.type==='doughnut'||ch.config.type==='pie')ch.data.datasets.forEach(ds=>ds.borderColor=c.donut);
   if(ch.options.plugins&&ch.options.plugins.legend&&ch.options.plugins.legend.labels)ch.options.plugins.legend.labels.color=c.texto;
   ['x','y'].forEach(eje=>{
    const s=ch.options.scales&&ch.options.scales[eje];
    if(s){if(s.ticks)s.ticks.color=c.texto;if(s.grid)s.grid.color=c.grid;if(s.border)s.border.color=c.grid;}
   });
   ch.update();
  }catch(e){}
 });
}
function sincronizarMapaBaseConTema(tema){
 const objetivo=tema==='light'?baseLight:baseDark;
 const esBaseTema=mapaBaseActivo===baseDark||mapaBaseActivo===baseLight;
 if(!esBaseTema||!objetivo||map.hasLayer(objetivo))return;
 if(controlCapas&&controlCapas._layers){
  const obj=controlCapas._layers.find(l=>l.layer===objetivo);
  if(obj&&obj.input){obj.input.click();return;}
 }
 map.removeLayer(mapaBaseActivo);objetivo.addTo(map);
}
function aplicarTema(tema,persistir){
 tema=tema==='light'?'light':'dark';
 document.documentElement.setAttribute('data-theme',tema);
 const cfg=CFG_TEMA[tema];
 const btn=document.getElementById('theme-toggle');
 if(btn){btn.innerHTML=`<i class="fas ${cfg.icono}"></i>`;btn.title=cfg.titulo;}
 sincronizarMapaBaseConTema(tema);
 actualizarSombreadoPaises();
 aplicarColoresCharts();
 if(persistir!==false){try{localStorage.setItem(TEMA_KEY,tema);}catch(e){}}
}
Chart.defaults.color=coloresTema().texto;
Chart.defaults.borderColor=coloresTema().grid;
Chart.defaults.font.family="'Inter', sans-serif";

// ================================================================
// MAP
// ================================================================
const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — World Imagery', maxZoom:19, crossOrigin:true});
const esriTopo=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — Topo', maxZoom:19, crossOrigin:true});
const esriStreet=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — Street', maxZoom:19, crossOrigin:true});
const esriPhysical=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — Physical', maxZoom:8, crossOrigin:true});
const esriOcean=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — Ocean', maxZoom:13, crossOrigin:true});
const esriNatGeo=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — NatGeo', maxZoom:12, crossOrigin:true});
const esriGrayLight=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — Light Gray', maxZoom:16, crossOrigin:true});
const esriGrayDark=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; ESRI — Dark Gray', maxZoom:16, crossOrigin:true});
const osmHot=L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{attribution:'&copy; OSM HOT', maxZoom:19, crossOrigin:true});
const openTopo=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenTopoMap', maxZoom:17, crossOrigin:true});
const baseDark=esriGrayDark;
const baseLight=esriGrayLight;

const MEXICO_BOUNDS={north:32.718,south:14.535,west:-118.367,east:-86.710};
const map=L.map('map',{center:[23.5,-102],zoom:5,layers:[esriTopo],maxBounds:[[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]],maxBoundsViscosity:1.0,zoomControl:false});

const controlCapas=L.control.layers({
 '🛰️ ESRI Satélite (Imagery)':satellite,
 '🗺️ ESRI Topográfico':esriTopo,
 '🛣️ ESRI Calles (Street)':esriStreet,
 '🏔️ ESRI Físico':esriPhysical,
 '🌊 ESRI Océano':esriOcean,
 '🏞️ ESRI NatGeo':esriNatGeo,
 '⬜ ESRI Gris Claro':esriGrayLight,
 '⬛ ESRI Gris Oscuro':esriGrayDark,
 '🧡 OSM Humanitario (HOT)':osmHot,
 '⛰️ OpenTopoMap':openTopo
},null,{position:'topleft', collapsed:true}).addTo(map);
L.control.zoom({position:'topleft'}).addTo(map);

let mapaBaseActivo=baseDark;
map.on('baselayerchange',e=>{mapaBaseActivo=e.layer;});

const drawnItems=new L.FeatureGroup();map.addLayer(drawnItems);
const drawControl=new L.Control.Draw({position:'topleft',draw:{polygon:{allowIntersection:false,showArea:true,shapeOptions:{color:'#6B1132',weight:2,fillOpacity:0.25}},polyline:{shapeOptions:{color:'#1a5c4e',weight:3}},circle:false,rectangle:false,marker:true,circlemarker:false},edit:{featureGroup:drawnItems}});
map.addControl(drawControl);
map.on(L.Draw.Event.CREATED,function(e){
 try{
  if(window._printAreaActive){ manejarRectanguloImpresion(e.layer); return; }
  const layer=e.layer;
  let gj=null;
  try{ if(layer.toGeoJSON) gj=layer.toGeoJSON(); }catch(err){}
  if(!gj){
   try{ const ll=layer.getLatLng(); gj={type:'Feature', geometry:{type:'Point', coordinates:[ll.lng, ll.lat]}, properties:{}}; }catch(err){}
  }
  if(gj && gj.type==='FeatureCollection' && gj.features) gj=gj.features[0];
  if(!gj || !gj.geometry){ drawnItems.addLayer(layer); return; }
  const gt=gj.geometry.type||'';
  const tableName=`dibujo_${++drawCounter}`;
  const nombre=`Dibujo ${drawCounter}`;
  const hexColor=gt.includes('Point')?'#1a5c4e':(gt.includes('Line')?'#1a5c4e':'#6B1132');
  const symbology={pointColor:hexColor, pointRadius:6, pointOpacity:0.9, pointShape:'circle', lineColor:hexColor, lineWeight:3, lineDash:null, lineOpacity:0.85, polyColor:hexColor, polyFillColor:hexColor, polyWeight:2, polyOpacity:0.85, polyFillOpacity:0.42, polyFillType:'full'};
  let newLayer;
  if(gt.includes('Point')){
   newLayer=L.geoJSON({type:'FeatureCollection', features:[gj]}, {pointToLayer:(f,ll)=>createPointMarker(ll, symbology), onEachFeature:(f,l)=>l.bindPopup(crearPopupHTML(f, hexColor, nombre, tableName),{className:'custom-popup'})}).addTo(map);
  } else {
   newLayer=L.geoJSON({type:'FeatureCollection', features:[gj]}, {style:{color:hexColor, fillColor:hexColor, fillOpacity:0.42, weight:2, opacity:0.85}, onEachFeature:(f,l)=>l.bindPopup(crearPopupHTML(f, hexColor, nombre, tableName),{className:'custom-popup'})}).addTo(map);
  }
  activeLayers[tableName]={layer:newLayer, color:hexColor, opacity:1, geomType:gt, featuresData:[gj], categoriaCol:null, superficieCol:null, userColor:hexColor, userName:nombre, symbology, isDibujo:true};
  allFeaturesForSearch.push({feature:gj, layer:newLayer, capaNombre:nombre, color:hexColor, capaNombreTecnico:tableName});
  agregarCapaUsuarioALista(tableName, nombre, hexColor, gt);
  try{ const b=newLayer.getBounds(); if(b.isValid()) map.fitBounds(b, {padding:[24,24]}); }catch(err){}
  actualizarLeyenda(); actualizarContador(); actualizarSelectoresAnalisis();
  setTimeout(()=>{
   actualizarSelectoresAnalisis();
   const sel=document.getElementById('analisis-fuente');
   const selDest=document.getElementById('analisis-destino');
   if(sel){
    const hasOpt=[...sel.options].some(o=>o.value===tableName);
    if(hasOpt) sel.value=tableName;
    else if(sel.options.length>1) sel.selectedIndex=1;
    if(selDest && !selDest.value){
     for(let i=1;i<selDest.options.length;i++){ if(selDest.options[i].value && !selDest.options[i].disabled){ selDest.value=selDest.options[i].value; break; } }
    }
    if(typeof validarBtnAnalizar==='function') validarBtnAnalizar();
    const panel=document.getElementById('analisis-panel');
    if(panel){
     panel.style.display='flex';
     panel.classList.add('analisis-highlight');
     setTimeout(()=>panel.classList.remove('analisis-highlight'), 2200);
     try{ panel.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}
     const btn=document.getElementById('btn-ejecutar-analisis');
     if(btn && !btn.disabled){ btn.style.transform='scale(1.04)'; setTimeout(()=>btn.style.transform='', 600); }
    }
   }
  }, 150);
 }catch(err){ console.error('Error al crear dibujo como capa:', err); drawnItems.addLayer(e.layer); }
});

function zoomToLayerOrMexico(table){
 if(table){ zoomToLayer(table); return; }
 const visibles=Object.keys(activeLayers).filter(k=>{ try{ return map.hasLayer(activeLayers[k].layer); }catch(e){ return false; } });
 if(visibles.length===1){ zoomToLayer(visibles[0]); return; }
 if(visibles.length>1){
  try{ const grp=new L.featureGroup(visibles.map(k=>activeLayers[k].layer)); const b=grp.getBounds(); if(b.isValid()){ map.fitBounds(b,{padding:[24,24]}); return; } }catch(e){}
 }
 map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);
}
const ZoomControl=L.Control.extend({options:{position:'topleft'},onAdd:function(){
 const c=L.DomUtil.create('div','home-control-wrap');
 c.style.display='flex'; c.style.flexDirection='column';
 const b=L.DomUtil.create('a','home-control',c);
 b.innerHTML='<i class="fas fa-crosshairs"></i>'; b.title='Zoom a capa activa o vista México (clic principal: capa activa; ▼: México)'; b.href='#';
 L.DomEvent.on(b,'click',L.DomEvent.stopPropagation).on(b,'click',L.DomEvent.preventDefault).on(b,'click',()=>zoomToLayerOrMexico());
 const dd=L.DomUtil.create('a','home-control',c);
 dd.innerHTML='<i class="fas fa-chevron-down" style="font-size:0.6rem"></i>'; dd.title='Vista México'; dd.href='#'; dd.style.borderTop='1px solid var(--border-subtle)';
 L.DomEvent.on(dd,'click',L.DomEvent.stopPropagation).on(dd,'click',L.DomEvent.preventDefault).on(dd,'click',()=>map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]));
 return c;
}});
map.addControl(new ZoomControl());
const HomeControl=ZoomControl;

const PanelToggle=L.Control.extend({options:{position:'topleft'},onAdd:function(){const c=L.DomUtil.create('div','panel-toggle-wrap');const b=L.DomUtil.create('a','panel-toggle-control',c);b.innerHTML='<i class="fas fa-chevron-left" id="ptoggle-icon"></i>';b.href='#';b.title='Panel de capas';L.DomEvent.on(b,'click',L.DomEvent.stopPropagation).on(b,'click',L.DomEvent.preventDefault).on(b,'click',()=>togglePanel());return c;}});
map.addControl(new PanelToggle());
function togglePanel(){
 const p=document.getElementById('panel');
 const ic=document.getElementById('ptoggle-icon');
 const isMobile=window.innerWidth<=1440;
 if(isMobile){
  if(p.classList.contains('panel-open')){closePanel();ic.className='fas fa-chevron-right';}
  else{openPanel();ic.className='fas fa-chevron-left';}
 }else{
  p.classList.toggle('panel-hidden');
  ic.className=p.classList.contains('panel-hidden')?'fas fa-chevron-right':'fas fa-chevron-left';
  setTimeout(()=>map.invalidateSize(),320);
 }
}

L.control.scale({position:'bottomleft',imperial:false,metric:true}).addTo(map);
const NorthArrow=L.Control.extend({options:{position:'topright'},onAdd:function(){const d=L.DomUtil.create('div','north-arrow');d.innerHTML='<div style="background:rgba(255,255,255,0.92); padding:5px 7px; border-radius:6px; border:1px solid rgba(0,0,0,0.15); box-shadow:0 2px 6px rgba(0,0,0,0.15); text-align:center; line-height:1;"><div style="font-size:18px; color:#6B1132; line-height:1;">▲</div><div style="font-size:7px; font-weight:800; color:#1a1a1a; letter-spacing:0.5px;">N</div></div>';d.style.pointerEvents='none';return d;}});
map.addControl(new NorthArrow());

let sombraPaisesLayer=null;
function estiloSombreadoPaises(){return temaActualUI()==='light'
 ?{fillColor:'#dbe3ec',fillOpacity:0.85,color:'#aab6c5',weight:0.8,opacity:0.6}
 :{fillColor:'#080b10',fillOpacity:0.72,color:'#141824',weight:0.8,opacity:0.5};}
function actualizarSombreadoPaises(){if(sombraPaisesLayer)sombraPaisesLayer.setStyle(estiloSombreadoPaises());}
async function cargarSombreadoPaises(){try{const r=await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');if(!r.ok)return;const d=await r.json();sombraPaisesLayer=L.geoJSON({type:'FeatureCollection',features:d.features.filter(f=>f.properties.name!=='Mexico')},{style:estiloSombreadoPaises,interactive:false}).addTo(map);}catch(e){}}
cargarSombreadoPaises();

const PrintControl=L.Control.extend({options:{position:'topleft'},onAdd:function(){
 const c=L.DomUtil.create('div','home-control-wrap');
 c.style.display='flex'; c.style.flexDirection='column';
 const b=L.DomUtil.create('a','home-control',c);
 b.innerHTML='<i class="fas fa-print"></i>'; b.title='Imprimir vista actual (formato CONANP)'; b.href='#';
 L.DomEvent.on(b,'click',L.DomEvent.stopPropagation).on(b,'click',L.DomEvent.preventDefault).on(b,'click',()=>{ if(temaActual==='dashboard'){ imprimirDashboard(); } else { imprimirGeneralADVC(null); } });
 const r=L.DomUtil.create('a','home-control',c);
 r.innerHTML='<i class="fas fa-vector-square"></i>'; r.title='Imprimir área seleccionada (dibuja un rectángulo)'; r.href='#'; r.style.borderTop='1px solid var(--border-subtle)';
 L.DomEvent.on(r,'click',L.DomEvent.stopPropagation).on(r,'click',L.DomEvent.preventDefault).on(r,'click',()=>activarImpresionArea());
 return c;
}});
try{ map.addControl(new PrintControl()); }catch(e){}

const FUENTES_APA={
 'shp_anp':'Comisión Nacional de Áreas Naturales Protegidas (CONANP). (2024). <i>Áreas Naturales Protegidas Federales de México</i>. Gobierno de México. https://www.gob.mx/conanp',
 'shp_advc':'Comisión Nacional de Áreas Naturales Protegidas (CONANP). (2024). <i>Áreas Destinadas Voluntariamente a la Conservación</i>. https://www.gob.mx/conanp',
 'shp_00ent':'Instituto Nacional de Estadística y Geografía (INEGI). (2024). <i>Marco Geoestadístico Nacional. Límite estatal</i>. https://www.inegi.org.mx/temas/mg/',
 'shp_00mun':'Instituto Nacional de Estadística y Geografía (INEGI). (2024). <i>Marco Geoestadístico Nacional. Límite municipal</i>. https://www.inegi.org.mx/temas/mg/',
 'shp_ramsar':'Secretaría de Medio Ambiente y Recursos Naturales (SEMARNAT) / CONANP. (2024). <i>Sitios Ramsar en México</i>. https://rsis.ramsar.org/',
 'shp_ramsar_mex':'Secretaría de Medio Ambiente y Recursos Naturales (SEMARNAT) / CONANP. (2024). <i>Sitios Ramsar en México</i>. https://rsis.ramsar.org/',
 'shp_kba_mex':'Comisión Nacional para el Conocimiento y Uso de la Biodiversidad (CONABIO). (2024). <i>Áreas Clave para la Biodiversidad (KBA) en México</i>. https://www.conabio.gob.mx/',
 'shp_unescomab_mex':'Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura (UNESCO). (2024). <i>Reservas de la Biosfera MaB en México</i>. https://en.unesco.org/mab',
 'shp_unescopatrimonio_mex':'UNESCO. (2024). <i>Sitios de Patrimonio Mundial Natural en México</i>. https://whc.unesco.org/',
 'shp_reg_conanp':'Comisión Nacional de Áreas Naturales Protegidas (CONANP). (2024). <i>Regiones CONANP</i>.',
 'shp_reg_conanp_mex':'Comisión Nacional de Áreas Naturales Protegidas (CONANP). (2024). <i>Regiones CONANP</i>.',
 'shp_zp_anp_mex':'Comisión Nacional de Áreas Naturales Protegidas (CONANP). (2024). <i>Zonificación primaria (zonas núcleo) de ANP</i>.',
 'usuario':'Usuario. (2024). <i>Capa de usuario</i>. Datos proporcionados por el usuario. Geovisor CONANP.',
 'dibujo':'Usuario. (2024). <i>Dibujo en mapa</i>. Geovisor CONANP.'
};
function apaForLayer(key){
 const l=key.toLowerCase();
 for(const k of Object.keys(FUENTES_APA)){
   if(l.includes(k)) return FUENTES_APA[k];
 }
 if(l.startsWith('usuario_')) return FUENTES_APA['usuario'];
 if(l.startsWith('dibujo_')) return FUENTES_APA['dibujo'];
 return null;
}
function actualizarPrintContent(){
 const isDashboard = temaActual==='dashboard' && document.getElementById('dashboard-container').style.display!=='none';
 const printReport=document.getElementById('print-report');
 if(!printReport) return;
 if(isDashboard) return;
 const isAdvc = temaActual==='advc';
 const h1=document.querySelector('#print-report h1');
 if(h1) h1.textContent = isAdvc ? 'Geovisor CONANP — ADVC' : 'Geovisor CONANP';
 const sub=document.querySelector('#print-report p');
 if(sub) sub.textContent = isAdvc ? 'Áreas Destinadas Voluntariamente a la Conservación · CONANP' : 'Comisión Nacional de Áreas Naturales Protegidas · Gobierno de México';
 const subtitle=document.getElementById('print-subtitle');
 if(subtitle) subtitle.textContent = isAdvc ? 'Mapa ADVC' : 'Mapa General';
 const leyendaHtml=leyendaHtmlLimpio() || '<p style="font-size:7pt; color:#777;">Sin capas visibles</p>';
 const printLegend=document.getElementById('print-legend');
 if(printLegend) printLegend.innerHTML='<div style="font-weight:700; color:#6B1132; margin-bottom:4px; font-size:7pt;">Leyenda — Capas activas visibles en la impresión</div>'+leyendaHtml;
 let supTxt='—'; let countTxt='0';
 try{
  const visibles=Object.keys(activeLayers).filter(k=>{ try{ return map.hasLayer(activeLayers[k].layer); }catch(e){ return false; }});
  const filtrados=isAdvc ? visibles.filter(k=> k.toLowerCase().includes('advc') || k.startsWith('usuario_') || k.startsWith('dibujo_')) : visibles;
  let totalCount=0; let totalHa=0;
  filtrados.forEach(k=>{
   const entry=activeLayers[k];
   const feats=entry.featuresData||[];
   let inView=[];
   try{ const b=map.getBounds(); inView=feats.filter(f=>{ try{ return b.intersects(L.geoJSON(f).getBounds()); }catch(e){ return true; }}); }catch(e){ inView=feats; }
   totalCount+=inView.length;
   const sc=entry.superficieCol||detectarColumnaSuperficie(inView);
   if(sc){ inView.forEach(f=>{ const v=toHa(f.properties[sc]); if(Number.isFinite(v)) totalHa+=v; }); }
  });
  countTxt=totalCount.toLocaleString('es-MX');
  supTxt=totalHa? fmtHa(totalHa*1e4) : '—';
  const printKpis=document.getElementById('print-kpis');
  if(printKpis){
   if(filtrados.length){
    printKpis.innerHTML=`
     <div style="text-align:center; padding:6px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:6px;"><div style="font-size:6.5pt; color:#6b7280; text-transform:uppercase; font-weight:700;">Elementos visibles</div><div style="font-size:9pt; font-weight:800; color:#1a5c4e;">${countTxt}</div><div style="font-size:5.5pt; color:#6b7280;">${filtrados.length.toLocaleString('es-MX')} capa(s)</div></div>
     <div style="text-align:center; padding:6px; background:#f0fdfa; border:1px solid #a7f3d0; border-radius:6px;"><div style="font-size:6.5pt; color:#065f46; text-transform:uppercase; font-weight:700;">Superficie visible</div><div style="font-size:9pt; font-weight:800; color:#065f46;">${supTxt}</div><div style="font-size:5.5pt; color:#047857;">${isAdvc?'ADVC':'ANP y ADVC'} en vista</div></div>
     <div style="text-align:center; padding:6px; background:#fef2f2; border:1px solid #fecaca; border-radius:6px;"><div style="font-size:6.5pt; color:#7f1d1d; text-transform:uppercase; font-weight:700;">Centro mapa</div><div style="font-size:7pt; font-weight:700; color:#7f1d1d;">${map.getCenter().lat.toFixed(4)}, ${map.getCenter().lng.toFixed(4)}</div><div style="font-size:5.5pt; color:#991b1b;">Zoom ${map.getZoom().toLocaleString('es-MX')}</div></div>
     <div style="text-align:center; padding:6px; background:#fffbeb; border:1px solid #fde68a; border-radius:6px;"><div style="font-size:6.5pt; color:#92400e; text-transform:uppercase; font-weight:700;">Fecha</div><div style="font-size:7pt; font-weight:700; color:#92400e;">${new Date().toLocaleDateString('es-MX')}</div><div style="font-size:5.5pt; color:#b45309;">${new Date().toLocaleTimeString('es-MX')}</div></div>`;
   } else {
    printKpis.innerHTML='<div style="grid-column:span 4; text-align:center; font-size:6.5pt; color:#777; padding:6px; border:1px dashed #e5e7eb; border-radius:6px;">Sin capas visibles en la vista actual</div>';
   }
  }
 }catch(e){ console.warn('actualizarPrintContent kpis',e); }
 const printMeta=document.getElementById('print-meta');
 if(printMeta){
  const fmtDate=new Date().toLocaleString('es-MX',{dateStyle:'medium', timeStyle:'short'});
  const capasActivas=Object.keys(activeLayers).filter(k=>{
   const t=activeLayers[k].userName||getNombreAmigable(k);
   if(isAdvc) return k.toLowerCase().includes('advc') || k.startsWith('usuario_') || k.startsWith('dibujo_');
   return true;
  }).map(k=> activeLayers[k].userName||getNombreAmigable(k)).join(', ') || 'Ninguna';
  const center=map.getCenter();
  const tituloMapa=isAdvc?'Mapa ADVC':'Mapa General';
  printMeta.innerHTML=`<b>${tituloMapa}:</b> ${capasActivas.substring(0,140)}${capasActivas.length>140?'…':''} &nbsp;|&nbsp; <b>Superficie:</b> ${supTxt} &nbsp;|&nbsp; <b>Elementos:</b> ${countTxt} &nbsp;|&nbsp; <b>Fecha:</b> ${fmtDate} &nbsp;|&nbsp; <b>Centro:</b> ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} · Zoom ${map.getZoom().toLocaleString('es-MX')}`;
 }
 const pd=document.getElementById('print-date'); if(pd) pd.textContent=new Date().toLocaleString('es-MX');
 const pd2=document.getElementById('print-date-2'); if(pd2) pd2.textContent=new Date().toLocaleString('es-MX');
 const printFuentesList=document.getElementById('print-fuentes-list');
 if(printFuentesList){
  const visibles=Object.keys(activeLayers).filter(k=>{ try{ return map.hasLayer(activeLayers[k].layer); }catch(e){ return true; }});
  const fuentesFiltradas=isAdvc ? visibles.filter(k=> k.toLowerCase().includes('advc') || k.startsWith('usuario_') || k.startsWith('dibujo_')) : visibles;
  const citas=[...new Set(fuentesFiltradas.map(k=> apaForLayer(k)).filter(Boolean))];
  if(citas.length){
   printFuentesList.innerHTML=citas.map((c,i)=>`<div style="margin-bottom:3px; text-indent:-10px; padding-left:14px; line-height:1.3;">${i+1}. ${c}</div>`).join('');
  } else {
   printFuentesList.innerHTML='<div style="color:#777;">Sin fuentes — no hay capas visibles</div>';
  }
 }
}
map.on('browser-print-start', ()=>{ try{ map.invalidateSize(true); }catch(e){} });
map.on('browser-print-start', actualizarPrintContent);
map.on('browser-print-end', ()=>{ try{ map.invalidateSize(true); }catch(e){} });
if(typeof drawnItems!=='undefined'){
 map.on(L.Draw.Event.CREATED, ()=> setTimeout(actualizarPrintContent,300));
 map.on(L.Draw.Event.DELETED, ()=> setTimeout(actualizarPrintContent,300));
}
// --- Helpers para recorte cuadrado centrado ---
function cropCanvasToSquare(canvas){
  // Letterbox: crea canvas cuadrado y centra el contenido sin recortarlo.
  // Así el mapa completo (que puede ser rectangular) cabe en el PDF
  // sin perder los bordes laterales que el usuario ve en pantalla.
  const s=Math.max(canvas.width, canvas.height);
  if(s<=0 || (canvas.width===s && canvas.height===s)) return canvas;
  const c=document.createElement('canvas'); c.width=s; c.height=s;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#e8edf2'; ctx.fillRect(0,0,s,s);
  const dx=(s-canvas.width)/2, dy=(s-canvas.height)/2;
  ctx.drawImage(canvas, dx, dy);
  return c;
}
function cropToSquare(canvas){ return cropCanvasToSquare(canvas); }
function placeholderCanvasSquare(size, text){
  const c=document.createElement('canvas'); c.width=size; c.height=size;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#e8edf2'; ctx.fillRect(0,0,size,size);
  ctx.strokeStyle='#6B1132'; ctx.lineWidth=4; ctx.strokeRect(4,4,size-8,size-8);
  ctx.fillStyle='#6b7280'; ctx.font='bold '+Math.round(size*0.04)+'px Inter, sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text||'[Mapa no disponible]', size/2, size/2);
  return c;
}

// Capturar mapa recortado a un área geográfica específica (ej. rectángulo ANP)
async function capturarMapaRecortado(bounds) {
  if (!bounds || !bounds.isValid) return null;
  try {
    // Capturar el mapa completo
    const target = map.getContainer();
    const timeout = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

    var canvas = null;
    // html2canvas (prioridad)
    try {
      canvas = await Promise.race([
        html2canvas(target, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2, logging: false, imageTimeout: 0 }),
        timeout(5000, 'html2canvas timeout')
      ]);
    } catch (e) { console.warn('capturarMapaRecortado html2canvas fallo', e); }

    if (!canvas) {
      try {
        canvas = await Promise.race([
          domtoimage.toCanvas(target, { bgcolor: null }),
          timeout(4000, 'domtoimage timeout')
        ]);
      } catch (e) { console.warn('capturarMapaRecortado domtoimage fallo', e); }
    }

    if (!canvas) return placeholderDataURLSquare('Error captura');

    // Calcular pixel bounds del área geográfica
    var nw = bounds.getNorthWest();
    var se = bounds.getSouthEast();
    var topLeft = map.latLngToContainerPoint(nw);
    var bottomRight = map.latLngToContainerPoint(se);

    // Escala de captura (html2canvas scale:2 = factor 2)
    var scaleFactor = 2;
    var px = Math.max(0, Math.round(topLeft.x * scaleFactor));
    var py = Math.max(0, Math.round(topLeft.y * scaleFactor));
    var pw = Math.min(canvas.width - px, Math.round((bottomRight.x - topLeft.x) * scaleFactor));
    var ph = Math.min(canvas.height - py, Math.round((bottomRight.y - topLeft.y) * scaleFactor));

    if (pw < 10 || ph < 10) {
      console.warn('capturarMapaRecortado: area demasiado pequena', px, py, pw, ph);
      return canvas.toDataURL('image/png');
    }

    // Añadir margen (10%)
    var margin = Math.round(Math.min(pw, ph) * 0.10);
    px = Math.max(0, px - margin);
    py = Math.max(0, py - margin);
    pw = Math.min(canvas.width - px, pw + margin * 2);
    ph = Math.min(canvas.height - py, ph + margin * 2);

    // Recortar al área del rectángulo
    var cropped = document.createElement('canvas');
    cropped.width = pw;
    cropped.height = ph;
    var cctx = cropped.getContext('2d');
    cctx.drawImage(canvas, px, py, pw, ph, 0, 0, pw, ph);

    // Aplicar letterbox cuadrado al recorte
    return canvasToSquareDataURL(cropped);
  } catch (e) {
    console.warn('capturarMapaRecortado error', e);
    return null;
  }
}
window.capturarMapaRecortado = capturarMapaRecortado;

function placeholderDataURLSquare(text){
  return placeholderCanvasSquare(640, text).toDataURL('image/png');
}
async function dataURLToSquareDataURL(dataURL){
  if(!dataURL) return null;
  return new Promise((res)=>{
    const img=new Image();
    img.onload=()=>{
      const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
      cv.getContext('2d').drawImage(img,0,0);
      const sq=cropCanvasToSquare(cv);
      try{ res(sq.toDataURL('image/png')); }catch(e){ res(dataURL); }
    };
    img.onerror=()=> res(dataURL);
    img.src=dataURL;
  });
}
async function canvasToSquareDataURL(canvas){
  if(!canvas) return null;
  const sq=cropCanvasToSquare(canvas);
  try{ return sq.toDataURL('image/png'); }catch(e){ return canvas.toDataURL('image/png'); }
}
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista actual sin rasterizar el DOM: reutiliza los <img>
// de teselas ya cargados (traen crossOrigin), serializa los SVG de
// vectores del overlay y dibuja un pin para marcadores HTML.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: posiciona cada tesela,
// SVG y lienzo por su rectángulo real relativo al contenedor (equivalente
// a captura de pantalla) y renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
// ================================================================
// capturaLeafletNativa — captura nativa del mapa Leaflet para impresión.
// Recompone la vista EXACTA sin rasterizar el DOM: congela animaciones,
// espera al reposo y posiciona cada tesela, SVG y lienzo por su
// rectángulo real relativo al contenedor (equivalente a captura de
// pantalla). Renderiza al doble de resolución para impresión.
// Devuelve dataURL PNG o null (para usar domtoimage/html2canvas).
// ================================================================
async function capturaLeafletNativa(mapObj){
  var _mpFreeze = null, _optFreeze = null;
  function _restore(){
    try{
      if(_mpFreeze && _optFreeze){
        _mpFreeze.options.zoomAnimation = _optFreeze.za;
        _mpFreeze.options.fadeAnimation = _optFreeze.fa;
        _mpFreeze.options.markerZoomAnimation = _optFreeze.ma;
      }
    }catch(e){}
    _mpFreeze = null;
  }
  try{
    var mp = mapObj || null;
    if(!mp){ try{ mp = map; }catch(e){ mp = null; } }
    if(!mp || typeof L==='undefined') return null;
    var container = null;
    try{ container = mp.getContainer(); }catch(e){ return null; }
    if(!container) return null;
    var W = 0, H = 0;
    try{ var sz = mp.getSize(); W = Math.round(sz.x); H = Math.round(sz.y); }catch(e){}
    if(!W || !H){
      try{ var rc0 = container.getBoundingClientRect(); W = Math.round(rc0.width); H = Math.round(rc0.height); }catch(e){}
    }
    if(!W || !H || W<40 || H<40) return null;
    // Congelar animaciones y esperar al reposo exacto antes de capturar
    // (sin invalidateSize: los flujos de impresión ya estabilizan la vista antes de llamar)
    try{
      _mpFreeze = mp;
      _optFreeze = {za:mp.options.zoomAnimation, fa:mp.options.fadeAnimation, ma:mp.options.markerZoomAnimation};
      mp.options.zoomAnimation = false; mp.options.fadeAnimation = false; mp.options.markerZoomAnimation = false;
      try{ if(mp.stop) mp.stop(); }catch(e){}
    }catch(e){}
    try{ await new Promise(function(res){ try{ requestAnimationFrame(function(){ requestAnimationFrame(function(){ setTimeout(res, 400); }); }); }catch(e){ setTimeout(res, 400); } }); }catch(e){}
    var ESC = 2;
    var cv = document.createElement('canvas'); cv.width = W*ESC; cv.height = H*ESC;
    var ctx = cv.getContext('2d', {willReadFrequently:true}) || cv.getContext('2d');
    if(!ctx) return null;
    var FONDO = '#e8edf2';
    ctx.fillStyle = FONDO; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.scale(ESC,ESC);
    var rc = null;
    try{ rc = container.getBoundingClientRect(); }catch(e){ return null; }
    if(!rc) return null;
    function recorte(el){
      try{
        var r = el.getBoundingClientRect();
        return {dx:r.left-rc.left, dy:r.top-rc.top, w:r.width, h:r.height};
      }catch(e){ return null; }
    }

    var dibujado = {tiles:0, vectores:0};

    // ---- 1) Teselas: posicionamiento con las funciones oficiales de Leaflet ----
    // (getPixelBounds + layerPointToContainerPoint: la misma matemática que usa
    // Leaflet para dibujar en pantalla; sin leer posiciones del DOM)
    try{
      var capasTiles = [];
      try{
        mp.eachLayer(function(ly){
          try{ if(ly && typeof ly.getTileUrl==='function' && mp.hasLayer(ly)) capasTiles.push(ly); }catch(e){}
        });
      }catch(e){}
      var zoomAct = 5;
      try{ zoomAct = mp.getZoom(); }catch(e){}
      var limite = null;
      try{ limite = mp.getPixelBounds(); }catch(e){}
      var cargaTiles = [];
      if(limite){
        for(var ci=0; ci<capasTiles.length; ci++){
          (function(ly){
            try{
              var tz = (ly._tileZoom!=null) ? ly._tileZoom : zoomAct;
              var ts = 256;
              try{ var gts = ly.getTileSize(); if(gts && gts.x) ts = gts.x; }catch(e){}
              var s = Math.pow(2, tz-zoomAct);
              if(!isFinite(s) || s<=0) return;
              var minTx = limite.min.x*s, minTy = limite.min.y*s;
              var maxTx = limite.max.x*s, maxTy = limite.max.y*s;
              var x0 = Math.floor(minTx/ts)-1;
              var y0 = Math.floor(minTy/ts)-1;
              var x1 = Math.floor(maxTx/ts)+1;
              var y1 = Math.floor(maxTy/ts)+1;
              if((x1-x0)*(y1-y0) > 400) return;
              for(var tx=x0; tx<=x1; tx++){
                for(var ty=y0; ty<=y1; ty++){
                  (function(XX,YY){
                    var url = '';
                    try{ url = ly.getTileUrl({x:XX, y:YY, z:tz}); }catch(e){}
                    if(!url) return;
                    var pos = null;
                    try{ pos = mp.layerPointToContainerPoint([(XX*ts)/s, (YY*ts)/s]); }catch(e){}
                    if(!pos) return;
                    cargaTiles.push({url:url, dx:pos.x, dy:pos.y, dw:ts/s, dh:ts/s});
                  })(tx,ty);
                }
              }
            }catch(e){}
          })(capasTiles[ci]);
        }
      }
      var tileJobs = cargaTiles.map(function(job){
        return new Promise(function(res){
          var im = new Image();
          im.crossOrigin = 'anonymous';
          var fin=false;
          var done=function(ok){ if(!fin){ fin=true; res(ok); } };
          im.onload = function(){
            try{
              var sx=0, sy=0, sw=im.naturalWidth||256, sh=im.naturalHeight||256;
              var dx=job.dx, dy=job.dy, dw=job.dw, dh=job.dh;
              if(dw>0 && sw>0 && dx<0){ sx+=(-dx)*(sw/dw); sw+=dx*(sw/dw); dw+=dx; dx=0; }
              if(dh>0 && sh>0 && dy<0){ sy+=(-dy)*(sh/dh); sh+=dy*(sh/dh); dh+=dy; dy=0; }
              if(dx<W && dy<H){
                if(dw>0 && sw>0 && dx+dw>W){ sw-=(dx+dw-W)*(sw/dw); dw=W-dx; }
                if(dh>0 && sh>0 && dy+dh>H){ sh-=(dy+dh-H)*(sh/dh); dh=H-dy; }
                if(dw>1 && dh>1 && sw>1 && sh>1){ ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); dibujado.tiles++; }
              }
            }catch(e){}
            done(true);
          };
          im.onerror = function(){ done(false); };
          setTimeout(function(){ done(false); }, 5000);
          im.src = job.url;
        });
      });
      if(tileJobs.length) await Promise.all(tileJobs);
    }catch(e){ console.warn('captura nativa: tiles', e); }
    // Si el fondo contaminó el lienzo (taint por CORS), reintentar solo con vectores
    var fondoTainted = false;
    try{ ctx.getImageData(0,0,1,1); }
    catch(e){
      fondoTainted = true;
      try{
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,cv.width,cv.height);
        ctx.fillStyle = FONDO; ctx.fillRect(0,0,cv.width,cv.height);
        ctx.scale(ESC,ESC);
      }catch(e2){}
      try{ console.info('[cap] fondo con taint: se continúa solo con vectores'); }catch(e3){}
    }

    // ---- 2) Vectores SVG del overlay (posición exacta por rectángulo) ----
    try{
      var jobs = [];
      var svgs = container.querySelectorAll('.leaflet-overlay-pane svg');
      for(var si=0; si<svgs.length; si++){
        (function(svgEl){
          jobs.push(new Promise(function(res){
            var url = null;
            try{
              var q = recorte(svgEl);
              if(!q || q.w<2 || q.h<2){ res(false); return; }
              var clon = svgEl.cloneNode(true);
              clon.setAttribute('xmlns','http://www.w3.org/2000/svg');
              clon.setAttribute('width', Math.round(q.w));
              clon.setAttribute('height', Math.round(q.h));
              var str = new XMLSerializer().serializeToString(clon);
              url = URL.createObjectURL(new Blob([str], {type:'image/svg+xml;charset=utf-8'}));
              var im = new Image();
              var fin = false;
              var done = function(ok){ if(!fin){ fin=true; try{ if(url) URL.revokeObjectURL(url); }catch(e){} res(ok); } };
              im.onload = function(){ try{ ctx.drawImage(im, q.dx, q.dy, q.w, q.h); dibujado.vectores++; }catch(e){} done(true); };
              im.onerror = function(){ done(false); };
              setTimeout(function(){ done(false); }, 3500);
              im.src = url;
            }catch(e){ try{ if(url) URL.revokeObjectURL(url); }catch(e2){} res(false); }
          }));
        })(svgs[si]);
      }
      try{
        var ovcs = container.querySelectorAll('.leaflet-overlay-pane canvas');
        for(var ci=0; ci<ovcs.length; ci++){
          try{
            var c2 = ovcs[ci];
            var qc = recorte(c2);
            if(!c2.width || !c2.height || !qc || qc.w<2 || qc.h<2) continue;
            ctx.drawImage(c2, qc.dx, qc.dy, qc.w, qc.h);
            dibujado.vectores++;
          }catch(e){}
        }
      }catch(e){}
      if(jobs.length) await Promise.all(jobs);
    }catch(e){ console.warn('captura nativa: vectores', e); }

    // ---- 3) Marcadores con icono HTML (pin aproximado) ----
    try{
      if(mp.eachLayer && mp.latLngToContainerPoint){
        mp.eachLayer(function(ly){
          try{
            if(!(ly instanceof L.Marker)) return;
            if(ly instanceof L.CircleMarker) return;
            var p = mp.latLngToContainerPoint(ly.getLatLng());
            if(!p || p.x<-30 || p.y<-30 || p.x>W+30 || p.y>H+30) return;
            ctx.fillStyle = '#6B1132';
            ctx.beginPath(); ctx.arc(p.x, p.y-9, 6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(p.x-4.5, p.y-4); ctx.lineTo(p.x, p.y+5); ctx.lineTo(p.x+4.5, p.y-4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(p.x, p.y-9, 2.2, 0, Math.PI*2); ctx.fill();
            dibujado.vectores++;
          }catch(e){}
        });
      }
    }catch(e){}

    // ---- 4) Validar contenido real por diversidad de color (no por distancia al fondo) ----
    // (los fondos grises institucionales se parecen al fondo base; se detecta textura/detalle)
    try{
      var d = ctx.getImageData(0,0,cv.width,cv.height).data;
      var vistos = {}, nColores = 0;
      var paso = 12;
      for(var yy=0; yy<cv.height && nColores<=24; yy+=paso){
        for(var xx=0; xx<cv.width && nColores<=24; xx+=paso){
          var o = (yy*cv.width+xx)*4;
          if(d[o+3] < 128) continue;
          var cubo = ((d[o]>>4)<<8) | ((d[o+1]>>4)<<4) | (d[o+2]>>4);
          if(!vistos[cubo]){ vistos[cubo] = 1; nColores++; }
        }
      }
      if(nColores < 8 && !dibujado.vectores) return null;
      try{ console.info('[cap] mapa='+_dbgId+' centro='+_dbgC+' zoom='+_dbgZ+' tiles='+dibujado.tiles+' vectores='+dibujado.vectores+' taintFondo='+fondoTainted+' colores='+nColores+' px='+cv.width+'x'+cv.height); }catch(e){}
    }catch(e){ return null; }

    try{ return cv.toDataURL('image/png'); }
    catch(e){ console.warn('captura nativa toDataURL', e); return null; }
  }catch(e){ console.warn('capturaLeafletNativa', e); return null; }
  finally{ _restore(); }
}
async function getDashboardMapImage(){
 try{
  const el=map.getContainer();
  try{
    const rect=el.getBoundingClientRect();
    if(!rect.width || !rect.height || el.offsetParent===null){
      console.warn('getDashboardMapImage: mapa oculto, usando placeholder cuadrado');
      return placeholderDataURLSquare('Mapa dashboard — sin vista');
    }
  }catch(e){}
  const timeout=(ms,msg)=> new Promise((_,rej)=> setTimeout(()=>rej(new Error(msg)), ms));
    /* html2canvas primero: captura EXACTAMENTE lo que se ve en pantalla. */
  try{
    const c=await Promise.race([ html2canvas(target,{useCORS:true, allowTaint:true, backgroundColor:null, scale:2, logging:false, imageTimeout:0, removeContainer:true}), timeout(5000,'html2canvas timeout') ]);
    if(c && c.width>50 && c.height>50){
      return await canvasToSquareDataURL(c);
    }
  }catch(e){ console.warn('capturarMapa html2canvas fallo, pruebo domtoimage',e); }
  try{
    const u=await Promise.race([ domtoimage.toPng(target,{bgcolor:null, cacheBust:true}), timeout(4000,'domtoimage toPng timeout') ]);
    if(u&&u.length>1000) return await dataURLToSquareDataURL(u);
  }catch(e){ console.warn('capturarMapa domtoimage toPng fallo',e); }
  try{
    const cv=await Promise.race([ domtoimage.toCanvas(target,{bgcolor:null}), timeout(4000,'domtoimage toCanvas timeout') ]);
    const sqUrl=await canvasToSquareDataURL(cv); if(sqUrl&&sqUrl.length>1000) return sqUrl;
  }catch(e){ console.warn('capturarMapa domtoimage toCanvas fallo',e); }
  /* Fallback: captura nativa Leaflet (recomposición matemática). */
  try{
    var natCap = await capturaLeafletNativa((typeof map==='undefined')?null:map);
    if(natCap && natCap.length>2000){
      if(typeof dataURLToSquareDataURL==='function'){
        try{ var natSq = await dataURLToSquareDataURL(natCap); if(natSq && natSq.length>2002) return natSq; }catch(e){}
      }
      return natCap;
    }
  }catch(e){ console.warn('capturaLeafletNativa tambien fallo', e); }
  if(typeof domtoimage!=='undefined'){
   try{
     const u=await Promise.race([ domtoimage.toPng(el,{bgcolor:'#e8edf2', cacheBust:true}), timeout(3000,'domtoimage timeout') ]);
     if(u&&u.length>1000) return await dataURLToSquareDataURL(u);
   }catch(e){ console.warn('domtoimage toPng fallo',e); }
   try{
     const canvas=await Promise.race([ domtoimage.toCanvas(el,{bgcolor:'#e8edf2'}), timeout(3000,'domtoimage canvas timeout') ]);
     const sqUrl=await canvasToSquareDataURL(canvas); if(sqUrl&&sqUrl.length>1000) return sqUrl;
   }catch(e){ console.warn('domtoimage toCanvas fallo',e); }
  }
  try{
    const c=await Promise.race([ html2canvas(el,{useCORS:true, allowTaint:true, backgroundColor:'#e8edf2', scale:1, logging:false}), timeout(3000,'html2canvas timeout') ]);
    return await canvasToSquareDataURL(c);
  }catch(e){ console.warn('html2canvas fallo',e); }
  return placeholderDataURLSquare('Mapa no disponible');
 }catch(e){ console.warn('getDashboardMapImage error',e); return placeholderDataURLSquare('Error mapa'); }
}
async function capturarMapa(el){
 try{
 const target=el||map.getContainer();
 const timeout=(ms,msg)=> new Promise((_,rej)=> setTimeout(()=>rej(new Error(msg)), ms));
 try{
   const r=target.getBoundingClientRect();
   if(!r.width || !r.height) return placeholderDataURLSquare('Mapa no disponible');
 }catch(e){}
   /* html2canvas primero: captura EXACTAMENTE lo que se ve en pantalla.
     La recomposición matemática de capturaLeafletNativa puede divergir
     de lo que el navegador realmente renderiza. html2canvas rasteriza
     el DOM tal cual, garantizando que el PDF muestre lo mismo que el usuario ve. */
  try{
    const c=await Promise.race([ html2canvas(target,{useCORS:true, allowTaint:true, backgroundColor:'#e8edf2', scale:2, logging:false, imageTimeout:0}), timeout(5000,'html2canvas timeout') ]);
    if(c && c.width>50 && c.height>50){
      return await canvasToSquareDataURL(c);
    }
  }catch(e){ console.warn('capturarMapa html2canvas fallo, pruebo domtoimage',e); }
  try{
    const u=await Promise.race([ domtoimage.toPng(target,{bgcolor:'#e8edf2', cacheBust:true}), timeout(4000,'domtoimage toPng timeout') ]);
    if(u&&u.length>1000) return await dataURLToSquareDataURL(u);
  }catch(e){ console.warn('capturarMapa domtoimage toPng fallo',e); }
  try{
    const cv=await Promise.race([ domtoimage.toCanvas(target,{bgcolor:'#e8edf2'}), timeout(4000,'domtoimage toCanvas timeout') ]);
    const sqUrl=await canvasToSquareDataURL(cv); if(sqUrl&&sqUrl.length>1000) return sqUrl;
  }catch(e){ console.warn('capturarMapa domtoimage toCanvas fallo',e); }
  /* Fallback: captura nativa Leaflet (recomposición matemática). */
  try{
    var natCap = await capturaLeafletNativa((typeof map==='undefined')?null:map);
    if(natCap && natCap.length>2000){
      if(typeof dataURLToSquareDataURL==='function'){
        try{ var natSq = await dataURLToSquareDataURL(natCap); if(natSq && natSq.length>2000) return natSq; }catch(e){}
      }
      return natCap;
    }
  }catch(e){ console.warn('capturaLeafletNativa tambien fallo', e); }
  if(typeof domtoimage!=='undefined'){
  try{
    const u=await Promise.race([ domtoimage.toPng(target,{bgcolor:'#e8edf2', cacheBust:true}), timeout(3000,'domtoimage toPng timeout') ]);
    if(u&&u.length>1000) return await dataURLToSquareDataURL(u);
  }catch(e){ console.warn('capturarMapa domtoimage toPng fallo',e); }
  try{
    const cv=await Promise.race([ domtoimage.toCanvas(target,{bgcolor:'#e8edf2'}), timeout(3000,'domtoimage toCanvas timeout') ]);
    const sqUrl=await canvasToSquareDataURL(cv); if(sqUrl&&sqUrl.length>1000) return sqUrl;
  }catch(e){ console.warn('capturarMapa domtoimage toCanvas fallo',e); }
 }
 try{
   const c=await Promise.race([ html2canvas(target,{useCORS:true, allowTaint:true, backgroundColor:'#e8edf2', scale:1, logging:false}), timeout(3000,'html2canvas timeout') ]);
   return await canvasToSquareDataURL(c);
 }catch(e){ console.warn('capturarMapa html2canvas fallo',e); }
 return placeholderDataURLSquare('Mapa no disponible');
 }catch(e){ console.warn('capturarMapa error',e); return placeholderDataURLSquare('Error captura'); }
}
// Diagnóstico de captura: descarga la imagen cruda (sin recorte) + métricas en consola.
// Uso en consola del navegador: await debugCapturaMapa()
window.debugCapturaMapa = async function(){
  try{
    var mp = (typeof map!=='undefined') ? map : null;
    if(!mp){ console.warn('[debugCaptura] no hay mapa'); return; }
    var u = await capturaLeafletNativa(mp);
    if(!u){ console.warn('[debugCaptura] captura null (revisar tiles/SVG)'); return; }
    var a = document.createElement('a'); a.href = u; a.download = 'debug_mapa_'+Date.now()+'.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    var im = new Image();
    im.onload = function(){
      var c = null; try{ c = mp.getContainer(); }catch(e){}
      console.log('[debugCaptura] captura='+im.width+'x'+im.height+
        ' contenedor='+(c?c.clientWidth+'x'+c.clientHeight:'?')+
        ' centro='+mp.getCenter()+' zoom='+mp.getZoom());
    };
    im.src = u;
  }catch(e){ console.error('[debugCaptura]', e); }
};
function generarPDFBase(titulo){
 const {jsPDF}=window.jspdf; const doc=new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
 const fmtDate=new Date().toLocaleDateString('es-MX',{day:'2-digit', month:'long', year:'numeric'});
 doc.setFillColor(107,17,50); doc.rect(0,0,210,22,'F');
 doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text(titulo||'Geovisor CONANP',10,10);
 doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.text('Comisión Nacional de Áreas Naturales Protegidas · Gobierno de México · '+fmtDate,10,15);
 return {doc, fmtDate};
}

// ================================================================
// CLIPBOARD
// ================================================================
document.querySelectorAll('.btn-copy').forEach(btn=>{
 btn.addEventListener('click',function(e){e.stopPropagation();const el=document.getElementById(this.dataset.copy);if(!el)return;const txt=el.textContent.trim();if(!txt||txt==='—'){alert('Sin datos.');return;}navigator.clipboard.writeText(txt).then(()=>{const o=this.innerHTML;this.innerHTML='<i class="fas fa-check"></i>';this.classList.add('copied');setTimeout(()=>{this.innerHTML=o;this.classList.remove('copied');},1500);}).catch(()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);const o=this.innerHTML;this.innerHTML='<i class="fas fa-check"></i>';setTimeout(()=>{this.innerHTML=o;},1500);});});
});

// ================================================================
// MODAL
// ================================================================
const modalOverlay=document.getElementById('modal-grafico');
const modalClose=document.getElementById('modal-close');
const modalCanvas=document.getElementById('modal-canvas');
const modalTitle=document.getElementById('modal-title');
let modalChartInstance=null,modalChartData=null;

let lastActiveBeforeModal=null, lastActiveBeforeAnalisis=null;
let _modalCurrentTarget=null;
function openModal(inst,titulo, targetId){
 if(!inst){alert('Sin datos.');return;}
 lastActiveBeforeModal=document.activeElement;
 _modalCurrentTarget=targetId||null;
 modalTitle.textContent=titulo||'Gráfico';
 const mb=document.getElementById('modal-body');
 mb.innerHTML='<canvas id="modal-canvas"></canvas>';
 const localCanvas=mb.querySelector('canvas');
 modalChartData={labels:inst.data.labels,datasets:inst.data.datasets};
 if(modalChartInstance){modalChartInstance.destroy();modalChartInstance=null;}
 modalChartInstance=new Chart(localCanvas.getContext('2d'),{type:inst.config.type,data:JSON.parse(JSON.stringify(inst.data)),options:JSON.parse(JSON.stringify(inst.options))});
 if(inst.options?.plugins?.tooltip){modalChartInstance.options.plugins.tooltip=inst.options.plugins.tooltip;modalChartInstance.update();}
 if(targetId==='dashChartBarCat' || targetId==='dashChartBarEstados'){
   const isCat=targetId==='dashChartBarCat';
   const currentMode=isCat? barCatMode : barEstadosMode;
   const wrap=document.createElement('div');
   wrap.style.cssText='margin-top:0.7rem;display:flex;align-items:center;gap:0.5rem;justify-content:center;';
   wrap.innerHTML=`<span style="font-size:0.62rem;color:var(--text-muted)">Superficie</span><button id="modal-toggle-${targetId}" class="btn-toggle ${currentMode==='count'?'active':''}" style="padding:0.18rem 0.5rem;font-size:0.62rem"><span class="toggle-slider"></span> ${currentMode==='count'?'Conteo':'Superficie'}</button><span style="font-size:0.62rem;color:var(--text-muted)">Conteo</span>`;
   mb.appendChild(wrap);
   const btn=wrap.querySelector('button');
   btn.addEventListener('click',()=>{
     if(isCat){
       barCatMode=barCatMode==='count'?'area':'count';
       document.getElementById('toggle-bar-cat')?.classList.toggle('active', barCatMode==='count');
       document.getElementById('chart-bar-cat-title').textContent=barCatMode==='count'?'Conteo por categoría':'Superficie por categoría';
       if(typeof actualizarBarCat==='function') actualizarBarCat();
       if(modalChartInstance && barCatData){
         const isC=barCatMode==='count';
         modalChartInstance.data.datasets[0].data=isC?barCatData.counts:barCatData.areas;
         modalChartInstance.data.datasets[0].label=isC?'Conteo':'Superficie (ha)';
         modalChartInstance.update();
       }
       btn.classList.toggle('active', barCatMode==='count');
       btn.innerHTML=`<span class="toggle-slider"></span> ${barCatMode==='count'?'Conteo':'Superficie'}`;
     } else {
       barEstadosMode=barEstadosMode==='count'?'area':'count';
       document.getElementById('toggle-hbar-estados')?.classList.toggle('active', barEstadosMode==='count');
       document.getElementById('chart-hbar-estados-title').textContent=barEstadosMode==='count'?'Top estados por número ADVC':'Top estados por superficie ADVC (ha)';
       if(typeof actualizarBarEstados==='function') actualizarBarEstados();
       if(modalChartInstance && barEstadosData){
         const isC=barEstadosMode==='count';
         modalChartInstance.data.datasets[0].data=isC?barEstadosData.counts:barEstadosData.areas;
         modalChartInstance.data.datasets[0].label=isC?'Número':'Superficie (ha)';
         modalChartInstance.update();
       }
       btn.classList.toggle('active', barEstadosMode==='count');
       btn.innerHTML=`<span class="toggle-slider"></span> ${barEstadosMode==='count'?'Conteo':'Superficie'}`;
     }
   });
 }
 modalOverlay.classList.add('active');
 modalOverlay.setAttribute('aria-modal','true'); modalOverlay.setAttribute('role','dialog');
 document.body.style.overflow='hidden';
 try{ modalClose.focus(); }catch(e){}
 setTimeout(()=>modalChartInstance.resize(),100);
 modalOverlay._trapHandler=function(e){
  if(e.key==='Tab'){
   const focusable=[...modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled && el.offsetParent!==null);
   if(!focusable.length) return;
   const first=focusable[0], last=focusable[focusable.length-1];
   if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
   else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
 };
 modalOverlay.addEventListener('keydown', modalOverlay._trapHandler);
}
function closeModal(){
 modalOverlay.classList.remove('active'); modalOverlay.removeAttribute('aria-modal');
 document.body.style.overflow='';if(modalChartInstance){modalChartInstance.destroy();modalChartInstance=null;}modalChartData=null;const mb=document.getElementById('modal-body');mb.innerHTML='<canvas id="modal-canvas"></canvas>';
 if(modalOverlay._trapHandler){ modalOverlay.removeEventListener('keydown', modalOverlay._trapHandler); modalOverlay._trapHandler=null; }
 try{ if(lastActiveBeforeModal && lastActiveBeforeModal.focus) lastActiveBeforeModal.focus(); }catch(e){}
 lastActiveBeforeModal=null;
}
modalClose.addEventListener('click',closeModal);
modalOverlay.addEventListener('click',e=>{if(e.target===modalOverlay)closeModal();});

document.querySelectorAll('.btn-expandir').forEach(btn=>{
 btn.addEventListener('click',function(e){e.stopPropagation();const target=this.dataset.target;const cm={chartAnpCount:()=>chartAnpCount,chartAnpArea:()=>chartAnpArea,chartAdvc:()=>chartAdvc,dashChartTerrestre:()=>dashChartTerrestre,dashChartBarCat:()=>dashChartBarCat,dashChartBarEstados:()=>dashChartBarEstados,dashChartAdvcProp:()=>dashChartAdvcProp,dashChartPeriodo:()=>dashChartPeriodo,dashChartPeriodoAdvc:()=>dashChartPeriodoAdvc};if(target==='tabla'){const clone=document.getElementById('tabla-contenedor').cloneNode(true);const mb=document.getElementById('modal-body');mb.innerHTML='';mb.appendChild(clone);modalTitle.textContent='Tabla de datos'; lastActiveBeforeModal=document.activeElement; modalOverlay.classList.add('active'); modalOverlay.setAttribute('aria-modal','true'); modalOverlay.setAttribute('role','dialog'); document.body.style.overflow='hidden'; try{ modalClose.focus(); }catch(e){} modalOverlay._trapHandler=function(ev){ if(ev.key==='Tab'){ const focusable=[...modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled && el.offsetParent!==null); if(!focusable.length) return; const first=focusable[0], last=focusable[focusable.length-1]; if(ev.shiftKey && document.activeElement===first){ ev.preventDefault(); last.focus(); } else if(!ev.shiftKey && document.activeElement===last){ ev.preventDefault(); first.focus(); } } }; modalOverlay.addEventListener('keydown', modalOverlay._trapHandler); return;}const m=cm[target];if(m){const inst=m();if(inst){const titles={chartAnpCount:'Número de ANP por Categoría de Manejo',chartAnpArea:'SUPERFICIE DE ANP POR CATEGORIA DE MANEJO',chartAdvc:'ADVC Propiedad',dashChartTerrestre:'Superficie protegida',dashChartBarCat:document.getElementById('chart-bar-cat-title').textContent,dashChartBarEstados:document.getElementById('chart-hbar-estados-title').textContent,dashChartAdvcProp:'Tipo propiedad ADVC',dashChartPeriodo:'ANP por periodo presidencial',dashChartPeriodoAdvc:'ADVC certificadas por periodo'};openModal(inst,titles[target]||'Gráfico',target);}else alert('Sin datos.');} else if(!m){ alert('Sin datos para '+target); }});
});

document.getElementById('modal-download-png').addEventListener('click',()=>{if(!modalChartInstance)return; descargarGraficoUnificado(modalChartInstance,'png',modalTitle.textContent);});
document.getElementById('modal-download-jpg').addEventListener('click',()=>{if(!modalChartInstance)return; descargarGraficoUnificado(modalChartInstance,'jpg',modalTitle.textContent);});
document.getElementById('modal-download-csv').addEventListener('click',()=>{if(!modalChartInstance)return; const fakeInst={data:{labels:modalChartInstance.data.labels,datasets:modalChartInstance.data.datasets}, canvas:modalChartInstance.canvas}; descargarGraficoUnificado(fakeInst,'csv',modalTitle.textContent);});

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

// ================================================================
// PANEL MOBILE
// ================================================================
const panel=document.getElementById('panel');
const panelClose=document.getElementById('panel-close');
const panelOverlay=document.getElementById('panel-overlay');
function openPanel(e){e&&e.preventDefault();panel.classList.add('panel-open');panelOverlay.classList.add('active');document.body.style.overflow='hidden';setTimeout(()=>map.invalidateSize(),350);}
function closePanel(e){e&&e.preventDefault();panel.classList.remove('panel-open');panelOverlay.classList.remove('active');document.body.style.overflow='';setTimeout(()=>map.invalidateSize(),350);}
panelClose.addEventListener('click',closePanel);
// ── cerrar / restaurar gráficas de la barra lateral ──
document.querySelectorAll('.btn-cerrar-grafico').forEach(btn=>{
 btn.addEventListener('click',()=>{
  const target=document.getElementById(btn.dataset.close);
  if(target){ target.classList.add('grafico-cerrado'); target.style.display='none'; }
  const anyClosed=document.querySelector('.grafico-container.grafico-cerrado');
  document.getElementById('btn-restaurar-graficos')?.classList.toggle('show', !!anyClosed);
  try{ localStorage.setItem('grafico-cerrados', JSON.stringify([...document.querySelectorAll('.grafico-container.grafico-cerrado')].map(el=>el.id))); }catch(e){}
 });
});
document.getElementById('btn-restaurar-graficos')?.addEventListener('click',()=>{
 document.querySelectorAll('.grafico-container.grafico-cerrado').forEach(el=>{ el.classList.remove('grafico-cerrado'); el.style.display=''; });
 document.getElementById('btn-restaurar-graficos').classList.remove('show');
 try{ localStorage.removeItem('grafico-cerrados'); }catch(e){}
 setTimeout(()=>{ try{ chartAnpCount?.resize(); chartAnpArea?.resize(); chartAdvc?.resize(); }catch(e){} }, 100);
});
try{
 const cerrados=JSON.parse(localStorage.getItem('grafico-cerrados')||'[]');
 cerrados.forEach(id=>{
  const el=document.getElementById(id);
  if(el){ el.classList.add('grafico-cerrado'); el.style.display='none'; }
 });
 if(cerrados.length) document.getElementById('btn-restaurar-graficos')?.classList.add('show');
}catch(e){}
// mapa responsivo al cambiar de resolución: re-ajustar Leaflet, gráficas y KPIs al cruzar breakpoints
['(max-width:1440px)','(max-width:1024px)','(max-width:768px)','(max-width:480px)'].forEach(q=>{
 try{
  const mq=window.matchMedia(q);
  mq.addEventListener('change',()=>{
   setTimeout(()=>{
    try{ map.invalidateSize(true); }catch(e){}
    try{
     if(document.getElementById('dashboard-container').style.display!=='none'){
      scheduleAutoFitKpi();
      [dashChartTerrestre,dashChartBarCat,dashChartBarEstados,dashChartAdvcProp,dashChartPeriodo,dashChartPeriodoAdvc].forEach(ch=>{ try{ ch&&ch.resize(); }catch(e){} });
     }
    }catch(e){}
   },300);
  });
 }catch(e){}
});
panelOverlay.addEventListener('click',closePanel);

// ================================================================
// TABS
// ================================================================
const tabs=document.querySelectorAll('.tab');
const dashboardContainer=document.getElementById('dashboard-container');
const dashboardCloseBtn=document.getElementById('dashboard-close-btn');
const mapOriginalContainer=document.getElementById('map-container');
const mapDashboardContainer=document.getElementById('map-dashboard');

function switchTab(tabId){
 const gCount=document.getElementById('grafico-anp-conteo');
 const gArea=document.getElementById('grafico-anp-superficie');
 const gAdvc=document.getElementById('grafico-advc');
 gCount.style.display='none';gArea.style.display='none';gAdvc.style.display='none';dashboardContainer.style.display='none';try{var _ip=document.getElementById('seccion-incendios');if(_ip)_ip.classList.remove('visible');var _hp=document.getElementById('seccion-huracanes');if(_hp)_hp.classList.remove('visible');if(tabId!=='incendios'&&typeof limpiarIncendios==='function')limpiarIncendios();if(tabId!=='huracanes'&&typeof limpiarHuracanes==='function')limpiarHuracanes();}catch(e){}
 const mapEl=document.getElementById('map');
 if(mapEl.parentElement===mapDashboardContainer){mapOriginalContainer.appendChild(mapEl);setTimeout(()=>map.invalidateSize(),100);}
  if(tabId==='general'){if(!gCount.classList.contains('grafico-cerrado'))gCount.style.display='block';if(!gArea.classList.contains('grafico-cerrado'))gArea.style.display='block';gAdvc.classList.add('grafico-oculto');actualizarGraficosAnp();actualizarContador();}
  else if(tabId==='advc'){if(!gAdvc.classList.contains('grafico-cerrado')){gAdvc.classList.remove('grafico-oculto');gAdvc.style.display='block';}actualizarGraficoAdvc();actualizarContador();}
 else if(tabId==='dashboard'){dashboardContainer.style.display='block';if(!mapDashboardContainer.contains(mapEl)){mapDashboardContainer.appendChild(mapEl);setTimeout(()=>{map.invalidateSize();map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);},150);}else{map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);}actualizarDashboard();}
 else if(tabId==='incendios'){
    var incPanel=document.getElementById('seccion-incendios');
    if(incPanel) incPanel.classList.add('visible');
    var hurPanel=document.getElementById('seccion-huracanes');
    if(hurPanel) hurPanel.classList.remove('visible');
    var cl1=document.getElementById('capa-list');
    if(cl1){ cl1.style.display='none'; cl1.style.flex='0 0 auto'; }
    if(typeof initIncendios==='function') initIncendios();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }
  else if(tabId==='huracanes'){
    var hurPanel2=document.getElementById('seccion-huracanes');
    if(hurPanel2) hurPanel2.classList.add('visible');
    var incPanel2=document.getElementById('seccion-incendios');
    if(incPanel2) incPanel2.classList.remove('visible');
    var cl2=document.getElementById('capa-list');
    if(cl2){ cl2.style.display='none'; cl2.style.flex='0 0 auto'; }
    if(typeof initHuracanes==='function') initHuracanes();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }
  var _cl=document.getElementById('capa-list');
  if(_cl && tabId!=='incendios' && tabId!=='huracanes'){ _cl.style.display=''; _cl.style.flex=''; }
  if(tabId!=='dashboard')map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);
 temaActual=tabId;aplicarFiltro(tabId==='advc'?'advc':'general');
 document.body.classList.toggle('dashboard-active', tabId==='dashboard');
 if(tabId!=='dashboard'){dashboardFilters={cat:null,estado:null,propiedad:null};applyDashboardFilterToMap();updateFilterBar();resaltarTemaEnMapa(tabId==='advc'?'advc':'general');}
 // -- NUEVO: iniciar hint de scroll cuando se abre dashboard --
 if(tabId==='dashboard'){
   setTimeout(initDashboardScrollHint, 300);
 }
}

tabs.forEach(tab=>{tab.addEventListener('click',function(){tabs.forEach(t=>t.classList.remove('active'));this.classList.add('active');switchTab(this.dataset.tab);if(window.innerWidth<=1440)closePanel();});});
dashboardCloseBtn.addEventListener('click',()=>{const mapEl=document.getElementById('map');if(mapEl.parentElement===mapDashboardContainer){mapOriginalContainer.appendChild(mapEl);setTimeout(()=>{map.invalidateSize();map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);},150);}dashboardContainer.style.display='none';document.querySelector('.tab[data-tab="general"]').click();});

// Dashboard filter bar
const filterBar=document.getElementById('dashboard-filter-bar');
const filterStatusText=document.getElementById('filter-status-text');
const clearFiltersBtn=document.getElementById('clear-filters-btn');
clearFiltersBtn.addEventListener('click',()=>{clearDashboardFilters();updateFilterBar();});
function updateFilterBar(){
 const parts=[];
 if(dashboardFilters.cat)parts.push('Categoría: <b>'+dashboardFilters.cat+'</b>');
 if(dashboardFilters.estado)parts.push('Estado: <b>'+dashboardFilters.estado+'</b>');
 if(dashboardFilters.propiedad)parts.push('Propiedad: <b>'+dashboardFilters.propiedad+'</b>');
 if(parts.length){filterBar.style.display='flex';filterStatusText.innerHTML='Filtros activos: '+parts.join(' · ');}
 else{filterBar.style.display='none';filterStatusText.innerHTML='';}
  try{
   const leyenda=document.getElementById('dashboard-leyenda');
   if(leyenda){
     const leyendaSrc=document.getElementById('leyenda');
     var leyendaLimpia=leyendaHtmlLimpio();
     if(leyendaLimpia && leyendaSrc && leyendaSrc.style.display!=='none'){
       leyenda.innerHTML=leyendaLimpia;
     } else {
       const visibles=Object.keys(activeLayers).filter(k=>{ try{ return map.hasLayer(activeLayers[k].layer); }catch(e){ return false; }});
       if(visibles.length){
          leyenda.innerHTML='<div class="leyenda-cols">'+visibles.slice(0,12).map(k=>{
            const e=activeLayers[k]; const col=e.userColor||e.color||'#6B1132';
            const nombre=e.userName||getNombreAmigable(k);
            return `<div class="leyenda-item" style="display:flex; align-items:center; gap:0.4rem; padding:0.2rem 0;"><span style="width:12px; height:8px; background:${col}; border-radius:2px; display:inline-block; flex-shrink:0;"></span> <span class="leyenda-label" style="font-size:0.6rem;">${nombre}</span></div>`;
          }).join('')+'</div>';
       } else {
         leyenda.innerHTML='<span style="font-size:0.58rem; color:var(--text-muted);">Sin capas visibles — activa ANP/ADVC</span>';
       }
     }
   }
   try{ const dl=document.getElementById('dashboard-leyenda'); if(dl) dl.classList.toggle('dos-col',dl.querySelectorAll('.leyenda-item').length>8); }catch(e){}
   try{ poblarFiltrosCascada(); }catch(e){}
 }catch(e){ console.warn('updateFilterBar extendido',e); }
}
/* btn-limpiar-filtros-card eliminado con la tarjeta — ver btn-limpiar-filtros-casc */

// ================================================================
// Filtros en cascada del dashboard + zoom a filtrados
// ================================================================
function featuresCoincidentesDash(layerKey){
 if(!layerKey||!activeLayers[layerKey]) return [];
 const entry=activeLayers[layerKey];
 let f=entry.featuresData||[];
 if(dashboardFilters.cat&&esCapaAnpPrincipal(layerKey)){
  const catCol=entry.categoriaCol;
  if(catCol) f=f.filter(ft=>String(ft.properties[catCol]||'').trim()===dashboardFilters.cat);
 }
 if(dashboardFilters.estado){
  f=f.filter(ft=>{
   const p=ft.properties||{};
   const vals=[p.estados,p.estado].map(v=>String(v||'').trim()).filter(Boolean);
   return vals.some(v=>v.toLowerCase().includes(dashboardFilters.estado.toLowerCase()));
  });
 }
  if(dashboardFilters.propiedad&&esCapaAdvc(layerKey)){
   let tipoCol=null; const p0=(f[0]||{properties:{}}).properties||{};
   for(const k of['tipo_prop','tipo_propietario','propietario','tenencia']){ if(p0[k]!==undefined){ tipoCol=k; break; } }
   if(!tipoCol) for(const k of Object.keys(p0)){ if(k.toLowerCase().includes('prop')||k.toLowerCase().includes('tenencia')){ tipoCol=k; break; } }
   if(tipoCol) f=f.filter(ft=>agruparPropiedad(estandarizarTipoPropietario(ft.properties[tipoCol]||''))===dashboardFilters.propiedad);
  }
  return f;
}
function zoomAFeatures(feats){
 if(!feats||!feats.length) return 0;
 try{
  const b=L.geoJSON({type:'FeatureCollection', features:feats}).getBounds();
  if(b&&b.isValid()){ map.fitBounds(b,{padding:[28,28], maxZoom:12}); return feats.length; }
 }catch(e){}
 return 0;
}
function poblarFiltrosCascada(){
 const selCat=document.getElementById('filtro-casc-cat');
 const selEst=document.getElementById('filtro-casc-estado');
 const selProp=document.getElementById('filtro-casc-prop');
 if(!selCat||!selEst||!selProp) return;
 const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));
 const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));
 const anpFull=anpK?(activeLayers[anpK].featuresData||[]):[];
 const advcFull=advcK?(activeLayers[advcK].featuresData||[]):[];
 const catCol=anpK?activeLayers[anpK].categoriaCol:null;
 const cats=catCol?[...new Set(anpFull.map(f=>String(f.properties[catCol]||'').trim()).filter(Boolean))].sort():[];
 const estSet=new Set();
  [...anpFull, ...advcFull].forEach(f=>{
   const p=f.properties||{};
   [p.estados,p.estado].forEach(v=>{ const s=String(v||'').trim(); if(s) s.split(/[,;]/).forEach(x=>{ const t=x.trim(); if(t) estSet.add(t); }); });
  });
 const ests=[...estSet].sort();
 const keep=(sel,vals,allLbl)=>{
  const cur=sel.value;
  sel.innerHTML=`<option value="">${allLbl}</option>`+vals.map(v=>`<option value="${v}">${v}</option>`).join('');
  if(cur&&vals.includes(cur)) sel.value=cur;
 };
 keep(selCat,cats,'Todas');
 keep(selEst,ests,'Todos');
 const btn=document.getElementById('btn-filtros-cascade');
 if(btn) btn.classList.toggle('active', !!(dashboardFilters.cat||dashboardFilters.estado||dashboardFilters.propiedad));
}
function aplicarFiltrosCascada(conZoom=true){
 const selCat=document.getElementById('filtro-casc-cat');
 const selEst=document.getElementById('filtro-casc-estado');
 const selProp=document.getElementById('filtro-casc-prop');
 dashboardFilters.cat=selCat&&selCat.value?selCat.value:null;
 dashboardFilters.estado=selEst&&selEst.value?selEst.value:null;
 dashboardFilters.propiedad=selProp&&selProp.value?selProp.value:null;
 tableExpanded=false;
 actualizarDashboard();
 if(conZoom){
  const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));
  const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));
  const feats=[...featuresCoincidentesDash(anpK), ...featuresCoincidentesDash(advcK)];
  const n=zoomAFeatures(feats);
  const info=document.getElementById('filtros-cascade-info');
  if(info) info.textContent=n?`✅ ${n.toLocaleString('es-MX')} elementos — zoom aplicado`:'⚠️ Sin elementos coincidentes';
  setTimeout(()=>{ try{ actualizarDashboard(); }catch(e){} }, 400);
 }
}
document.getElementById('btn-filtros-cascade')?.addEventListener('click',(e)=>{
 e.stopPropagation();
 document.getElementById('filtros-cascade-menu')?.classList.toggle('show');
});
document.getElementById('btn-aplicar-filtros-casc')?.addEventListener('click',()=>{ aplicarFiltrosCascada(true); });
document.getElementById('btn-limpiar-filtros-casc')?.addEventListener('click',()=>{
 const s1=document.getElementById('filtro-casc-cat'); if(s1) s1.value='';
 const s2=document.getElementById('filtro-casc-estado'); if(s2) s2.value='';
 const s3=document.getElementById('filtro-casc-prop'); if(s3) s3.value='';
 clearDashboardFilters(); updateFilterBar();
 document.getElementById('filtros-cascade-menu')?.classList.remove('show');
});
document.addEventListener('mousedown',(e)=>{
 const menu=document.getElementById('filtros-cascade-menu');
 const wrap=document.getElementById('filtros-cascade-wrap');
 if(menu&&menu.classList.contains('show')&&wrap&&!wrap.contains(e.target)) menu.classList.remove('show');
});

// ================================================================
// POPUP
// ================================================================
const ATTR_MAPS={anp:{orderedKeys:['id_dof','nombre','cat_manejo','estados','region','superficie','s_terres','s_marina','prim_dec','ult_dof','pm','cert_sinap'],displayMap:{'id_dof':'ID CONANP','nombre':'Nombre','cat_manejo':'Categoría','estados':'Estados','region':'Región','superficie':'Superficie','s_terres':'Sup. Terrestre','s_marina':'Sup. Marina','prim_dec':'1ª DOF','ult_dof':'Última DOF','pm':'Prog. Manejo DOF','cert_sinap':'Certificado SINAP'}},advc:{orderedKeys:['instrument','estado','municipio','fecha_exp','vigencia','ha_cert','ecosistema','nom_059','tipo_prop'],displayMap:{'instrument':'Certificado','estado':'Estado','municipio':'Municipio','fecha_exp':'Fecha certificación','vigencia':'Vigencia','ha_cert':'Sup. (ha)','ecosistema':'Ecosistema','nom_059':'NOM 059','tipo_prop':'Tipo propiedad'}}};
function obtenerMapeoAtributos(t){const l=t.toLowerCase();if(l.includes('shp_anp')&&!l.includes('zp_anp')&&!l.includes('reg_conanp'))return ATTR_MAPS.anp;if(l.includes('shp_advc'))return ATTR_MAPS.advc;return null;}
// Auto-generado desde https://sig.conanp.gob.mx/Individuales (230 ANP)
const SIG_ANP_MAP = {
  "Alto Golfo de California y Delta del Río Colorado": "AltoGolfo",
  "Arrecife Alacranes": "ArrAlacranes",
  "Arrecife de Puerto Morelos": "ArrPuertoMorelos",
  "Arrecifes de Cozumel": "ArrCozumel",
  "Arrecifes del Golfo de México-Sur": "ArrGolfoMex",
  "Arrecifes de Sian Ka'an": "ArrecifesdeSianKaan",
  "Arrecifes de Xcalak": "ArrXcalak",
  "Bahía de Loreto": "BhLoreto",
  "Bajos de Coyula": "BajosdeCoyula",
  "Bajos de Coyula II": "BajosCoyulaII",
  "Bajos del Norte": "BajosdelNorte",
  "Bala'an K'aax": "BalaanKaax",
  "Balam Kin": "BalamKin",
  "Balam Kú": "BalamKu",
  "Balandra": "Balandra",
  "Banco Chinchorro": "BChinchorro",
  "Barra de la Cruz-Playa Grande": "BarradelaCruz",
  "Barranca del Cupatitzio": "BarrCupatitzio",
  "Barranca de Metztitlán": "BarrMetztitlan",
  "Bavispe": "Bavispe",
  "Benito Juárez": "BenitoJuarez",
  "Bonampak": "Bonampak",
  "Boquerón de Tonalá": "BoqueronTonala",
  "Bosencheve": "Bosencheve",
  "Cabo Pulmo": "CaboPulmo",
  "Cabo San Lucas": "CaboSLucas",
  "CADNR 001 Pabellón": "CADNR001Pabellon",
  "CADNR 004 Don Martín": "CADNR004DonMartin",
  "CADNR 026 Bajo Río San Juan": "CADNR026BRSJuan",
  "CADNR 043 Estado de Nayarit": "CADNR043ENayarit",
  "Calakmul": "Calakmul",
  "Campo Verde": "CampoVerde",
  "Canoas": "Canoas",
  "Cañón del Río Blanco": "CRioBlanco",
  "Cañón del Sumidero": "CSumidero",
  "Cañón del Usumacinta": "CUsumacinta",
  "Cañón de Santa Elena": "CSantaElena",
  "Caribe Mexicano": "CaribeMex",
  "Carmen Serdán": "CarmenSerdan",
  "Cascada de Agua Azul": "CasAguaAzul",
  "Cascada de Bassaseachic": "CasBassaseachic",
  "Cenote Aerolito": "CenoteAerolito",
  "Cerro de Garnica": "CerrGarnica",
  "Cerro de la Estrella": "CerrEstrella",
  "Cerro de las Campanas": "CerrCampanas",
  "Cerro de la Silla": "CerrSilla",
  "Cerro Mohinora": "CerrMohinora",
  "Chamela Cuixmala": "ChamelaCuixmala",
  "Chan Kin": "ChanKin",
  "Chunyaxché": "Chunyaxche",
  "Ciénegas del Lerma": "CienegasDelLerma",
  "Cofre de Perote o Nauhcampatépetl": "CofrePerote",
  "Complejo Lagunar Ojo de Liebre": "OjodeLiebre",
  "Constitución de 1857": "Constitucion",
  "Corredor Biológico Chichinautzin": "COBIO",
  "Costa Occidental de Isla Mujeres, Punta Cancún y Punta Nizuc": "IMujeres",
  "Cotorra Serrana Occidental": "CotorraSerrana",
  "Cuatrociénegas": "Cuatrocienegas",
  "Cumbres del Ajusco": "CumbresdelAjusco",
  "Cumbres de Majalca": "CumbresdeMajalca",
  "Cumbres de Monterrey": "CumbresMonterrey",
  "Desierto del Carmen o de Nixcongo": "DesiertoDelCarmen",
  "Dzibilchantún": "Dzibilchantun",
  "El Chico": "ElChico",
  "El Cimatario": "ElCimatario",
  "El Histórico Coyoacán": "ElHistoricoCoyoacan",
  "El Jabalí": "ElJabali",
  "El Lago de Camécuaro": "ELLagdeCamecuaro",
  "El Pinacate y Gran Desierto de Altar": "ElPinacate",
  "El Potosí": "ElPotosi",
  "El Sabinal": "ElSabinal",
  "El Tepeyac": "ElTepeyac",
  "El Tepozteco": "ElTepozteco",
  "El Triunfo": "ElTriunfo",
  "El Vizcaíno": "Vizcaino",
  "Felipe Carrillo Puerto": "FpeCarrPto",
  "Fuentes Brotantes de Tlalpan": "FuentesBrotantesdeTlalpan",
  "General Juan Álvarez": "GeneralJÁlvarez",
  "Gogorrón": "Gogorron",
  "Grutas de Cacahuamilpa": "GrutasCacahuamilpa",
  "Hermenegildo Galeana": "HermenegildoGaleana",
  "Huatulco": "Huatulco",
  "Huatulco II": "HuatulcoII",
  "Humedales de Montaña La Kisst y María Eugenia": "LaKisstyMaEug",
  "Insurgente José María Morelos": "InsJMMorelos",
  "Insurgente Miguel Hidalgo y Costilla": "InsMHyC",
  "Isla Contoy": "IContoy",
  "Isla Guadalupe": "IGpe",
  "Isla Isabel": "IIsabel",
  "Isla San Pedro Mártir": "ISPMartir",
  "Islas del Golfo de California": "IGolfoCalif",
  "Islas del Pacífico de la Península de Baja California": "IPacifico",
  "Islas La Pajarera, Cocinas, Mamut, Colorada, San Pedro, San Agustín, San Andrés": "IdelaBahiadeChamela",
  "Islas Marías": "IMarias",
  "Islas Marietas": "IMarietas",
  "Iztaccíhuatl Popocatépetl": "IztaPopo",
  "Jacinto Pat": "JacintoPat",
  "Jaguar": "Jaguar",
  "Janos": "Janos",
  "Juan M. Banderas": "JuanMBanderas",
  "Kowtahyolo": "Kowtahyolo",
  "Lacan Tun": "LacanTun",
  "La Encrucijada": "Encrucijada",
  "Lago de Texcoco": "LagTexcoco",
  "Lago Tláhuac-Xico": "LagTlahuac-Xico",
  "Laguna de Términos": "LagTerminos",
  "Laguna Madre y Delta del Río Bravo": "LagMadre",
  "Lagunas de Chacahua": "LagChacahua",
  "Lagunas de Montebello": "LagMontebello",
  "Lagunas de Zempoala": "LagZempoala",
  "La Michilía": "LaMichilia",
  "La Montaña Malinche o Matlalcuéyatl": "LaMalinche",
  "La porción norte y la franja costera oriental, terrestres y marinas de la Isla de Cozumel": "ICozumel",
  "La Primavera": "LaPrimavera",
  "La Sepultura": "LaSepultura",
  "Las Huertas": "LasHuertas",
  "Lomas de Padierna": "LomasdePadierna",
  "Loreto II": "LoretoII",
  "Los Mármoles": "Marmoles",
  "Los Novillos": "LosNovillos",
  "Los Petenes": "LosPetenes",
  "Los Remedios": "LosRemedios",
  "Los Tuxtlas": "LosTuxtlas",
  "Maderas del Carmen": "MaderasDelCarmen",
  "Manglares de Nichupté": "ManNichupte",
  "Manglares de Puerto Morelos": "ManPtoMorelos",
  "Mapimí": "Mapimi",
  "Mariposa Monarca": "MariposaMonarca",
  "Marismas Nacionales Nayarit": "MarismasNacionales",
  "Médanos de Samalayuca": "MedanosSamalayuca",
  "Meseta de Cacaxtla": "MesetaCacaxtla",
  "Metzabok": "Metzabok",
  "Molino de Flores Netzahualcóyotl": "MolinoDeFlores",
  "Montes Azules": "MontesAzules",
  "Nahá": "Naha",
  "Nevado de Toluca": "NevadoToluca",
  "Nopoló": "Nopolo",
  "Nuevo Uxmal": "NUxmal",
  "Ocampo": "Ocampo",
  "Otoch Maax Yetel Kooh": "Otoch",
  "Pacífico Mexicano Profundo": "PMProfundo",
  "Palenque": "Palenque",
  "Pantanos de Centla": "PantanosCentla",
  "Papigochic": "Papigochic",
  "Peña Colorada": "PeñaColorada",
  "Pico de Orizaba": "PiOrizaba",
  "Pico de Tancítaro": "PideTancitaro",
  "Playa Cahuitán": "PCahuitan",
  "Playa Ceuta": "PCeuta",
  "Playa Chacahua": "PBhChacahua",
  "Playa Chenkan": "PChenkan",
  "Playa Colola": "PColola",
  "Playa Cuitzmala": "PCuitzmala",
  "Playa Delfines": "PDelfines",
  "Playa El Tecuán": "PElTecuan",
  "Playa El Verde Camacho": "PVerdeCamacho",
  "Playa Escobilla": "PEscobilla",
  "Playa Huizache Caimanero": "PHuizacheCaimanero",
  "Playa Lechuguillas": "PLechuguillas",
  "Playa Maruata": "PMaruata",
  "Playa Mexiquillo": "PMexiquillo",
  "Playa Mismaloya": "PMismaloya",
  "Playa Morro Ayuta": "PMorroAyuta",
  "Playa Piedra de Tlacoyunque": "PPiedradeTlacoyunque",
  "Playa Platanitos": "PPlatanitos",
  "Playa Puerto Arista": "PPuertoArista",
  "Playa Rancho Nuevo": "PRanchoNuevo",
  "Playa Ría Lagartos": "PRíaLagartos",
  "Playas de Isla Contoy": "PsdeIContoy",
  "Playas del Totonacapan": "PTotonacapan",
  "Playa Teopa": "PTeopa",
  "Playa Tierra Colorada": "PTierraColorada",
  "Rayón": "Rayón",
  "Revillagigedo": "Revillagigedo",
  "Ría Celestún": "RiaCelestun",
  "Ría Lagartos": "RiaLagartos",
  "Ricardo Flores Magón": "RicardoFloresMagon",
  "Río Bravo del Norte": "RioBravo",
  "Ríos y Montañas de la Comarca Lagunera": "ComarcaLagunera",
  "Sacromonte": "Sacromonte",
  "San Buenaventura": "SanBuenaventura",
  "San Quintín": "SanQuintin",
  "Selva El Ocote": "SelvaOcote",
  "Semidesierto Zacatecano": "SemidesiertoZacatecano",
  "Sian Ka´an": "SianKaan",
  "Sierra de Álamos Río Cuchujaqui": "SiAlamos",
  "Sierra de Álvarez": "SideAlvarez",
  "Sierra de Huautla": "SideHuautla",
  "Sierra del Abra Tanchipa": "SidelAbraTanchipa",
  "Sierra de Manantlán": "SideManantlan",
  "Sierra de Órganos": "SideOrganos",
  "Sierra de Quila": "SideQuila",
  "Sierra de San Miguelito": "SideSanMiguelito",
  "Sierra de San Pedro Mártir": "SiSanPedroMartir",
  "Sierra de Tamaulipas": "SideTamaulipas",
  "Sierra de Vallejo-Río Ameca": "SiVallejo",
  "Sierra Gorda": "SiGorda",
  "Sierra Gorda de Guanajuato": "SiGordadeGto",
  "Sierra La Laguna": "SiLaLag",
  "Sierra La Mojonera": "SiLaMojonera",
  "Sierra Tecuani": "SiTecuani",
  "Sistema Arrecifal Lobos Tuxpan": "SArrLobosTuxpan",
  "Sistema Arrecifal Veracruzano": "SAVeracruzano",
  "Tangolunda": "Tangolunda",
  "Tehuacán Cuicatlán": "Tehuacan",
  "Tiburón Ballena": "TiburonBallena",
  "Tlachinoltepetl": "Tlachinoltepetl",
  "Tula": "Tula",
  "Tulum": "Tulum",
  "Tutuaca": "Tutuaca",
  "Uaymil": "Uaymil",
  "Valle de los Cirios": "ValleCirios",
  "Ventilas Hidrotermales de la Cuenca de Guaymas y de la Dorsal del Pacífico Oriental": "Ventilas",
  "Vicente Guerrero": "VicenteGuerrero",
  "Volcán Nevado de Colima": "VolcanNevadoColima",
  "Volcán Tacaná": "VolcanTacana",
  "Wanha'": "Wanha",
  "Xicoténcatl": "Xicotencatl",
  "Yagul": "Yagul",
  "Yaxchilán": "Yaxchilan",
  "Yum Balam": "YumBalam",
  "Zicuirán Infiernillo": "Zicuiran_Infiernillo",
  "Zona marina Bahía de los Ángeles, canales de Ballenas y de Salsipuedes": "ZMBhAngeles",
  "Zona Marina de la Isla Isabel": "ZMIIsabel",
  "Zona marina del Archipiélago de Espíritu Santo": "ZMArchEspSanto",
  "Zona marina del Archipiélago de San Lorenzo": "ZMArchSanLorenzo",
  "Zona Protectora Forestal los terrenos constitutivos de las cuencas de los ríos Valle de Bravo, Malacatepec, Tilostoc y Temascaltepec": "ValledeBravo",
  "Zona Protectora Forestal Vedada Cuenca Hidrográfica del Río Necaxa": "CuenHidroRioNecaxa",
  "ZPF La Concordia, Ángel Albino Corzo, Villa Flores y Jiquipilas": "LaConcordia",
  "ZPFV de los terrenos forestales de Villa Allende": "VillaAllende"
};
const SIG_ANP_NORM_MAP = {
  "alto golfo de california y delta del rio colorado": "AltoGolfo",
  "arrecife alacranes": "ArrAlacranes",
  "arrecife de puerto morelos": "ArrPuertoMorelos",
  "arrecifes de cozumel": "ArrCozumel",
  "arrecifes del golfo de mexico sur": "ArrGolfoMex",
  "arrecifes de sian ka an": "ArrecifesdeSianKaan",
  "arrecifes de xcalak": "ArrXcalak",
  "bahia de loreto": "BhLoreto",
  "bajos de coyula": "BajosdeCoyula",
  "bajos de coyula ii": "BajosCoyulaII",
  "bajos del norte": "BajosdelNorte",
  "bala an k aax": "BalaanKaax",
  "balam kin": "BalamKin",
  "balam ku": "BalamKu",
  "balandra": "Balandra",
  "banco chinchorro": "BChinchorro",
  "barra de la cruz playa grande": "BarradelaCruz",
  "barranca del cupatitzio": "BarrCupatitzio",
  "barranca de metztitlan": "BarrMetztitlan",
  "bavispe": "Bavispe",
  "benito juarez": "BenitoJuarez",
  "bonampak": "Bonampak",
  "boqueron de tonala": "BoqueronTonala",
  "bosencheve": "Bosencheve",
  "cabo pulmo": "CaboPulmo",
  "cabo san lucas": "CaboSLucas",
  "cadnr 001 pabellon": "CADNR001Pabellon",
  "cadnr 004 don martin": "CADNR004DonMartin",
  "cadnr 026 bajo rio san juan": "CADNR026BRSJuan",
  "cadnr 043 estado de nayarit": "CADNR043ENayarit",
  "calakmul": "Calakmul",
  "campo verde": "CampoVerde",
  "canoas": "Canoas",
  "canon del rio blanco": "CRioBlanco",
  "canon del sumidero": "CSumidero",
  "canon del usumacinta": "CUsumacinta",
  "canon de santa elena": "CSantaElena",
  "caribe mexicano": "CaribeMex",
  "carmen serdan": "CarmenSerdan",
  "cascada de agua azul": "CasAguaAzul",
  "cascada de bassaseachic": "CasBassaseachic",
  "cenote aerolito": "CenoteAerolito",
  "cerro de garnica": "CerrGarnica",
  "cerro de la estrella": "CerrEstrella",
  "cerro de las campanas": "CerrCampanas",
  "cerro de la silla": "CerrSilla",
  "cerro mohinora": "CerrMohinora",
  "chamela cuixmala": "ChamelaCuixmala",
  "chan kin": "ChanKin",
  "chunyaxche": "Chunyaxche",
  "cienegas del lerma": "CienegasDelLerma",
  "cofre de perote o nauhcampatepetl": "CofrePerote",
  "complejo lagunar ojo de liebre": "OjodeLiebre",
  "constitucion de 1857": "Constitucion",
  "corredor biologico chichinautzin": "COBIO",
  "costa occidental de isla mujeres punta cancun y punta nizuc": "IMujeres",
  "cotorra serrana occidental": "CotorraSerrana",
  "cuatrocienegas": "Cuatrocienegas",
  "cumbres del ajusco": "CumbresdelAjusco",
  "cumbres de majalca": "CumbresdeMajalca",
  "cumbres de monterrey": "CumbresMonterrey",
  "desierto del carmen o de nixcongo": "DesiertoDelCarmen",
  "dzibilchantun": "Dzibilchantun",
  "el chico": "ElChico",
  "el cimatario": "ElCimatario",
  "el historico coyoacan": "ElHistoricoCoyoacan",
  "el jabali": "ElJabali",
  "el lago de camecuaro": "ELLagdeCamecuaro",
  "el pinacate y gran desierto de altar": "ElPinacate",
  "el potosi": "ElPotosi",
  "el sabinal": "ElSabinal",
  "el tepeyac": "ElTepeyac",
  "el tepozteco": "ElTepozteco",
  "el triunfo": "ElTriunfo",
  "el vizcaino": "Vizcaino",
  "felipe carrillo puerto": "FpeCarrPto",
  "fuentes brotantes de tlalpan": "FuentesBrotantesdeTlalpan",
  "general juan alvarez": "GeneralJÁlvarez",
  "gogorron": "Gogorron",
  "grutas de cacahuamilpa": "GrutasCacahuamilpa",
  "hermenegildo galeana": "HermenegildoGaleana",
  "huatulco": "Huatulco",
  "huatulco ii": "HuatulcoII",
  "humedales de montana la kisst y maria eugenia": "LaKisstyMaEug",
  "insurgente jose maria morelos": "InsJMMorelos",
  "insurgente miguel hidalgo y costilla": "InsMHyC",
  "isla contoy": "IContoy",
  "isla guadalupe": "IGpe",
  "isla isabel": "IIsabel",
  "isla san pedro martir": "ISPMartir",
  "islas del golfo de california": "IGolfoCalif",
  "islas del pacifico de la peninsula de baja california": "IPacifico",
  "islas la pajarera cocinas mamut colorada san pedro san agustin san andres": "IdelaBahiadeChamela",
  "islas marias": "IMarias",
  "islas marietas": "IMarietas",
  "iztaccihuatl popocatepetl": "IztaPopo",
  "jacinto pat": "JacintoPat",
  "jaguar": "Jaguar",
  "janos": "Janos",
  "juan m banderas": "JuanMBanderas",
  "kowtahyolo": "Kowtahyolo",
  "lacan tun": "LacanTun",
  "la encrucijada": "Encrucijada",
  "lago de texcoco": "LagTexcoco",
  "lago tlahuac xico": "LagTlahuac-Xico",
  "laguna de terminos": "LagTerminos",
  "laguna madre y delta del rio bravo": "LagMadre",
  "lagunas de chacahua": "LagChacahua",
  "lagunas de montebello": "LagMontebello",
  "lagunas de zempoala": "LagZempoala",
  "la michilia": "LaMichilia",
  "la montana malinche o matlalcueyatl": "LaMalinche",
  "la porcion norte y la franja costera oriental terrestres y marinas de la isla de cozumel": "ICozumel",
  "la primavera": "LaPrimavera",
  "la sepultura": "LaSepultura",
  "las huertas": "LasHuertas",
  "lomas de padierna": "LomasdePadierna",
  "loreto ii": "LoretoII",
  "los marmoles": "Marmoles",
  "los novillos": "LosNovillos",
  "los petenes": "LosPetenes",
  "los remedios": "LosRemedios",
  "los tuxtlas": "LosTuxtlas",
  "maderas del carmen": "MaderasDelCarmen",
  "manglares de nichupte": "ManNichupte",
  "manglares de puerto morelos": "ManPtoMorelos",
  "mapimi": "Mapimi",
  "mariposa monarca": "MariposaMonarca",
  "marismas nacionales nayarit": "MarismasNacionales",
  "medanos de samalayuca": "MedanosSamalayuca",
  "meseta de cacaxtla": "MesetaCacaxtla",
  "metzabok": "Metzabok",
  "molino de flores netzahualcoyotl": "MolinoDeFlores",
  "montes azules": "MontesAzules",
  "naha": "Naha",
  "nevado de toluca": "NevadoToluca",
  "nopolo": "Nopolo",
  "nuevo uxmal": "NUxmal",
  "ocampo": "Ocampo",
  "otoch maax yetel kooh": "Otoch",
  "pacifico mexicano profundo": "PMProfundo",
  "palenque": "Palenque",
  "pantanos de centla": "PantanosCentla",
  "papigochic": "Papigochic",
  "pena colorada": "PeñaColorada",
  "pico de orizaba": "PiOrizaba",
  "pico de tancitaro": "PideTancitaro",
  "playa cahuitan": "PCahuitan",
  "playa ceuta": "PCeuta",
  "playa chacahua": "PBhChacahua",
  "playa chenkan": "PChenkan",
  "playa colola": "PColola",
  "playa cuitzmala": "PCuitzmala",
  "playa delfines": "PDelfines",
  "playa el tecuan": "PElTecuan",
  "playa el verde camacho": "PVerdeCamacho",
  "playa escobilla": "PEscobilla",
  "playa huizache caimanero": "PHuizacheCaimanero",
  "playa lechuguillas": "PLechuguillas",
  "playa maruata": "PMaruata",
  "playa mexiquillo": "PMexiquillo",
  "playa mismaloya": "PMismaloya",
  "playa morro ayuta": "PMorroAyuta",
  "playa piedra de tlacoyunque": "PPiedradeTlacoyunque",
  "playa platanitos": "PPlatanitos",
  "playa puerto arista": "PPuertoArista",
  "playa rancho nuevo": "PRanchoNuevo",
  "playa ria lagartos": "PRíaLagartos",
  "playas de isla contoy": "PsdeIContoy",
  "playas del totonacapan": "PTotonacapan",
  "playa teopa": "PTeopa",
  "playa tierra colorada": "PTierraColorada",
  "rayon": "Rayón",
  "revillagigedo": "Revillagigedo",
  "ria celestun": "RiaCelestun",
  "ria lagartos": "RiaLagartos",
  "ricardo flores magon": "RicardoFloresMagon",
  "rio bravo del norte": "RioBravo",
  "rios y montanas de la comarca lagunera": "ComarcaLagunera",
  "sacromonte": "Sacromonte",
  "san buenaventura": "SanBuenaventura",
  "san quintin": "SanQuintin",
  "selva el ocote": "SelvaOcote",
  "semidesierto zacatecano": "SemidesiertoZacatecano",
  "sian ka an": "SianKaan",
  "sierra de alamos rio cuchujaqui": "SiAlamos",
  "sierra de alvarez": "SideAlvarez",
  "sierra de huautla": "SideHuautla",
  "sierra del abra tanchipa": "SidelAbraTanchipa",
  "sierra de manantlan": "SideManantlan",
  "sierra de organos": "SideOrganos",
  "sierra de quila": "SideQuila",
  "sierra de san miguelito": "SideSanMiguelito",
  "sierra de san pedro martir": "SiSanPedroMartir",
  "sierra de tamaulipas": "SideTamaulipas",
  "sierra de vallejo rio ameca": "SiVallejo",
  "sierra gorda": "SiGorda",
  "sierra gorda de guanajuato": "SiGordadeGto",
  "sierra la laguna": "SiLaLag",
  "sierra la mojonera": "SiLaMojonera",
  "sierra tecuani": "SiTecuani",
  "sistema arrecifal lobos tuxpan": "SArrLobosTuxpan",
  "sistema arrecifal veracruzano": "SAVeracruzano",
  "tangolunda": "Tangolunda",
  "tehuacan cuicatlan": "Tehuacan",
  "tiburon ballena": "TiburonBallena",
  "tlachinoltepetl": "Tlachinoltepetl",
  "tula": "Tula",
  "tulum": "Tulum",
  "tutuaca": "Tutuaca",
  "uaymil": "Uaymil",
  "valle de los cirios": "ValleCirios",
  "ventilas hidrotermales de la cuenca de guaymas y de la dorsal del pacifico oriental": "Ventilas",
  "vicente guerrero": "VicenteGuerrero",
  "volcan nevado de colima": "VolcanNevadoColima",
  "volcan tacana": "VolcanTacana",
  "wanha": "Wanha",
  "xicotencatl": "Xicotencatl",
  "yagul": "Yagul",
  "yaxchilan": "Yaxchilan",
  "yum balam": "YumBalam",
  "zicuiran infiernillo": "Zicuiran_Infiernillo",
  "zona marina bahia de los angeles canales de ballenas y de salsipuedes": "ZMBhAngeles",
  "zona marina de la isla isabel": "ZMIIsabel",
  "zona marina del archipielago de espiritu santo": "ZMArchEspSanto",
  "zona marina del archipielago de san lorenzo": "ZMArchSanLorenzo",
  "zona protectora forestal los terrenos constitutivos de las cuencas de los rios valle de bravo malacatepec tilostoc y temascaltepec": "ValledeBravo",
  "zona protectora forestal vedada cuenca hidrografica del rio necaxa": "CuenHidroRioNecaxa",
  "zpf la concordia angel albino corzo villa flores y jiquipilas": "LaConcordia",
  "zpfv de los terrenos forestales de villa allende": "VillaAllende"
};
function getSigIdForAnp(nombre) {
  if(!nombre) return null;
  let v = SIG_ANP_MAP[nombre];
  if(v) return v;
  // Try trimmed
  v = SIG_ANP_MAP[nombre.trim()];
  if(v) return v;
  // Try html unescape
  try {
    const unesc = nombre.replace(/&#039;/g, "'").replace(/&quot;/g, '"');
    if(SIG_ANP_MAP[unesc]) return SIG_ANP_MAP[unesc];
  } catch(e){}
  // Normalized fallback
  const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  // Direct lookup in norm map
  if(SIG_ANP_NORM_MAP[n]) return SIG_ANP_NORM_MAP[n];
  // Try to find by includes
  for(const key in SIG_ANP_NORM_MAP) {
    if(key===n || n.includes(key) || key.includes(n)) return SIG_ANP_NORM_MAP[key];
  }
  // Fallback: construct ID by removing spaces and special chars (for Calakmul-like straightforward)
  const fallback = nombre.replace(/[^a-zA-Z0-9]/g,'');
  // Check if fallback exists as value in mapping
  const vals = Object.values(SIG_ANP_MAP);
  if(vals.includes(fallback)) return fallback;
  // Try capitalized first letter + rest
  // As last resort, return fallback if it looks like ID (no spaces)
  if(fallback.length>=3 && fallback.length<=30) {
    // Check if URL would exist via pattern (we assume true)
    // Return fallback for direct link attempt
    return fallback;
  }
  return null;
}

// SIMEC fichas - auto-generado desde https://simec.conanp.gob.mx/consulta_fichas.php (232 ANP)
const SIMEC_ANP_MAP = {
  "Alto Golfo de California y Delta del Río Colorado": "2",
  "Arrecife Alacranes": "61",
  "Arrecife de Puerto Morelos": "83",
  "Arrecifes de Cozumel": "30",
  "Arrecifes del Golfo de México-Sur": "248",
  "Arrecifes de Sian Kaan": "84",
  "Arrecifes de Xcalak": "37",
  "Bahía de Loreto": "31",
  "Bajos de Coyula": "204",
  "Bajos de Coyula II": "251",
  "Bajos del Norte": "230",
  "Balaan Kaax": "45",
  "Balam Kin": "215",
  "Balam Kú": "216",
  "Balandra": "131",
  "Banco Chinchorro": "53",
  "Barra de la Cruz - Playa Grande": "220",
  "Barranca del Cupatitzio": "3",
  "Barranca de Metztitlán": "9",
  "Bavispe": "193",
  "Benito Juárez": "127",
  "Bonampak": "126",
  "Boquerón de Tonalá": "125",
  "Bosencheve": "6",
  "Cabo Pulmo": "111",
  "Cabo San Lucas": "113",
  "CADNR 001 Pabellón": "13",
  "CADNR 004 Don Martín": "152",
  "CADNR 026 Bajo Río San Juan": "173",
  "CADNR 043 Estado de Nayarit": "4",
  "Calakmul": "85",
  "Campo Verde": "7",
  "Canoas": "225",
  "Cañón del Río Blanco": "110",
  "Cañón del Sumidero": "128",
  "Cañón del Usumacinta": "160",
  "Cañón de Santa Elena": "144",
  "Caribe Mexicano": "191",
  "Carmen Serdán": "229",
  "Cascada de Bassaseachic": "8",
  "Cascadas de Agua Azul": "130",
  "Cenote Aerolito": "207",
  "Cerro de Garnica": "66",
  "Cerro de la Estrella": "17",
  "Cerro de las Campanas": "16",
  "Cerro de la Silla": "137",
  "Cerro Mohinora": "183",
  "Chamela-Cuixmala": "10",
  "Chan-Kin": "175",
  "Chunyaxché": "246",
  "Ciénegas del Lerma": "20",
  "Cofre de Perote o Nauhcampatépetl": "112",
  "Complejo Lagunar Ojo de Liebre": "114",
  "Constitución de 1857": "115",
  "Corredor Biológico Chichinautzin": "39",
  "Costa Occidental de Isla Mujeres, Punta Cancún y Punta Nizuc": "88",
  "Cotorra Serrana Occidental": "222",
  "Cuatrociénegas": "151",
  "Cumbres del Ajusco": "58",
  "Cumbres de Majalca": "21",
  "Cumbres de Monterrey": "153",
  "Desierto del Carmen o de Nixcongo": "62",
  "Desierto de los Leones": "63",
  "Dzibilchantún": "89",
  "El Chico": "65",
  "El Cimatario": "67",
  "El Histórico Coyoacán": "69",
  "El Jabalí": "14",
  "El Lago de Camécuaro": "36",
  "El Pinacate y Gran Desierto de Altar": "24",
  "El Potosí": "154",
  "El Sabinal": "149",
  "El Tepeyac": "70",
  "El Tepozteco": "71",
  "El Triunfo": "166",
  "El Veladero": "74",
  "El Vizcaíno": "116",
  "Felipe Carrillo Puerto": "242",
  "Fuentes Brotantes de Tlalpan": "75",
  "General Juan Álvarez": "76",
  "Gogorrón": "156",
  "Grutas de Cacahuamilpa": "79",
  "Hermenegildo Galeana": "205",
  "Huatulco": "134",
  "Huatulco II": "213",
  "Humedales de Montaña La Kisst y Maria Eugenia": "221",
  "Insurgente José María Morelos": "15",
  "Insurgente Miguel Hidalgo y Costilla": "86",
  "Isla Contoy": "90",
  "Isla Guadalupe": "124",
  "Isla Isabel": "19",
  "Isla San Pedro Mártir": "25",
  "Islas del Golfo de California": "80",
  "Islas del Pacífico de la Península de Baja California": "189",
  "Islas La Pajarera, Cocinas, Mamut, Colorada, San Pedro, San Agustín, San Andrés y Negrita, y los Islotes Los Anegados, Novillas, Mosca y Submarino": "29",
  "Islas Marías": "23",
  "Islas Marietas": "27",
  "Iztaccíhuatl-Popocatépetl": "87",
  "Jacinto Pat": "206",
  "Jaguar": "198",
  "Janos": "26",
  "Juan M. Banderas": "210",
  "Kowtahyolo": "247",
  "Lacan-Tun": "159",
  "La Encrucijada": "163",
  "Lago de Texcoco": "197",
  "Lago Tláhuac-Xico": "239",
  "Laguna de Términos": "118",
  "Laguna Madre y Delta del Río Bravo": "122",
  "Lagunas de Chacahua": "165",
  "Lagunas de Montebello": "167",
  "Lagunas de Zempoala": "98",
  "La Michilía": "28",
  "La montaña Malinche o Matlalcuéyatl": "101",
  "La porción norte y la franja costera oriental, terrestres y marinas de la Isla de Cozumel": "32",
  "La Primavera": "35",
  "La Sepultura": "171",
  "Las Huertas": "38",
  "Lomas de Padierna": "99",
  "Loreto II": "203",
  "Los Mármoles": "100",
  "Los Novillos": "150",
  "Los Petenes": "91",
  "Los Remedios": "102",
  "Los Tuxtlas": "138",
  "Maderas del Carmen": "158",
  "Manglares de Nichupté": "95",
  "Manglares de Puerto Morelos": "233",
  "Mapimí": "139",
  "Mariposa Monarca": "40",
  "Marismas Nacionales Nayarit": "77",
  "Médanos de Samalayuca": "33",
  "Meseta de Cacaxtla": "5",
  "Metzabok": "140",
  "Molino de Flores Netzahualcóyotl": "103",
  "Montes Azules": "172",
  "Nahá": "68",
  "Nevado de Toluca": "104",
  "Nopoló": "208",
  "Nuevo Uxmal": "234",
  "Ocampo": "146",
  "Otoch Maax Yetel Kooh": "92",
  "Pacífico Mexicano Profundo": "190",
  "Palenque": "133",
  "Pantanos de Centla": "145",
  "Papigochic": "43",
  "Peña Colorada": "200",
  "Pico de Orizaba": "106",
  "Pico de Tancítaro": "78",
  "Playa Cahuitán": "228",
  "Playa Ceuta": "11",
  "Playa Chacahua": "164",
  "Playa Chenkan": "236",
  "Playa Colola": "199",
  "Playa Cuitzmala": "46",
  "Playa Delfines": "212",
  "Playa El Tecuán": "51",
  "Playa El Verde Camacho": "219",
  "Playa Escobilla": "176",
  "Playa Huizache Caimanero": "12",
  "Playa Lechuguillas": "218",
  "Playa Maruata": "47",
  "Playa Mexiquillo": "52",
  "Playa Mismaloya": "49",
  "Playa Morro Ayuta": "224",
  "Playa Piedra de Tlacoyunque": "72",
  "Playa Platanitos": "232",
  "Playa Puerto Arista": "162",
  "Playa Rancho Nuevo": "143",
  "Playa Ría Lagartos": "60",
  "Playas de Isla Contoy": "93",
  "Playas del Totonacapan": "235",
  "Playa Teopa": "55",
  "Playa Tierra Colorada": "34",
  "Rayón": "56",
  "Revillagigedo": "82",
  "Ría Celestún": "54",
  "Ría Lagartos": "57",
  "Ricardo Flores Magón": "214",
  "Río Bravo del Norte": "155",
  "Ríos y Montañas de la Comarca Lagunera": "227",
  "Sacromonte": "105",
  "San Buenaventura": "211",
  "San Quintín": "209",
  "Selva El Ocote": "174",
  "Semidesierto Zacatecano": "223",
  "Sian Kaan": "97",
  "Sierra de Álamos-Río Cuchujaqui": "22",
  "Sierra de Álvarez": "157",
  "Sierra de Huautla": "107",
  "Sierra del Abra Tanchipa": "147",
  "Sierra de Manantlán": "59",
  "Sierra de Órganos": "48",
  "Sierra de Quila": "64",
  "Sierra de San Miguelito": "196",
  "Sierra de San Pedro Mártir": "119",
  "Sierra de Tamaulipas": "192",
  "Sierra de Vallejo-Río Ameca": "226",
  "Sierra Gorda": "108",
  "Sierra Gorda de Guanajuato": "109",
  "Sierra la Laguna": "120",
  "Sierra La Mojonera": "148",
  "Sierra Tecuani": "240",
  "Sistema Arrecifal Lobos -Tuxpan": "132",
  "Sistema Arrecifal Veracruzano": "135",
  "Tangolunda": "241",
  "Tehuacán-Cuicatlán": "123",
  "Tiburón Ballena": "96",
  "Tlachinoltepetl": "237",
  "Tula": "142",
  "Tulum": "81",
  "Tutuaca": "50",
  "Uaymil": "94",
  "Valle de los Cirios": "121",
  "Ventilas Hidrotermales de La Cuenca de Guaymas y de La Dorsal del Pacífico Oriental": "136",
  "Vicente Guerrero": "201",
  "Volcán Nevado de Colima": "42",
  "Volcán Tacaná": "129",
  "Wanha’": "217",
  "Xicoténcatl": "161",
  "Yagul": "170",
  "Yaxchilán": "169",
  "Yum Balam": "44",
  "Zicuirán - Infiernillo": "73",
  "Zona de Protección Forestal en los terrenos que se encuentran en los municipios de La Concordia, Ángel Albino Corzo, Villa Flores y Jiquipilas, Chiapas": "168",
  "Zona Marina Bahía de los Angeles, Canales de Ballenas y de Salsipuedes": "1",
  "Zona Marina de la Isla Isabel": "238",
  "Zona Marina del Archipiélago de Espíritu Santo": "141",
  "Zona Marina del Archipiélago de San Lorenzo": "18",
  "Zona Protectora Forestal los terrenos constitutivos de las cuencas de los ríos Valle de Bravo, Malacatepec, Tilostoc y Temascaltepec": "41",
  "Zona Protectora Forestal Vedada Cuenca  Hidrográfica del Río Necaxa": "117",
  "Zona Protectora Forestal Vedada los terrenos forestales de Villa Allende": "252"
};
const SIMEC_ANP_NORM_MAP = {
  "alto golfo de california y delta del rio colorado": "2",
  "arrecife alacranes": "61",
  "arrecife de puerto morelos": "83",
  "arrecifes de cozumel": "30",
  "arrecifes del golfo de mexico sur": "248",
  "arrecifes de sian kaan": "84",
  "arrecifes de xcalak": "37",
  "bahia de loreto": "31",
  "bajos de coyula": "204",
  "bajos de coyula ii": "251",
  "bajos del norte": "230",
  "balaan kaax": "45",
  "balam kin": "215",
  "balam ku": "216",
  "balandra": "131",
  "banco chinchorro": "53",
  "barra de la cruz playa grande": "220",
  "barranca del cupatitzio": "3",
  "barranca de metztitlan": "9",
  "bavispe": "193",
  "benito juarez": "127",
  "bonampak": "126",
  "boqueron de tonala": "125",
  "bosencheve": "6",
  "cabo pulmo": "111",
  "cabo san lucas": "113",
  "cadnr 001 pabellon": "13",
  "cadnr 004 don martin": "152",
  "cadnr 026 bajo rio san juan": "173",
  "cadnr 043 estado de nayarit": "4",
  "calakmul": "85",
  "campo verde": "7",
  "canoas": "225",
  "canon del rio blanco": "110",
  "canon del sumidero": "128",
  "canon del usumacinta": "160",
  "canon de santa elena": "144",
  "caribe mexicano": "191",
  "carmen serdan": "229",
  "cascada de bassaseachic": "8",
  "cascadas de agua azul": "130",
  "cenote aerolito": "207",
  "cerro de garnica": "66",
  "cerro de la estrella": "17",
  "cerro de las campanas": "16",
  "cerro de la silla": "137",
  "cerro mohinora": "183",
  "chamela cuixmala": "10",
  "chan kin": "175",
  "chunyaxche": "246",
  "cienegas del lerma": "20",
  "cofre de perote o nauhcampatepetl": "112",
  "complejo lagunar ojo de liebre": "114",
  "constitucion de 1857": "115",
  "corredor biologico chichinautzin": "39",
  "costa occidental de isla mujeres punta cancun y punta nizuc": "88",
  "cotorra serrana occidental": "222",
  "cuatrocienegas": "151",
  "cumbres del ajusco": "58",
  "cumbres de majalca": "21",
  "cumbres de monterrey": "153",
  "desierto del carmen o de nixcongo": "62",
  "desierto de los leones": "63",
  "dzibilchantun": "89",
  "el chico": "65",
  "el cimatario": "67",
  "el historico coyoacan": "69",
  "el jabali": "14",
  "el lago de camecuaro": "36",
  "el pinacate y gran desierto de altar": "24",
  "el potosi": "154",
  "el sabinal": "149",
  "el tepeyac": "70",
  "el tepozteco": "71",
  "el triunfo": "166",
  "el veladero": "74",
  "el vizcaino": "116",
  "felipe carrillo puerto": "242",
  "fuentes brotantes de tlalpan": "75",
  "general juan alvarez": "76",
  "gogorron": "156",
  "grutas de cacahuamilpa": "79",
  "hermenegildo galeana": "205",
  "huatulco": "134",
  "huatulco ii": "213",
  "humedales de montana la kisst y maria eugenia": "221",
  "insurgente jose maria morelos": "15",
  "insurgente miguel hidalgo y costilla": "86",
  "isla contoy": "90",
  "isla guadalupe": "124",
  "isla isabel": "19",
  "isla san pedro martir": "25",
  "islas del golfo de california": "80",
  "islas del pacifico de la peninsula de baja california": "189",
  "islas la pajarera cocinas mamut colorada san pedro san agustin san andres y negrita y los islotes los anegados novillas mosca y submarino": "29",
  "islas marias": "23",
  "islas marietas": "27",
  "iztaccihuatl popocatepetl": "87",
  "jacinto pat": "206",
  "jaguar": "198",
  "janos": "26",
  "juan m banderas": "210",
  "kowtahyolo": "247",
  "lacan tun": "159",
  "la encrucijada": "163",
  "lago de texcoco": "197",
  "lago tlahuac xico": "239",
  "laguna de terminos": "118",
  "laguna madre y delta del rio bravo": "122",
  "lagunas de chacahua": "165",
  "lagunas de montebello": "167",
  "lagunas de zempoala": "98",
  "la michilia": "28",
  "la montana malinche o matlalcueyatl": "101",
  "la porcion norte y la franja costera oriental terrestres y marinas de la isla de cozumel": "32",
  "la primavera": "35",
  "la sepultura": "171",
  "las huertas": "38",
  "lomas de padierna": "99",
  "loreto ii": "203",
  "los marmoles": "100",
  "los novillos": "150",
  "los petenes": "91",
  "los remedios": "102",
  "los tuxtlas": "138",
  "maderas del carmen": "158",
  "manglares de nichupte": "95",
  "manglares de puerto morelos": "233",
  "mapimi": "139",
  "mariposa monarca": "40",
  "marismas nacionales nayarit": "77",
  "medanos de samalayuca": "33",
  "meseta de cacaxtla": "5",
  "metzabok": "140",
  "molino de flores netzahualcoyotl": "103",
  "montes azules": "172",
  "naha": "68",
  "nevado de toluca": "104",
  "nopolo": "208",
  "nuevo uxmal": "234",
  "ocampo": "146",
  "otoch maax yetel kooh": "92",
  "pacifico mexicano profundo": "190",
  "palenque": "133",
  "pantanos de centla": "145",
  "papigochic": "43",
  "pena colorada": "200",
  "pico de orizaba": "106",
  "pico de tancitaro": "78",
  "playa cahuitan": "228",
  "playa ceuta": "11",
  "playa chacahua": "164",
  "playa chenkan": "236",
  "playa colola": "199",
  "playa cuitzmala": "46",
  "playa delfines": "212",
  "playa el tecuan": "51",
  "playa el verde camacho": "219",
  "playa escobilla": "176",
  "playa huizache caimanero": "12",
  "playa lechuguillas": "218",
  "playa maruata": "47",
  "playa mexiquillo": "52",
  "playa mismaloya": "49",
  "playa morro ayuta": "224",
  "playa piedra de tlacoyunque": "72",
  "playa platanitos": "232",
  "playa puerto arista": "162",
  "playa rancho nuevo": "143",
  "playa ria lagartos": "60",
  "playas de isla contoy": "93",
  "playas del totonacapan": "235",
  "playa teopa": "55",
  "playa tierra colorada": "34",
  "rayon": "56",
  "revillagigedo": "82",
  "ria celestun": "54",
  "ria lagartos": "57",
  "ricardo flores magon": "214",
  "rio bravo del norte": "155",
  "rios y montanas de la comarca lagunera": "227",
  "sacromonte": "105",
  "san buenaventura": "211",
  "san quintin": "209",
  "selva el ocote": "174",
  "semidesierto zacatecano": "223",
  "sian kaan": "97",
  "sierra de alamos rio cuchujaqui": "22",
  "sierra de alvarez": "157",
  "sierra de huautla": "107",
  "sierra del abra tanchipa": "147",
  "sierra de manantlan": "59",
  "sierra de organos": "48",
  "sierra de quila": "64",
  "sierra de san miguelito": "196",
  "sierra de san pedro martir": "119",
  "sierra de tamaulipas": "192",
  "sierra de vallejo rio ameca": "226",
  "sierra gorda": "108",
  "sierra gorda de guanajuato": "109",
  "sierra la laguna": "120",
  "sierra la mojonera": "148",
  "sierra tecuani": "240",
  "sistema arrecifal lobos tuxpan": "132",
  "sistema arrecifal veracruzano": "135",
  "tangolunda": "241",
  "tehuacan cuicatlan": "123",
  "tiburon ballena": "96",
  "tlachinoltepetl": "237",
  "tula": "142",
  "tulum": "81",
  "tutuaca": "50",
  "uaymil": "94",
  "valle de los cirios": "121",
  "ventilas hidrotermales de la cuenca de guaymas y de la dorsal del pacifico oriental": "136",
  "vicente guerrero": "201",
  "volcan nevado de colima": "42",
  "volcan tacana": "129",
  "wanha": "217",
  "xicotencatl": "161",
  "yagul": "170",
  "yaxchilan": "169",
  "yum balam": "44",
  "zicuiran infiernillo": "73",
  "zona de proteccion forestal en los terrenos que se encuentran en los municipios de la concordia angel albino corzo villa flores y jiquipilas chiapas": "168",
  "zona marina bahia de los angeles canales de ballenas y de salsipuedes": "1",
  "zona marina de la isla isabel": "238",
  "zona marina del archipielago de espiritu santo": "141",
  "zona marina del archipielago de san lorenzo": "18",
  "zona protectora forestal los terrenos constitutivos de las cuencas de los rios valle de bravo malacatepec tilostoc y temascaltepec": "41",
  "zona protectora forestal vedada cuenca hidrografica del rio necaxa": "117",
  "zona protectora forestal vedada los terrenos forestales de villa allende": "252"
};
function getSimecIdForAnp(nombre) {
  if(!nombre) return null;
  if(SIMEC_ANP_MAP[nombre]) return SIMEC_ANP_MAP[nombre];
  if(SIMEC_ANP_MAP[nombre.trim()]) return SIMEC_ANP_MAP[nombre.trim()];
  const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  if(SIMEC_ANP_NORM_MAP[n]) return SIMEC_ANP_NORM_MAP[n];
  for(const k in SIMEC_ANP_NORM_MAP) {
    if(k===n || n.includes(k) || k.includes(n)) return SIMEC_ANP_NORM_MAP[k];
  }
  return null;
}

function crearPopupHTML(feature,colorCapa,nombreCapa,tableName){const props=feature.properties;const nombre=getFeatureName(props);const mapeo=obtenerMapeoAtributos(tableName);let entries=[];if(mapeo){const{orderedKeys,displayMap}=mapeo;for(const k of orderedKeys){if(props[k]!==undefined&&props[k]!==null&&props[k]!=='')entries.push({key:displayMap[k]||k,val:props[k]});}}else{const excl=['gid','id','fid','objectid','shape_leng','shape_area','geom','geometry'];for(const k of Object.keys(props)){if(!excl.some(ex=>k.toLowerCase().includes(ex))&&props[k]!==null&&props[k]!=='')entries.push({key:k,val:props[k]});}}let html=`<div class="popup-header" style="background:${colorCapa}"><span>${nombre}</span><span class="capa-nombre">${nombreCapa}</span></div><div class="popup-body">`;if(!entries.length)html+=`<p style="color:var(--text-muted);text-align:center;padding:0.5rem">Sin atributos</p>`;else entries.forEach(({key,val})=>html+=`<div class="attr"><span class="key">${key}</span><span class="value">${formatearValor(val)}</span></div>`);
  html+='</div>';
  // Per-ANP descargas SIG directas si es ANP
  try{
    const isAnpLayer = tableName && tableName.toLowerCase().includes('shp_anp');
    const anpNombre = getFeatureName ? getFeatureName(props) : (props.nombre || props.nom || props.NOM || '');
    if(isAnpLayer && anpNombre){
      const sigId = (typeof getSigIdForAnp==='function') ? getSigIdForAnp(anpNombre) : null;
      if(sigId){
        const shpUrl = `https://sig.conanp.gob.mx/container/data/shp/anp/${sigId}.zip`;
        const kmlUrl = `https://sig.conanp.gob.mx/container/data/kml/anp/${sigId}.kml`;
        const zonUrl = `https://sig.conanp.gob.mx/container/data/shp/zonificacion/Sub_${sigId}.zip`;
        // Incluir enlaces SIMEC si se encuentra ID
        let simecId = null;
        try{ simecId = (typeof getSimecIdForAnp==='function') ? getSimecIdForAnp(anpNombre) : null; }catch(e){}
        const fichaUrl = simecId ? `https://simec.conanp.gob.mx/ficha.php?anp=${simecId}` : null;
        const decretoUrl = simecId ? `https://simec.conanp.gob.mx/pdf_decretos/${simecId}_decreto.pdf` : null;
        html+=`<div class="popup-descargas" style="margin-top:0.7rem; padding:0.7rem 0.75rem; background:var(--bg-glass); border:1px solid var(--border-subtle); border-radius:8px;">
          <div style="font-size:0.63rem; font-weight:700; color:var(--brand-secondary); margin-bottom:0.45rem; display:flex; align-items:center; gap:0.35rem;"><i class="fas fa-download"></i> Descargas SIG por ANP · ${anpNombre}</div>
          <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
            <a href="${shpUrl}" target="_blank" rel="noopener" style="flex:1; min-width:80px; text-align:center; padding:0.38rem 0.6rem; background:linear-gradient(135deg, #6B1132, #8a1a3a); color:#fff; border-radius:999px; font-size:0.68rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:0.3rem;"><i class="fas fa-file-zipper"></i> SHP</a>
            <a href="${kmlUrl}" target="_blank" rel="noopener" style="flex:1; min-width:80px; text-align:center; padding:0.38rem 0.6rem; background:var(--bg-glass); border:1px solid var(--border-medium); color:var(--text-primary); border-radius:999px; font-size:0.68rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:0.3rem;"><i class="fas fa-map-location-dot"></i> KML</a>
            <a href="${zonUrl}" target="_blank" rel="noopener" title="Subzonificación del programa de manejo (solo ANP con programa)" style="flex:1; min-width:80px; text-align:center; padding:0.38rem 0.6rem; background:var(--bg-glass); border:1px solid var(--border-medium); color:var(--text-primary); border-radius:999px; font-size:0.60rem; font-weight:600; line-height:1.3; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:0.3rem;"><i class="fas fa-layer-group"></i> Subzonificación</a>
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.55rem;">
            ${decretoUrl ? `<a href="${decretoUrl}" target="_blank" rel="noopener" title="Decreto de creación (PDF, SIMEC)" style="flex:1; text-align:center; padding:0.32rem 0.5rem; background:linear-gradient(135deg, #6B1132, #8a1a3a); color:#fff; border-radius:999px; font-size:0.65rem; font-weight:700; text-decoration:none;"><i class="fas fa-file-pdf"></i> Decreto PDF</a>` : ``}
            ${fichaUrl ? `<a href="${fichaUrl}" target="_blank" rel="noopener" style="flex:1; text-align:center; padding:0.32rem 0.5rem; background:var(--bg-glass); border:1px solid var(--border-medium); color:var(--text-primary); border-radius:999px; font-size:0.65rem; font-weight:600; text-decoration:none;"><i class="fas fa-file-lines"></i> Ficha SIMEC</a>` : ``}
            ${fichaUrl ? `<a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener" style="flex:1; text-align:center; padding:0.32rem 0.5rem; background:var(--bg-glass); border:1px solid var(--border-medium); color:var(--text-primary); border-radius:999px; font-size:0.62rem; font-weight:600; text-decoration:none;">SIG</a>` : `<a href="https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip" target="_blank" rel="noopener" style="flex:1; text-align:center; padding:0.32rem 0.5rem; background:var(--bg-glass); border:1px solid var(--border-medium); color:var(--text-primary); border-radius:999px; font-size:0.62rem; font-weight:600; text-decoration:none;">ANP 232 ZIP</a>`}
          </div>
          <div style="font-size:0.54rem; color:var(--text-muted); margin-top:0.35rem; line-height:1.25;">Programa de manejo en la <b>Ficha SIMEC</b> · La zonificación primaria son las zonas núcleo; la subzonificación la definen los programas de manejo · <a href="https://simec.conanp.gob.mx/" target="_blank">SIMEC</a> · <a href="https://www.gob.mx/conanp/documentos/programas-de-manejo" target="_blank">Programas</a></div>
        </div>`;
      } else {
        // Fallback: ofrecer descarga nacional si no se mapeó ID
        html+=`<div class="popup-descargas" style="margin-top:0.7rem; padding:0.55rem 0.7rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.65rem; color:var(--text-muted);">Descarga nacional: <a href="https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip" target="_blank" rel="noopener">SHP ANP 232</a> · <a href="https://sig.conanp.gob.mx/container/descargas/files/kml/232-ANP_ITRF08_19162026.kmz" target="_blank" rel="noopener">KML</a> · <a href="https://sig.conanp.gob.mx/" target="_blank">SIG</a></div>`;
      }
    }
  }catch(e){ console.warn('popup per-ANP error', e); }
  return html;}

// ================================================================
// WFS
// ================================================================
async function getCapasDesdeWFS(){const disp=[];for(const nombre of CAPAS_CONOCIDAS){try{const resp=await fetch(`${GEOSERVER_BASE}service=WFS&version=1.1.0&request=GetFeature&typeName=${WORKSPACE}:${nombre}&outputFormat=application/json&maxFeatures=1`);if(resp.ok){const text=await resp.text();try{const j=JSON.parse(text);if(j.type==='FeatureCollection')disp.push(nombre);}catch(e){const r0=await fetch(`${GEOSERVER_BASE}service=WFS&version=1.1.0&request=GetFeature&typeName=${WORKSPACE}:${nombre}&outputFormat=application/json&maxFeatures=0`);if(r0.ok){const t0=await r0.text();try{const j0=JSON.parse(t0);if(j0.type==='FeatureCollection')disp.push(nombre);}catch(e2){}}}};}catch(e){}}return disp;}
async function fetchWFSGeoJSON(typeName){try{const resp=await fetch(`${GEOSERVER_BASE}service=WFS&version=1.1.0&request=GetFeature&typeName=${WORKSPACE}:${typeName}&outputFormat=application/json`);if(!resp.ok)return[];const text=await resp.text();let g;try{g=JSON.parse(text);}catch(e){return[];}if(g.type==='FeatureCollection')return g.features.map(f=>({type:'Feature',geometry:f.geometry,properties:{...f.properties}}));return[];}catch(e){return[];}}

function descargarGraficoComo(inst,format,titulo){ return descargarGraficoUnificado(inst,format,titulo); }

document.addEventListener('mousedown',function(e){
 if(e.target.closest('.btn-descarga')||e.target.closest('.btn-descarga .dropdown-menu'))return;
 document.querySelectorAll('.dropdown-download .dropdown-menu.show,.btn-descarga .dropdown-menu.show').forEach(m=>{m.classList.remove('show');m.style.position='';m.style.zIndex='';m.style.left='';m.style.right='';m.style.top='';m.style.bottom='';});
 document.querySelectorAll('.grupo-contenido').forEach(g=>g.style.overflow='');
 document.querySelectorAll('.capa-item').forEach(c=>c.style.zIndex='');
 document.querySelectorAll('.btn-descarga').forEach(b=>b.style.zIndex='');
});
document.querySelectorAll('.dropdown-download .btn-download').forEach(btn=>{btn.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();const m=this.nextElementSibling;if(m)m.classList.toggle('show');});});
document.querySelectorAll('.dropdown-download .dropdown-menu button').forEach(btn=>{btn.addEventListener('mousedown',function(e){e.stopPropagation();const format=this.dataset.format,target=this.dataset.target;const cm={dashChartTerrestre:()=>dashChartTerrestre,dashChartBarCat:()=>dashChartBarCat,dashChartBarEstados:()=>dashChartBarEstados,dashChartAdvcProp:()=>dashChartAdvcProp,dashChartPeriodoAdvc:()=>dashChartPeriodoAdvc};const inst=cm[target]?cm[target]():null;if(!inst){alert('Sin datos.');return;}let titulo='';if(target==='dashChartBarCat')titulo=document.getElementById('chart-bar-cat-title').textContent;else if(target==='dashChartBarEstados')titulo=document.getElementById('chart-hbar-estados-title').textContent;else if(target==='dashChartPeriodoAdvc')titulo='ADVC certificadas por periodo';descargarGraficoUnificado(inst,format,titulo);this.closest('.dropdown-menu').classList.remove('show');});});

document.getElementById('toggle-bar-cat').addEventListener('click',function(){this.classList.toggle('active');barCatMode=this.classList.contains('active')?'count':'area';document.getElementById('chart-bar-cat-title').textContent=barCatMode==='count'?'Conteo por categoría':'Superficie por categoría';actualizarBarCat();});
document.getElementById('toggle-hbar-estados').addEventListener('click',function(){this.classList.toggle('active');barEstadosMode=this.classList.contains('active')?'count':'area';document.getElementById('chart-hbar-estados-title').textContent=barEstadosMode==='count'?'Top estados por número ADVC':'Top estados por superficie ADVC (ha)';actualizarBarEstados();});
function actualizarBarCat(){if(!barCatData||!dashChartBarCat)return;const isC=barCatMode==='count';dashChartBarCat.data.datasets[0].data=isC?barCatData.counts:barCatData.areas;dashChartBarCat.data.datasets[0].label=isC?'Conteo':'Superficie (ha)';dashChartBarCat.update();}
function actualizarBarEstados(){if(!barEstadosData||!dashChartBarEstados)return;const isC=barEstadosMode==='count';dashChartBarEstados.data.datasets[0].data=isC?barEstadosData.counts:barEstadosData.areas;dashChartBarEstados.data.datasets[0].label=isC?'Número':'Superficie (ha)';dashChartBarEstados.update();}

function actualizarContador(){const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));let cA=0,cD=0;if(anpK)cA=getFeaturesInView(activeLayers[anpK].featuresData||[]).length;if(advcK)cD=getFeaturesInView(activeLayers[advcK].featuresData||[]).length;document.getElementById('cont-anp').textContent=cA||'0';document.getElementById('cont-advc').textContent=cD||'0';}
function getFeaturesInView(features){if(!features||!features.length)return[];const bounds=map.getBounds();return features.filter(f=>{try{return bounds.intersects(L.geoJSON(f).getBounds());}catch(e){return false;}});}

function actualizarGraficosAnp(){const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));if(!anpK){[chartAnpCount,chartAnpArea].forEach(c=>{if(c){c.data.labels=[];c.data.datasets[0].data=[];c.update();}});return;}const entry=activeLayers[anpK];const features=entry.featuresData||[];const catCol=entry.categoriaCol;const supCol=entry.superficieCol||detectarColumnaSuperficie(features);const data=getFeaturesInView(features);if(!catCol||!data.length){[chartAnpCount,chartAnpArea].forEach(c=>{if(c){c.data.labels=[];c.data.datasets[0].data=[];c.update();}});return;}const grupos={};data.forEach(f=>{const cat=f.properties[catCol];if(!cat)return;const k=String(cat).trim();if(!grupos[k])grupos[k]={count:0,area:0};grupos[k].count++;if(supCol&&typeof f.properties[supCol]==='number')grupos[k].area+=f.properties[supCol];});const labelsCount=Object.keys(grupos).sort((a,b)=>grupos[b].count-grupos[a].count);const labelsArea=Object.keys(grupos).sort((a,b)=>grupos[b].area-grupos[a].area);const labels=labelsCount;const colors=labels.map(c=>getColorPorCategoria(c));const colorsArea=labelsArea.map(c=>getColorPorCategoria(c));
if(chartAnpCount){chartAnpCount.data.labels=labels;chartAnpCount.data.datasets[0].data=labels.map(k=>grupos[k].count);chartAnpCount.data.datasets[0].backgroundColor=colors;chartAnpCount.options.plugins.tooltip={callbacks:{label:c=>`${c.parsed.y} ANP`}};chartAnpCount.update();}else{chartAnpCount=new Chart(document.getElementById('chartAnpCount').getContext('2d'),{type:'bar',data:{labels,datasets:[{label:'Número de ANP por Categoría de Manejo',data:labels.map(k=>grupos[k].count),backgroundColor:colors,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.y} ANP`}}},scales:{y:{beginAtZero:true}}}});}
if(chartAnpArea){chartAnpArea.data.labels=labelsArea;chartAnpArea.data.datasets[0].data=labelsArea.map(k=>grupos[k].area);chartAnpArea.data.datasets[0].backgroundColor=colorsArea;chartAnpArea.options.plugins.tooltip={callbacks:{label:c=>`${c.label}: ${formatearNumero(c.parsed)} ha`}};chartAnpArea.update();}else{chartAnpArea=new Chart(document.getElementById('chartAnpArea').getContext('2d'),{type:'doughnut',data:{labels:labelsArea,datasets:[{data:labelsArea.map(k=>grupos[k].area),backgroundColor:colorsArea,borderColor:'rgba(0,0,0,0.3)',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:5,font:{size:9}}},tooltip:{callbacks:{label:c=>`${c.label}: ${formatearNumero(c.parsed)} ha`}}}}});}}

function actualizarGraficoAdvc(){const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));if(!advcK){if(chartAdvc){chartAdvc.data.labels=[];chartAdvc.data.datasets[0].data=[];chartAdvc.update();}return;}const entry=activeLayers[advcK];const features=entry.featuresData||[];const data=getFeaturesInView(features);let propCol=null;if(data.length){const p=data[0].properties;for(const k of['tipo_prop','tipo_propiedad','propiedad','tenencia']){if(p[k]!==undefined){propCol=k;break;}}if(!propCol){for(const k of Object.keys(p)){if(k.toLowerCase().includes('prop')||k.toLowerCase().includes('tenencia')){propCol=k;break;}}}}if(!propCol||!data.length){if(chartAdvc){chartAdvc.data.labels=[];chartAdvc.data.datasets[0].data=[];chartAdvc.update();}return;}const grupos={};let totalSupAdvcSide=0;const supColSide=entry.superficieCol||detectarColumnaSuperficie(data)||'ha_cert';data.forEach(f=>{const v=f.properties[propCol];if(!v)return;const e=agruparPropiedad(estandarizarTipoPropietario(v));if(!grupos[e])grupos[e]={count:0,sup:0};const raw=f.properties[supColSide];const n=Number(String(raw).replace(/,/g,''));const sup=Number.isFinite(n)?n:0;grupos[e].count++;grupos[e].sup+=sup;totalSupAdvcSide+=sup;});const labels=Object.keys(grupos).sort((a,b)=>grupos[b].count-grupos[a].count);const colors=['#6F4489','#8a57c2','#a56dbd','#655CA7','#38BAB4','#FDC03D','#A77100','#E70101'];
if(chartAdvc){chartAdvc.data.labels=labels;chartAdvc.data.datasets[0].data=labels.map(k=>grupos[k].count);chartAdvc.data.datasets[0].backgroundColor=labels.map((_,i)=>colors[i%colors.length]);chartAdvc.update();}else{chartAdvc=new Chart(document.getElementById('chartAdvc').getContext('2d'),{type:'doughnut',data:{labels,datasets:[{data:labels.map(k=>grupos[k].count),backgroundColor:labels.map((_,i)=>colors[i%colors.length]),borderColor:'rgba(0,0,0,0.3)',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:5,font:{size:9}}},tooltip:{callbacks:{label:c=>{const g=grupos[c.label]||{count:0,sup:0};const pct=totalSupAdvcSide>0?(g.sup/totalSupAdvcSide*100).toFixed(1):'0.0';return c.label+': '+g.count+' ADVC, '+formatearNumero(g.sup)+' ha ('+pct+'%)';}}}}}});}}

let dashboardMoveTimeout=null;
map.on('moveend',()=>{
 if(temaActual==='general'){ actualizarGraficosAnp(); actualizarContador(); }
 else if(temaActual==='advc'){ actualizarGraficoAdvc(); actualizarContador(); }
 else if(temaActual==='dashboard'){
  clearTimeout(dashboardMoveTimeout);
  dashboardMoveTimeout=setTimeout(()=> actualizarDashboard(), 280);
 }
});

// ================================================================
// USER UPLOAD
// ================================================================
document.getElementById('btnCargarCapa').addEventListener('click',()=>document.getElementById('inputCargarCapa').click());
document.getElementById('inputCargarCapa').addEventListener('change',async e=>{
 const files=e.target.files;if(!files.length)return;
 const statusDiv=document.getElementById('status');statusDiv.textContent='⏳ Procesando…';statusDiv.className='';
 for(const file of files){
  try{
   const base=file.name.replace(/\.[^.]+$/,'');let geojson;
   if(file.name.endsWith('.geojson')||file.name.endsWith('.json')){const d=JSON.parse(await file.text());if(d.type==='FeatureCollection')geojson=d;else throw new Error('No es FeatureCollection.');}
   else if(file.name.endsWith('.kml'))geojson=convertirKMLaGeoJSON(await file.text());
   else if(file.name.endsWith('.zip')){const d=await shp(await file.arrayBuffer());if(d&&d.features)geojson=d;else throw new Error('ZIP sin shapefile.');}
   else{statusDiv.textContent=`⚠️ Formato no soportado: ${file.name}`;statusDiv.className='warning';continue;}
   if(!geojson.features||!geojson.features.length)throw new Error('Sin elementos.');
   const tableName=`usuario_${++userLayerCounter}`;
   const nombreInicial=`Carga: ${base}`;const colorInicial=generarColorAleatorio();
   const hexColor=colorInicial.startsWith('hsl')?hslToHex(colorInicial):colorInicial;
   const gtInit=geojson.features[0]?.geometry?.type||'';
   const symbology={pointColor:hexColor, pointRadius:6, pointOpacity:0.9, pointShape:'circle', lineColor:hexColor, lineWeight:3, lineDash:null, lineOpacity:0.85, polyColor:hexColor, polyFillColor:hexColor, polyWeight:2, polyOpacity:0.85, polyFillOpacity:0.42, polyFillType:'full'};
   let layer;
   if(gtInit.includes('Point')){
    layer=L.geoJSON(geojson.features,{pointToLayer:(f,ll)=>createPointMarker(ll,symbology), onEachFeature:(f,l)=>l.bindPopup(crearPopupHTML(f,hexColor,nombreInicial,tableName),{className:'custom-popup'})}).addTo(map);
   } else {
    layer=L.geoJSON(geojson.features,{style:{color:hexColor,fillColor:hexColor,fillOpacity:0.42,weight:2,opacity:0.85},onEachFeature:(f,l)=>l.bindPopup(crearPopupHTML(f,hexColor,nombreInicial,tableName),{className:'custom-popup'})}).addTo(map);
   }
   activeLayers[tableName]={layer,color:hexColor,opacity:1,geomType:gtInit,featuresData:geojson.features,categoriaCol:null,superficieCol:null,userColor:hexColor,userName:nombreInicial,symbology};
   geojson.features.forEach(f=>allFeaturesForSearch.push({feature:f,layer,capaNombre:nombreInicial,color:hexColor,capaNombreTecnico:tableName}));
   try{const bounds=layer.getBounds();if(bounds.isValid())map.fitBounds(bounds);}catch(e){}
   agregarCapaUsuarioALista(tableName,nombreInicial,hexColor,gtInit);
   statusDiv.textContent=`✅ "${nombreInicial}" cargada (${geojson.features.length} elementos).`;statusDiv.className='success';actualizarLeyenda();
   setTimeout(()=>{
    actualizarSelectoresAnalisis();
    const sel=document.getElementById('analisis-fuente');
    const selDest=document.getElementById('analisis-destino');
    if(sel){
     const hasOpt=[...sel.options].some(o=>o.value===tableName);
     if(hasOpt) sel.value=tableName;
     else if(sel.options.length>1) sel.selectedIndex=1;
     if(selDest && !selDest.value){
      for(let i=1;i<selDest.options.length;i++){ if(selDest.options[i].value && !selDest.options[i].disabled){ selDest.value=selDest.options[i].value; break; } }
     }
     if(typeof validarBtnAnalizar==='function') validarBtnAnalizar();
     const panel=document.getElementById('analisis-panel');
     if(panel){
      panel.style.display='flex';
      panel.classList.add('analisis-highlight');
      setTimeout(()=>panel.classList.remove('analisis-highlight'), 2200);
      try{ panel.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}
      const btn=document.getElementById('btn-ejecutar-analisis');
      if(btn && !btn.disabled){ btn.style.transform='scale(1.04)'; setTimeout(()=>btn.style.transform='', 600); }
     }
    }
   }, 150);
  }catch(err){statusDiv.textContent=`❌ ${err.message}`;statusDiv.className='error';}
 }
 e.target.value='';actualizarContador();
});

function agregarCapaUsuarioALista(tableName,nombreInicial,colorInicial,geomType){
 const listContainer=document.getElementById('list-container');
 let grupoDiv=listContainer.querySelector('.grupo[data-grupo="usuario"]');
 if(!grupoDiv){grupoDiv=document.createElement('div');grupoDiv.className='grupo';grupoDiv.dataset.grupo='usuario';const titulo=document.createElement('div');titulo.className='grupo-titulo';titulo.innerHTML=`<span class="grupo-nombre"><i class="fas fa-folder-open"></i> Usuario</span><span class="flecha abierto"><i class="fas fa-chevron-down"></i></span>`;const contenido=document.createElement('div');contenido.className='grupo-contenido';let ab=true;titulo.addEventListener('click',()=>{ab=!ab;contenido.classList.toggle('cerrado',!ab);titulo.querySelector('.flecha').classList.toggle('abierto',ab);});grupoDiv.appendChild(titulo);grupoDiv.appendChild(contenido);listContainer.appendChild(grupoDiv);}
 const contenido=grupoDiv.querySelector('.grupo-contenido');
 const div=document.createElement('div');div.className='capa-item';div.dataset.tema='general';div.dataset.table=tableName;div.style.borderLeftColor=colorInicial;
 const gt=geomType||'';
  div.innerHTML=`<div class="capa-header"><input type="checkbox" checked id="chk-${tableName}" data-table="${tableName}"><span class="icono">${gt.includes('Point')?'<i class="fas fa-map-pin"></i>':gt.includes('Line')?'<i class="fas fa-route"></i>':'<i class="fas fa-draw-polygon"></i>'}</span><span class="nombre" title="${tableName}">${nombreInicial}</span><button class="btn-info" data-table="${tableName}" title="Ver metadatos"><i class="fas fa-circle-info"></i></button><button class="btn-rename" title="Editar nombre" aria-label="Renombrar capa ${tableName}"><i class="fas fa-pen"></i></button><button class="btn-zoom" title="Zoom a capa (o México si no hay)" data-zoom="${tableName}" aria-label="Zoom a capa ${tableName}"><i class="fas fa-crosshairs"></i></button><button class="btn-label" data-table="${tableName}" title="Etiqueta por atributo" aria-label="Etiqueta ${tableName}"><i class="fas fa-tag"></i></button><button class="btn-filtro" title="Filtrar por atributo" aria-label="Filtrar capa ${tableName}"><i class="fas fa-filter"></i></button><div class="btn-descarga" role="button" tabindex="0" aria-label="Descargar capa ${tableName}"><i class="fas fa-download"></i><div class="dropdown-menu"><button data-format="geojson">GeoJSON</button><button data-format="csv">CSV</button><button data-format="kml" style="display:none" disabled>KML</button><button data-format="shp">Shapefile</button></div></div><button class="btn-delete" title="Eliminar capa" aria-label="Eliminar capa ${tableName}"><i class="fas fa-trash"></i></button></div><div class="capa-controls capa-controls-global" style="display:none"><label>Opac.</label><input type="range" min="0" max="100" value="100" data-table="${tableName}"><span class="opacity-value">100%</span></div><button class="btn-symbology" data-table="${tableName}" aria-label="Simbología ${tableName}"><i class="fas fa-palette"></i> Simbología</button><div class="symbology-editor" id="symb-${tableName}"></div><div class="query-filtro" id="query-${tableName}"><label>Atributo</label><select data-q="attr"><option value="">— Selecciona atributo —</option></select><label>Valor</label><select data-q="val" disabled><option value="">— Primero elige atributo —</option></select><div class="query-filtro-btns"><button data-q="aplicar" class="primary">Aplicar + zoom</button><button data-q="limpiar">Limpiar</button></div><div class="query-info" data-q="info"></div></div>`;
 const checkbox=div.querySelector('input[type="checkbox"]');const slider=div.querySelector('input[type="range"]');const opVal=div.querySelector('.opacity-value');const btnDelete=div.querySelector('.btn-delete');wireFiltroCapa(div,tableName,nombreInicial);
 checkbox.addEventListener('change',function(){const t=this.dataset.table;if(this.checked){if(activeLayers[t])activeLayers[t].layer.addTo(map);}else{if(activeLayers[t])map.removeLayer(activeLayers[t].layer);}actualizarLeyenda();});
  slider.addEventListener('input',function(){const val=parseInt(this.value);opVal.textContent=val+'%';const entry=activeLayers[this.dataset.table];if(!entry)return;const opacity=val/100;entry.opacity=opacity;if(entry.symbology){
    const s=entry.symbology; const gt=entry.geomType||'';
    if(gt.includes('Point')) s.pointOpacity=opacity; else if(gt.includes('Line')) s.lineOpacity=opacity; else {s.polyOpacity=opacity; s.polyFillOpacity=opacity*0.5;}
    const ed=document.getElementById('symb-'+this.dataset.table);
    if(ed){
     const field=gt.includes('Point')?'pointOpacity':gt.includes('Line')?'lineOpacity':'polyOpacity';
     const inp=ed.querySelector(`input[data-field="${field}"]`);
     if(inp){ inp.value=Math.round(opacity*100); const vv=inp.nextElementSibling; if(vv&&vv.classList.contains('symb-val')) vv.textContent=Math.round(opacity*100)+'%'; }
     if(!gt.includes('Point')&&!gt.includes('Line')){
      const fi=ed.querySelector('input[data-field="polyFillOpacity"]');
      if(fi){ fi.value=Math.round(opacity*50); const vv2=fi.nextElementSibling; if(vv2) vv2.textContent=Math.round(opacity*50)+'%'; }
     }
    }
    refreshUserLayer(this.dataset.table); return;
   }entry.layer.eachLayer(sub=>{if(sub.setStyle)sub.setStyle(entry.geomType.includes('Point')?{fillOpacity:opacity,opacity}:entry.geomType.includes('Line')?{opacity}:{fillOpacity:opacity*0.5,opacity});});});
 btnDelete.addEventListener('click',e=>{
  e.stopPropagation();
  const t=div.dataset.table;
  const entry=activeLayers[t];
  const nombre=entry? entry.userName : t;
  if(!confirm(`¿Eliminar la capa "${nombre}"? Esta acción no se puede deshacer.`)) return;
  try{
   if(entry && entry.layer){
    try{ map.removeLayer(entry.layer); }catch(err){}
    try{ if(drawnItems.hasLayer(entry.layer)) drawnItems.removeLayer(entry.layer); }catch(err){}
    try{ entry.layer.eachLayer(sub=>{ try{ if(drawnItems.hasLayer(sub)) drawnItems.removeLayer(sub); }catch(err){} }); }catch(err){}
   }
  }catch(err){}
  allFeaturesForSearch=allFeaturesForSearch.filter(it=>it.capaNombreTecnico!==t);
  delete activeLayers[t];
  div.remove();
  if(ultimoAnalisis && (ultimoAnalisis.fuenteKey===t || ultimoAnalisis.destinoKey===t)){
   ultimoAnalisis=null;
   if(analisisLayer){ try{ map.removeLayer(analisisLayer); }catch(err){} analisisLayer=null; }
   if(analisisOverlay && analisisOverlay.classList.contains('active')){ analisisOverlay.classList.remove('active'); document.body.style.overflow=''; }
  }
  actualizarLeyenda();
  actualizarContador();
  actualizarSelectoresAnalisis();
  const statusDiv=document.getElementById('status');
  if(statusDiv){ statusDiv.textContent=`🗑️ Capa "${nombre}" eliminada.`; statusDiv.className=''; }
 });
  const btnZoom=div.querySelector('.btn-zoom');
  btnZoom.addEventListener('click',e=>{e.stopPropagation(); zoomToLayerOrMexico(div.dataset.table);});
  const btnDescU=div.querySelector('.btn-descarga');
  if(btnDescU){
   btnDescU.addEventListener('mousedown',function(e){ e.preventDefault(); e.stopPropagation(); const dm=this.querySelector('.dropdown-menu'); const wasOpen=dm.classList.contains('show'); document.querySelectorAll('.btn-descarga .dropdown-menu.show').forEach(m=>m.classList.remove('show')); document.querySelectorAll('.grupo-contenido').forEach(g=>g.style.overflow=''); if(!wasOpen){ dm.classList.add('show'); const grupo=this.closest('.grupo-contenido'); if(grupo) grupo.style.overflow='visible'; this.closest('.capa-item').style.zIndex='50'; dm.style.zIndex='100';}});
   btnDescU.querySelectorAll('.dropdown-menu button').forEach(btn=>{ btn.addEventListener('mousedown',e=>{ e.stopPropagation(); const f=btn.dataset.format,t=btn.closest('.capa-item').dataset.table; if(typeof descargarCapa==='function') descargarCapa(t,f); else { if(f==='geojson') descargarGeoJSON(t); else if(f==='csv'){ const entry=activeLayers[t]; if(entry) descargarCapa(t,'csv'); } } const dm=btn.closest('.dropdown-menu'); dm.classList.remove('show'); document.querySelectorAll('.grupo-contenido').forEach(g=>g.style.overflow=''); document.querySelectorAll('.capa-item').forEach(c=>c.style.zIndex=''); }); });
  }
 const symbEditor=div.querySelector(`#symb-${tableName}`);
 const symbEntry=activeLayers[tableName]; const ss=symbEntry.symbology;
 const safeName=nombreInicial.replace(/"/g,'&quot;');
 let edHtml=`<div class="symb-row"><label>Nombre</label><input type="text" value="${safeName}" data-field="userName" placeholder="Nombre de la capa"></div>`;
 if(gt.includes('Point')){
  edHtml+=`<div class="symb-row"><label>Color</label><input type="color" value="${ss.pointColor}" data-field="pointColor"><label>Forma</label><select data-field="pointShape"><option value="circle" ${ss.pointShape==='circle'?'selected':''}>Círculo</option><option value="square" ${ss.pointShape==='square'?'selected':''}>Cuadrado</option><option value="diamond" ${ss.pointShape==='diamond'?'selected':''}>Rombo</option><option value="triangle" ${ss.pointShape==='triangle'?'selected':''}>Triángulo</option></select></div><div class="symb-row"><label>Tamaño</label><input type="range" min="4" max="18" value="${ss.pointRadius}" data-field="pointRadius"><span class="symb-val">${ss.pointRadius}px</span><label>Opac.</label><input type="range" min="0" max="100" value="${Math.round(ss.pointOpacity*100)}" data-field="pointOpacity"><span class="symb-val">${Math.round(ss.pointOpacity*100)}%</span></div>`;
 } else if(gt.includes('Line')){
  edHtml+=`<div class="symb-row"><label>Color</label><input type="color" value="${ss.lineColor}" data-field="lineColor"><label>Grosor</label><input type="range" min="1" max="8" value="${ss.lineWeight}" data-field="lineWeight"><span class="symb-val">${ss.lineWeight}px</span></div><div class="symb-row"><label>Tipo</label><select data-field="lineDash"><option value="" ${!ss.lineDash?'selected':''}>Sólida</option><option value="6,4" ${ss.lineDash==='6,4'?'selected':''}>Discontinua</option><option value="2,6" ${ss.lineDash==='2,6'?'selected':''}>Punteada</option><option value="8,4,2,4" ${ss.lineDash==='8,4,2,4'?'selected':''}>Mixta</option></select><label>Opac.</label><input type="range" min="0" max="100" value="${Math.round(ss.lineOpacity*100)}" data-field="lineOpacity"><span class="symb-val">${Math.round(ss.lineOpacity*100)}%</span></div>`;
 } else {
  edHtml+=`<div class="symb-row"><label>Borde</label><input type="color" value="${ss.polyColor}" data-field="polyColor"><label>Relleno</label><input type="color" value="${ss.polyFillColor}" data-field="polyFillColor"><label>Grosor</label><input type="range" min="1" max="6" value="${ss.polyWeight}" data-field="polyWeight"><span class="symb-val">${ss.polyWeight}px</span></div><div class="symb-row"><label>Tipo</label><select data-field="polyFillType"><option value="full" ${ss.polyFillType==='full'?'selected':''}>Completo</option><option value="hashed" ${ss.polyFillType==='hashed'?'selected':''}>Ashurado</option><option value="line" ${ss.polyFillType==='line'?'selected':''}>Líneas</option><option value="grid" ${ss.polyFillType==='grid'?'selected':''}>Reja</option></select><label>Opac. relleno</label><input type="range" min="0" max="100" value="${Math.round(ss.polyFillOpacity*100)}" data-field="polyFillOpacity"><span class="symb-val">${Math.round(ss.polyFillOpacity*100)}%</span></div><div class="symb-row"><label>Opac. borde</label><input type="range" min="0" max="100" value="${Math.round(ss.polyOpacity*100)}" data-field="polyOpacity"><span class="symb-val">${Math.round(ss.polyOpacity*100)}%</span></div>`;
 }
 symbEditor.innerHTML=edHtml;
 const btnSymb=div.querySelector('.btn-symbology');
 btnSymb.addEventListener('click',()=>{symbEditor.classList.toggle('open'); btnSymb.classList.toggle('active');});
 symbEditor.querySelectorAll('input,select').forEach(ctrl=>{
  const ev=ctrl.type==='color'||ctrl.tagName==='SELECT'?'change':'input';
  if(ctrl.dataset.field==='userName') return;
  ctrl.addEventListener(ev,()=>{
   const field=ctrl.dataset.field; let val=ctrl.value;
   if(['pointRadius','lineWeight','polyWeight'].includes(field)) val=parseInt(val);
   else if(['pointOpacity','lineOpacity','polyOpacity','polyFillOpacity'].includes(field)) val=parseInt(val)/100;
   else if(field==='lineDash' && val==='') val=null;
   ss[field]=val;
   const valSpan=ctrl.nextElementSibling;
   if(valSpan && valSpan.classList.contains('symb-val')){
    if(field.includes('Radius')||field.includes('Weight')) valSpan.textContent=val+'px';
    else if(field.includes('Opacity')) valSpan.textContent=Math.round(val*100)+'%';
   }
   refreshUserLayer(tableName);
  });
 });
 const nameInput=symbEditor.querySelector('input[data-field="userName"]');
 if(nameInput){
  nameInput.addEventListener('change',()=>{ const nn=nameInput.value.trim()||nombreInicial; doRename(nn); nameInput.value=nn; });
  nameInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); nameInput.blur(); }});
 }
 function doRename(newName){
  const nn=newName.trim()||nombreInicial;
  const entry=activeLayers[tableName]; if(!entry) return;
  entry.userName=nn;
  const nombreEl=div.querySelector('.nombre'); if(nombreEl){ nombreEl.textContent=nn; nombreEl.title=nn; }
  if(nameInput && nameInput.value!==nn) nameInput.value=nn;
  allFeaturesForSearch.forEach(it=>{ if(it.capaNombreTecnico===tableName) it.capaNombre=nn; });
  const s=entry.symbology;
  let popupColor='#6B1132';
  if(entry.geomType.includes('Point')) popupColor=s.pointColor;
  else if(entry.geomType.includes('Line')) popupColor=s.lineColor;
  else popupColor=s.polyFillColor;
  entry.layer.eachLayer(sub=>{ if(sub.getPopup&&sub.feature) sub.bindPopup(crearPopupHTML(sub.feature, popupColor, nn, tableName),{className:'custom-popup'}); });
  actualizarLeyenda();
 }
 const btnRename=div.querySelector('.btn-rename');
 const nombreEl=div.querySelector('.nombre');
 function startRename(){
  const cur=activeLayers[tableName]?.userName||nombreEl.textContent;
  const inp=document.createElement('input'); inp.type='text'; inp.value=cur; inp.className='nombre-input'; inp.maxLength=60;
  nombreEl.replaceWith(inp); inp.focus(); inp.select();
  const finish=(save)=>{ const nn=save? inp.value.trim() : cur; const out=nn||cur; const span=document.createElement('span'); span.className='nombre'; span.textContent=out; span.title=tableName; span.addEventListener('click', startRename); inp.replaceWith(span); if(save && out!==cur) doRename(out); };
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') finish(true); else if(e.key==='Escape') finish(false); });
  inp.addEventListener('blur',()=>finish(true));
 }
 btnRename.addEventListener('click', startRename);
 nombreEl.style.cursor='pointer'; nombreEl.title='Clic para editar nombre'; nombreEl.addEventListener('click', startRename);
 contenido.appendChild(div);
}

function convertirKMLaGeoJSON(kmlText){const xml=new DOMParser().parseFromString(kmlText,'text/xml');const placemarks=xml.getElementsByTagName('Placemark');const features=[];for(let i=0;i<placemarks.length;i++){const pm=placemarks[i];const name=pm.getElementsByTagName('name')[0]?.textContent||'Sin nombre';const coordsElem=pm.getElementsByTagName('coordinates')[0];if(!coordsElem)continue;const coords=coordsElem.textContent.trim().split(/\s+/).map(p=>{const pts=p.split(',').map(Number);return[pts[0],pts[1]];});let geometry;if(coords.length===1)geometry={type:'Point',coordinates:coords[0]};else if(coords.length>1)geometry={type:'Polygon',coordinates:[coords]};else continue;features.push({type:'Feature',geometry,properties:{nombre:name}});}return{type:'FeatureCollection',features};}
function generarColorAleatorio(){return`hsl(${Math.floor(Math.random()*360)},70%,55%)`;}
function hslToHex(hsl){const m=hsl.match(/hsl\((\d+),(\d+)%,(\d+)%\)/);if(!m)return'#6B1132';let h=+m[1]/360,s=+m[2]/100,l=+m[3]/100;const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};const r=Math.round(hue2rgb(p,q,h+1/3)*255),g=Math.round(hue2rgb(p,q,h)*255),b=Math.round(hue2rgb(p,q,h-1/3)*255);return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return {r,g,b};}
function getOrCreatePattern(type,color){
 const cid=color.replace(/[^a-zA-Z0-9]/g,'');
 const id=`pat-${type}-${cid}`;
 if(document.getElementById(id)) return `url(#${id})`;
 let svg=map.getPane('overlayPane')?.querySelector('svg');
 if(!svg) svg=document.querySelector('.leaflet-overlay-pane svg')||document.querySelector('svg.leaflet-zoom-animated');
 if(!svg) return color;
 let defs=svg.querySelector('defs'); if(!defs){defs=document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.insertBefore(defs, svg.firstChild);}
 const pat=document.createElementNS('http://www.w3.org/2000/svg','pattern');
 pat.setAttribute('id',id); pat.setAttribute('width','8'); pat.setAttribute('height','8'); pat.setAttribute('patternUnits','userSpaceOnUse');
 if(type==='hashed') pat.setAttribute('patternTransform','rotate(45)');
 const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
 bg.setAttribute('width','8'); bg.setAttribute('height','8'); bg.setAttribute('fill','transparent');
 pat.appendChild(bg);
 if(type==='hashed' || type==='grid'){
  const l1=document.createElementNS('http://www.w3.org/2000/svg','line');
  l1.setAttribute('x1','0'); l1.setAttribute('y1','0'); l1.setAttribute('x2','0'); l1.setAttribute('y2','8'); l1.setAttribute('stroke',color); l1.setAttribute('stroke-width','1.2'); l1.setAttribute('opacity','0.85');
  pat.appendChild(l1);
 }
 if(type==='line' || type==='grid'){
  const l2=document.createElementNS('http://www.w3.org/2000/svg','line');
  l2.setAttribute('x1','0'); l2.setAttribute('y1','4'); l2.setAttribute('x2','8'); l2.setAttribute('y2','4'); l2.setAttribute('stroke',color); l2.setAttribute('stroke-width','1.2'); l2.setAttribute('opacity','0.85');
  pat.appendChild(l2);
 }
 if(type==='grid'){
  const l3=document.createElementNS('http://www.w3.org/2000/svg','line');
  l3.setAttribute('x1','4'); l3.setAttribute('y1','0'); l3.setAttribute('x2','4'); l3.setAttribute('y2','8'); l3.setAttribute('stroke',color); l3.setAttribute('stroke-width','1.2'); l3.setAttribute('opacity','0.85');
  pat.appendChild(l3);
 }
 defs.appendChild(pat);
 return `url(#${id})`;
}
function applyPolygonPattern(layerGroup, type, color){
 if(type==='full'){layerGroup.eachLayer(sub=>{const el=sub.getElement&&sub.getElement(); if(el) el.setAttribute('fill', color);}); return;}
 const url=getOrCreatePattern(type, color);
 layerGroup.eachLayer(sub=>{
  const el=sub.getElement&&sub.getElement();
  if(el){ el.setAttribute('fill', url); }
 });
}
function createPointMarker(latlng, symb){
 const c=symb.pointColor, r=symb.pointRadius, o=symb.pointOpacity, s=symb.pointShape;
 if(s==='circle') return L.circleMarker(latlng,{radius:r, fillColor:c, color:c, weight:1, fillOpacity:o, opacity:o});
 const sz=r*2;
 let html='';
 if(s==='square') html=`<div style="width:${sz}px;height:${sz}px;background:${c};opacity:${o};border:1.2px solid ${c};box-sizing:border-box;"></div>`;
 else if(s==='diamond') html=`<div style="width:${sz}px;height:${sz}px;background:${c};opacity:${o};border:1.2px solid ${c};transform:rotate(45deg);box-sizing:border-box;"></div>`;
 else if(s==='triangle') html=`<div style="width:0;height:0;border-left:${r}px solid transparent;border-right:${r}px solid transparent;border-bottom:${sz}px solid ${c};opacity:${o};filter:drop-shadow(0 0 0 ${c});"></div>`;
 else html=`<div style="width:${sz}px;height:${sz}px;background:${c};border-radius:50%;opacity:${o};border:1px solid ${c};box-sizing:border-box;"></div>`;
 const anchor=s==='triangle'?[r, sz]:[sz/2, sz/2];
 return L.marker(latlng,{icon:L.divIcon({className:'', html, iconSize:[sz,sz], iconAnchor:anchor}), opacity:o});
}
function refreshUserLayer(table){
 const entry=activeLayers[table]; if(!entry) return;
 const gt=entry.geomType||'';
 const s=entry.symbology;
 if(gt.includes('Point')){
  const isVisible=map.hasLayer(entry.layer);
  if(isVisible) map.removeLayer(entry.layer);
  entry.layer=L.geoJSON(entry.featuresData,{pointToLayer:(f,ll)=>createPointMarker(ll,s), onEachFeature:(f,l)=>l.bindPopup(crearPopupHTML(f,s.pointColor,entry.userName,table),{className:'custom-popup'})});
  if(isVisible) entry.layer.addTo(map);
  entry.userColor=s.pointColor;
  divBorderUpdate(table,s.pointColor);
 } else if(gt.includes('Line')){
  entry.layer.eachLayer(sub=>{if(sub.setStyle) sub.setStyle({color:s.lineColor, weight:s.lineWeight, opacity:s.lineOpacity, dashArray:s.lineDash});});
  entry.userColor=s.lineColor;
  divBorderUpdate(table,s.lineColor);
 } else {
  entry.layer.eachLayer(sub=>{if(sub.setStyle) sub.setStyle({color:s.polyColor, fillColor:s.polyFillColor, weight:s.polyWeight, opacity:s.polyOpacity, fillOpacity:s.polyFillOpacity, dashArray:null});});
  entry.userColor=s.polyFillColor;
  divBorderUpdate(table,s.polyFillColor);
  if(s.polyFillType!=='full') setTimeout(()=>applyPolygonPattern(entry.layer,s.polyFillType,s.polyFillColor),40);
 }
 actualizarLeyenda();
}
function divBorderUpdate(table,color){const el=document.querySelector(`.capa-item[data-table="${table}"]`); if(el) el.style.borderLeftColor=color;}
function zoomToLayer(table){
 const entry=activeLayers[table];
 if(entry && entry.layer){
  try{
   const b=entry.layer.getBounds();
   if(b && b.isValid()){ map.fitBounds(b,{padding:[24,24], maxZoom:14}); return; }
  }catch(e){}
  try{
   const f=entry.featuresData||[];
   if(f.length){ const b=L.geoJSON({type:'FeatureCollection', features:f}).getBounds(); if(b.isValid()){ map.fitBounds(b,{padding:[24,24], maxZoom:14}); return; } }
  }catch(e){}
  return;
 }
 const chk=document.getElementById(`chk-${table}`);
 if(chk && !chk.checked){
  chk.checked=true; chk.dispatchEvent(new Event('change'));
  const statusDiv=document.getElementById('status');
  if(statusDiv) statusDiv.textContent='⏳ Cargando para hacer zoom…';
  let tries=0;
  const iv=setInterval(()=>{
   tries++;
   const e2=activeLayers[table];
   if(e2 && e2.layer){
    clearInterval(iv);
    try{ const b=e2.layer.getBounds(); if(b.isValid()) map.fitBounds(b,{padding:[24,24], maxZoom:14}); }catch(e){}
   } else if(tries>30){ clearInterval(iv); }
  },300);
 }
}

// ================================================================
// LEGEND
// ================================================================
function actualizarLeyenda(){const leyendaDiv=document.getElementById('leyenda');const keys=Object.keys(activeLayers);if(!keys.length){leyendaDiv.style.display='none';return;}const bounds=map.getBounds();const minLey=leyendaDiv.classList.contains('minimizada');let html=`<div class="leyenda-titulo"><span>Capas visibles</span><button class="leyenda-toggle" id="leyenda-toggle" title="Minimizar/visualizar simbología" aria-label="Minimizar o mostrar simbología" aria-expanded="${minLey?'false':'true'}"><i class="fas ${minLey?'fa-chevron-down':'fa-chevron-up'}"></i></button></div><div class="leyenda-cols">`;let tieneItems=false;keys.forEach(key=>{const entry=activeLayers[key];const features=entry.featuresData||[];let visible=false,categorias=null;if(esCapaAnpPrincipal(key)&&entry.categoriaCol){const catMap=new Map();features.forEach(f=>{try{if(bounds.intersects(L.geoJSON(f).getBounds())){const v=f.properties[entry.categoriaCol];if(v&&v!=='null'){catMap.set(getNombreCompleto(v),getColorPorCategoria(v));visible=true;}}}catch(e){}});if(catMap.size>0)categorias=catMap;}else{features.forEach(f=>{try{if(bounds.intersects(L.geoJSON(f).getBounds()))visible=true;}catch(e){}});}if(!visible&&!categorias)return;tieneItems=true;const nombre=entry.userName||getNombreAmigable(key);const color=entry.userColor||entry.color||'#ccc';if(categorias){html+=`<div class="leyenda-item" style="font-weight:600;font-size:0.6rem;color:var(--text-secondary);margin-top:0.28rem">${nombre}</div>`;Array.from(categorias.entries()).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([n,c])=>{html+=`<div class="leyenda-item leyenda-sub"><span class="leyenda-color" style="background:${c}"></span><span class="leyenda-label">${n}</span></div>`;});}else{
   let swatch='';
   if(entry.symbology){
    const s=entry.symbology; const gt=entry.geomType||'';
    if(gt.includes('Point')){
     const c=s.pointColor, r=Math.min(12,Math.max(6,s.pointRadius||6)), o=s.pointOpacity, sh=s.pointShape;
     if(sh==='circle') swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;border-radius:50%;opacity:${o}"></span>`;
     else if(sh==='square') swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;opacity:${o}"></span>`;
     else if(sh==='diamond') swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;opacity:${o};transform:rotate(45deg)"></span>`;
     else if(sh==='triangle') swatch=`<span style="width:0;height:0;border-left:${r/2}px solid transparent;border-right:${r/2}px solid transparent;border-bottom:${r}px solid ${c};opacity:${o};display:inline-block;flex-shrink:0"></span>`;
     else swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;border-radius:50%;opacity:${o}"></span>`;
    } else if(gt.includes('Line')){
     const c=s.lineColor, w=s.lineWeight, o=s.lineOpacity, d=s.lineDash;
     let bg=c; if(d==='6,4') bg=`repeating-linear-gradient(90deg,${c} 0 4px, transparent 4px 8px)`;
     else if(d==='2,6') bg=`repeating-linear-gradient(90deg,${c} 0 2px, transparent 2px 6px)`;
     else if(d==='8,4,2,4') bg=`repeating-linear-gradient(90deg,${c} 0 6px, transparent 6px 10px)`;
     swatch=`<span class="leyenda-color" style="background:${bg};background-color:${c};height:${Math.min(w,6)}px;opacity:${o};min-width:16px"></span>`;
    } else {
     const c=s.polyFillColor, bc=s.polyColor, ft=s.polyFillType, fo=s.polyFillOpacity;
     let bg=c;
     if(ft==='hashed') bg=`repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 6px)`;
     else if(ft==='line') bg=`repeating-linear-gradient(0deg, ${c} 0 2px, transparent 2px 6px)`;
     else if(ft==='grid') bg=`repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, ${c} 0 1px, transparent 1px 6px)`;
     swatch=`<span class="leyenda-color" style="background:${bg};background-color:${c};opacity:${fo};border:1.5px solid ${bc};width:16px;height:12px"></span>`;
    }
   } else swatch=`<span class="leyenda-color" style="background:${color}"></span>`;
   html+=`<div class="leyenda-item">${swatch}<span class="leyenda-label">${nombre}</span></div>`;
  }});if(!tieneItems){leyendaDiv.style.display='none';return;}leyendaDiv.innerHTML=html+'</div>';leyendaDiv.classList.toggle('dos-col',leyendaDiv.querySelectorAll('.leyenda-item').length>8);leyendaDiv.style.display='block';}
function leyendaHtmlLimpio(){try{var src=document.getElementById('leyenda');if(!src||!src.innerHTML.trim())return null;var tmp=document.createElement('div');tmp.innerHTML=src.innerHTML;var btns=tmp.querySelectorAll('.leyenda-toggle');for(var i=0;i<btns.length;i++){btns[i].remove();}return tmp.innerHTML;}catch(e){return null;}}
document.addEventListener('click',function(e){try{var t=e.target&&e.target.closest?e.target.closest('#leyenda-toggle'):null;if(!t)return;e.preventDefault();e.stopPropagation();var box=document.getElementById('leyenda');if(!box)return;var min=box.classList.toggle('minimizada');t.setAttribute('aria-expanded',min?'false':'true');var ic=t.querySelector('i');if(ic)ic.className=min?'fas fa-chevron-down':'fas fa-chevron-up';}catch(err){}});
try{document.getElementById('btn-colapsar-simbologia')?.addEventListener('click',function(){try{var card=document.getElementById('dashboard-leyenda-card');if(!card)return;var col=card.classList.toggle('colapsada');this.setAttribute('aria-expanded',col?'false':'true');var ic=this.querySelector('i');if(ic)ic.className=col?'fas fa-chevron-down':'fas fa-chevron-up';}catch(err){}});}catch(e){}

// ================================================================
// DASHBOARD
// ================================================================
function animateKPI(id,value){const el=document.getElementById(id);if(!el)return;el.style.opacity='0';el.style.transform='translateY(5px)';setTimeout(()=>{el.textContent=value;el.style.opacity='1';el.style.transform='translateY(0)';try{scheduleAutoFitKpi();}catch(e){}},120);}
// auto-ajuste del tamaño de texto de los KPIs al ancho/alto disponible
function autoFitKpiText(scopeEl){
 const els=(scopeEl&&scopeEl.classList&&scopeEl.classList.contains('kpi-value'))?[scopeEl]:[...document.querySelectorAll('#dashboard-container .kpi-value')];
 els.forEach(el=>{
  if(!el||!el.isConnected) return;
  el.style.fontSize='';
  let size=parseFloat(getComputedStyle(el).fontSize)||16;
  let guard=24;
  while(guard-->0&&size>10&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)){ size-=1; el.style.fontSize=size+'px'; }
 });
}
let kpiFitT=null;
function scheduleAutoFitKpi(){
 clearTimeout(kpiFitT);
 kpiFitT=setTimeout(()=>autoFitKpiTextStable(0),350);
}
// Mide solo cuando el layout deja de moverse; si sigue cambiando, reintenta (máx 4)
function autoFitKpiTextStable(attempt){
 const els=[...document.querySelectorAll('#dashboard-container .kpi-value')];
 if(!els.length) return;
 if(document.getElementById('dashboard-container').style.display==='none') return;
 els.forEach(el=>{ el.style.fontSize=''; });
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const w0=els.map(el=>el.clientWidth);
  setTimeout(()=>{
   const stable=els.every((el,i)=>Math.abs(el.clientWidth-w0[i])<=1);
   if(!stable&&attempt<4){ autoFitKpiTextStable(attempt+1); return; }
   autoFitKpiText();
  },120);
 }));
}
window.addEventListener('resize',()=>{ scheduleAutoFitKpi(); });
window.addEventListener('orientationchange',()=>{ setTimeout(()=>{ try{ map.invalidateSize(true); }catch(e){} scheduleAutoFitKpi(); try{ [dashChartTerrestre,dashChartBarCat,dashChartBarEstados,dashChartAdvcProp,dashChartPeriodo,dashChartPeriodoAdvc].forEach(ch=>{ try{ ch&&ch.resize(); }catch(e){} }); }catch(e){} }, 600); });
try{ screen.orientation&&screen.orientation.addEventListener('change',()=>{ setTimeout(()=>{ try{ map.invalidateSize(true); }catch(e){} scheduleAutoFitKpi(); }, 600); }); }catch(e){}

async function actualizarDashboard(){
 try{
  const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));
 const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));
 const anpData=getFilteredFeatures(anpK);
 const advcData=getFilteredFeatures(advcK);
  let supTotal=0,totalAreas=anpData.length,totalAdvc=advcData.length;
  if(anpK){
    const sc=activeLayers[anpK].superficieCol||detectarColumnaSuperficie(anpData);
    if(sc){
      for(let i=0;i<anpData.length;i+=40){
        const batch=anpData.slice(i,i+40);
        batch.forEach(ft=>{ const n=toHa(ft.properties[sc]); if(Number.isFinite(n)) supTotal+=n; });
        if(i+40 < anpData.length) await new Promise(r=>setTimeout(r,0));
      }
    }
  }
  const hasAnp = !!anpK && !!activeLayers[anpK]?.superficieCol;
  animateKPI('dash-kpi-sup', hasAnp || supTotal!==0 ? formatearNumero(supTotal) : '—');
  animateKPI('dash-kpi-count', anpK ? (totalAreas===0?'0':formatearNumero(totalAreas)) : '—');
  animateKPI('dash-kpi-advc', advcK ? (totalAdvc===0?'0':formatearNumero(totalAdvc)) : '—');
   try{
    let supCertADVC=0;
    let hasCertCol=false;
    if(advcK){
     const scCert=activeLayers[advcK].superficieCol||detectarColumnaSuperficie(advcData)||'ha_cert';
     hasCertCol=!!scCert;
     for(let i=0;i<advcData.length;i+=50){
      const batch=advcData.slice(i,i+50);
     batch.forEach(ft=>{
      let v=ft.properties[scCert];
      let n=toHa(v);
      if(!Number.isFinite(n)) n=toHa(ft.properties['ha_cert']);
      if(Number.isFinite(n)) supCertADVC+=n;
      else{
        for(const k of Object.keys(ft.properties)){
          const cand=toHa(ft.properties[k]);
          if(Number.isFinite(cand) && k.toLowerCase().includes('ha')){ supCertADVC+=cand; break; }
        }
      }
     });
      if(i+50 < advcData.length) await new Promise(r=>setTimeout(r,0));
     }
      // Traslape ADVC-ANP para KPI sin solape
      let traslapeDash=0;
      if(advcK && anpK && typeof turf!=='undefined' && advcData.length && anpData.length){
        const cap=600; let n=0;
        outerDash: for(const a of advcData){ for(const b of anpData){ if(n++>cap) break outerDash; try{ if(turf.booleanIntersects(a,b)){ const inter=turf.intersect(a,b); if(inter){ const am2=turf.area(inter); if(am2>0){ traslapeDash+=am2/1e4; break; } } } }catch(e){} } }
      }
     const supCertSinTraslape=Math.max(0, supCertADVC - traslapeDash);
     const hasAdvCert = !!advcK && hasCertCol;
     const hasAdvCert2 = hasCertCol || supCertSinTraslape!==0;
     animateKPI('dash-kpi-adv-cert', hasAdvCert2 ? formatearNumero(supCertSinTraslape) : '—');
    let sinanpMain=0, pmMain=0;
    if(anpK){
      anpData.forEach(ft=>{
        const p=ft.properties;
        const vS=p.cert_sinap; if(vS!==null && vS!==undefined && String(vS).trim()!=='' && String(vS).toLowerCase()!=='no' && String(vS).trim()!=='0') sinanpMain++;
        const vP=p.pm; if(vP!==null && vP!==undefined && String(vP).trim()!=='' && String(vP).toLowerCase()!=='no' && String(vP).trim()!=='0') pmMain++;
      });
    }
    animateKPI('dash-kpi-sinanp', anpK ? (sinanpMain===0?'0':`${sinanpMain.toLocaleString('es-MX')} / ${anpData.length.toLocaleString('es-MX')} (${(anpData.length? sinanpMain/anpData.length*100:0).toFixed(1)}%)`) : '—');
    animateKPI('dash-kpi-pm', anpK ? (pmMain===0?'0':`${pmMain.toLocaleString('es-MX')} / ${anpData.length.toLocaleString('es-MX')} (${(anpData.length? pmMain/anpData.length*100:0).toFixed(1)}%)`) : '—');
   } else {
    animateKPI('dash-kpi-adv-cert', '—');
    animateKPI('dash-kpi-sinanp', '—');
    animateKPI('dash-kpi-pm', '—');
   }
   }catch(e){ console.error('KPI nuevos error',e); try{ animateKPI('dash-kpi-adv-cert','—'); }catch(e2){} }

 let terrestre=0,marina=0;
 if(anpK)anpData.forEach(ft=>{const st=ft.properties.s_terres||0,sm=ft.properties.s_marina||0;if(typeof st==='number')terrestre+=st;if(typeof sm==='number')marina+=sm;});
 const tmDesc=terrestre>=marina;const tmD=tmDesc?['Terrestre','Marina']:['Marina','Terrestre'];const tmV=tmDesc?[terrestre,marina]:[marina,terrestre];const tmC=tmDesc?['#8c5c47','#4a8cb0']:['#4a8cb0','#8c5c47'];
 const ctxT=document.getElementById('chart-terrestre-marina').getContext('2d');
 if(dashChartTerrestre){dashChartTerrestre.data.labels=tmD;dashChartTerrestre.data.datasets[0].data=tmV;dashChartTerrestre.data.datasets[0].backgroundColor=tmC;dashChartTerrestre.update();}
 else{dashChartTerrestre=new Chart(ctxT,{type:'doughnut',data:{labels:tmD,datasets:[{data:tmV,backgroundColor:tmC,borderColor:'rgba(0,0,0,0.3)',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,aspectRatio:1,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:5,font:{size:9}}},tooltip:{callbacks:{label:c=>`${c.label}: ${formatearNumero(c.parsed)} ha`}}}}});}

 const catData={};
 if(anpK){const e=activeLayers[anpK];const catCol=e.categoriaCol;const sc=e.superficieCol||detectarColumnaSuperficie(anpData);if(catCol)anpData.forEach(ft=>{const cat=ft.properties[catCol];if(cat){const k=String(cat).trim();if(!catData[k])catData[k]={count:0,area:0};catData[k].count++;if(sc&&typeof ft.properties[sc]==='number')catData[k].area+=ft.properties[sc];}});}
 const lblBC=Object.keys(catData).sort((a,b)=>barCatMode==='count'?(catData[b].count-catData[a].count):(catData[b].area-catData[a].area));barCatData={labels:lblBC,counts:lblBC.map(k=>catData[k].count),areas:lblBC.map(k=>catData[k].area)};
 const valBC=barCatMode==='count'?barCatData.counts:barCatData.areas;const colsBC=lblBC.map(c=>getColorPorCategoria(c));
 const ctxBC=document.getElementById('chart-bar-cat').getContext('2d');
 if(dashChartBarCat){dashChartBarCat.data.labels=lblBC;dashChartBarCat.data.datasets[0].data=valBC;dashChartBarCat.data.datasets[0].backgroundColor=colsBC;dashChartBarCat.update();}
 else{dashChartBarCat=new Chart(ctxBC,{type:'bar',data:{labels:lblBC,datasets:[{label:'Superficie',data:valBC,backgroundColor:colsBC,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{font:{size:8}}},x:{ticks:{font:{size:8}}}},onClick:function(e,els){if(!els.length)return{cancelled:true};const idx=els[0].index;const cat=lblBC[idx];if(dashboardFilters.cat===cat)dashboardFilters.cat=null;else dashboardFilters.cat=cat;actualizarDashboard();},onHover:function(e,els){e.native.target.style.cursor=els.length?'pointer':'default';}}});}

 const estadoAdvc={};
 if(advcK){const sc=activeLayers[advcK].superficieCol||'ha_cert';advcData.forEach(ft=>{const est=ft.properties.estado||'Sin estado';const sup=ft.properties[sc]||0;if(est&&typeof sup==='number'){const k=String(est).trim();if(!estadoAdvc[k])estadoAdvc[k]={count:0,area:0};estadoAdvc[k].count++;estadoAdvc[k].area+=sup;}});}
 const sortedE=Object.entries(estadoAdvc).sort((a,b)=>barEstadosMode==='count'?(b[1].count-a[1].count):(b[1].area-a[1].area)).slice(0,5);
 const lblE=sortedE.map(e=>e[0]);barEstadosData={labels:lblE,counts:sortedE.map(e=>e[1].count),areas:sortedE.map(e=>e[1].area)};
 const valE=barEstadosMode==='count'?barEstadosData.counts:barEstadosData.areas;
 const ctxE=document.getElementById('chart-hbar-estados').getContext('2d');
 if(dashChartBarEstados){dashChartBarEstados.data.labels=lblE;dashChartBarEstados.data.datasets[0].data=valE;dashChartBarEstados.update();}
 else{dashChartBarEstados=new Chart(ctxE,{type:'bar',data:{labels:lblE,datasets:[{label:'Superficie (ha)',data:valE,backgroundColor:'#6F4489',borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{font:{size:8}}},y:{ticks:{font:{size:8}}}},onClick:function(e,els){if(!els.length)return{cancelled:true};const idx=els[0].index;const est=lblE[idx];if(dashboardFilters.estado===est)dashboardFilters.estado=null;else dashboardFilters.estado=est;actualizarDashboard();},onHover:function(e,els){e.native.target.style.cursor=els.length?'pointer':'default';}}});}

  const propData={};let totalAdvcSup=0;
  if(advcK){let sc=activeLayers[advcK].superficieCol||detectarColumnaSuperficie(advcData);if(!sc&&advcData.length){const p=advcData[0].properties;for(const k of Object.keys(p)){if((k.toLowerCase().includes('ha')||k.toLowerCase().includes('cert')||k.toLowerCase().includes('superficie'))&&typeof p[k]==='number'){sc=k;break;}}}let tipoCol=null;if(advcData.length){const p=advcData[0].properties;for(const k of['tipo_prop','tipo_propietario','propietario','tenencia']){if(p[k]!==undefined){tipoCol=k;break;}}if(!tipoCol)for(const k of Object.keys(p)){if(k.toLowerCase().includes('prop')||k.toLowerCase().includes('tenencia')){tipoCol=k;break;}}}if(tipoCol)advcData.forEach(ft=>{const tipo=ft.properties[tipoCol]||'';const grupo=agruparPropiedad(estandarizarTipoPropietario(tipo));if(!propData[grupo])propData[grupo]={count:0,superficie:0};propData[grupo].count++;const raw=sc?(ft.properties[sc]):0;const n=Number(String(raw).replace(/,/g,''));const sup=Number.isFinite(n)?n:0;propData[grupo].superficie+=sup;totalAdvcSup+=sup;});}
  const lblP=Object.keys(propData).sort((a,b)=>propData[b].superficie-propData[a].superficie);const coloresProp={'Social':'#655CA7','Privada':'#884C9E','Pública':'#C0BCD7','Otros':'#A0AEC0'};const bgP=lblP.map(k=>coloresProp[k]||'#A0AEC0');const porcs=lblP.map(k=>totalAdvcSup>0?(propData[k].superficie/totalAdvcSup)*100:0);
 const ctxP=document.getElementById('chart-advc-propiedad').getContext('2d');
 if(dashChartAdvcProp){dashChartAdvcProp.data.labels=lblP;dashChartAdvcProp.data.datasets[0].data=lblP.map(k=>propData[k].superficie);dashChartAdvcProp.data.datasets[0].backgroundColor=bgP;dashChartAdvcProp.update();}
 else{dashChartAdvcProp=new Chart(ctxP,{type:'doughnut',data:{labels:lblP,datasets:[{data:lblP.map(k=>propData[k].superficie),backgroundColor:bgP,borderColor:'rgba(0,0,0,0.3)',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,aspectRatio:1,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:5,font:{size:9}}},tooltip:{callbacks:{label:c=>{const i=c.dataIndex;const lbl=c.label;const cnt=propData[lbl]?.count||0;return `${lbl}: ${cnt} ADVC, ${formatearNumero(c.parsed)} ha (${(porcs[i]||0).toFixed(1)}%)`;}}}},onClick:function(e,els){if(!els.length)return{cancelled:true};const idx=els[0].index;const prop=lblP[idx];if(dashboardFilters.propiedad===prop)dashboardFilters.propiedad=null;else dashboardFilters.propiedad=prop;actualizarDashboard();},onHover:function(e,els){e.native.target.style.cursor=els.length?'pointer':'default';}}});}

 const ctxPer=document.getElementById('chart-periodo')?.getContext('2d');
 if(ctxPer){
   const periodCounts={}; const periodCats={};
   PERIODOS.forEach(p=>{ periodCounts[p.lbl]=0; periodCats[p.lbl]={}; });
   let sinanpCount=0, pmCount=0;
   anpData.forEach(ft=>{
     const p=ft.properties;
     const d=parseDOF(p.prim_dof||p.prim_dec||p.fecha||p.ult_dof);
     const per=periodoDeFecha(d);
     if(per){ periodCounts[per]=(periodCounts[per]||0)+1; const cat=p[activeLayers[anpK]?.categoriaCol||'cat_manejo']||'Sin cat'; const k=String(cat).trim()||'Sin cat'; if(!periodCats[per][k]) periodCats[per][k]=0; periodCats[per][k]++; }
     const sinanpVal=p.cert_sinap; if(sinanpVal!==null && sinanpVal!==undefined && String(sinanpVal).trim()!=='' && String(sinanpVal).toLowerCase()!=='no' && String(sinanpVal).trim()!=='0') sinanpCount++;
      const pmVal=p.pm; if(pmVal!==null && pmVal!==undefined && String(pmVal).trim()!=='' && String(pmVal).toLowerCase()!=='no' && String(pmVal).trim()!=='0') pmCount++;
   });
   const labelsPer=PERIODOS.map(p=>p.lbl).filter(lbl=> periodCounts[lbl]>0);
   const dataPer=labelsPer.map(lbl=> periodCounts[lbl]);
   const totalAnpPeriodo=anpData.length;
   const kpiSinanpEl=document.getElementById('kpi-sinanp');
   const kpiPmEl=document.getElementById('kpi-pm');
   if(kpiSinanpEl) kpiSinanpEl.textContent= totalAnpPeriodo? `${sinanpCount.toLocaleString('es-MX')} / ${totalAnpPeriodo.toLocaleString('es-MX')} (${(sinanpCount/totalAnpPeriodo*100).toFixed(1)}%)` : '—';
   if(kpiPmEl) kpiPmEl.textContent= totalAnpPeriodo? `${pmCount.toLocaleString('es-MX')} / ${totalAnpPeriodo.toLocaleString('es-MX')} (${(pmCount/totalAnpPeriodo*100).toFixed(1)}%)` : '—';
    const filtroPerCat=document.getElementById('filtro-periodo-cat');
    if(filtroPerCat){
      const catsUnicas=[...new Set(Object.values(periodCats).flatMap(o=>Object.keys(o)))].sort();
      const curVal=filtroPerCat.value;
      const opts='<option value="">Todas las categorías</option>' + catsUnicas.map(c=>`<option value="${c}" ${curVal===c?'selected':''}>${getNombreCompleto(c)}</option>`).join('');
      if(filtroPerCat.innerHTML!==opts) filtroPerCat.innerHTML=opts;
      let catsFiltradas=catsUnicas;
      if(curVal) catsFiltradas=[curVal];
      var cats=catsFiltradas.slice(0,8);
    } else {
      var cats=[...new Set(Object.values(periodCats).flatMap(o=>Object.keys(o)))].slice(0,8);
    }
    if(labelsPer.length){
      const datasets=cats.map(cat=>{
        return {label:getNombreCompleto(cat), data:labelsPer.map(lbl=> periodCats[lbl][cat]||0), backgroundColor:getColorPorCategoria(cat), stack:'x'};
      });
      if(dashChartPeriodo){
        dashChartPeriodo.data.labels=labelsPer;
        dashChartPeriodo.data.datasets=datasets;
        dashChartPeriodo.update();
      } else {
        dashChartPeriodo=new Chart(ctxPer,{type:'bar', data:{labels:labelsPer, datasets}, options:{responsive:true,maintainAspectRatio:true, interaction:{mode:'index', intersect:false}, plugins:{legend:{position:'bottom', labels:{boxWidth:10, padding:8, font:{size:8}}}, tooltip:{mode:'index', callbacks:{footer:items=>{ const v=items.reduce((a,c)=>a+c.parsed.y,0); return 'Total: '+v+' ANP'; }}}}, scales:{x:{stacked:true, ticks:{font:{size:7}, maxRotation:45}}, y:{stacked:true, beginAtZero:true, ticks:{font:{size:8}, stepSize:1}}}}});
      }
      const fpc=document.getElementById('filtro-periodo-cat');
      if(fpc && !fpc._hasListener){ fpc._hasListener=true; fpc.addEventListener('change',()=> actualizarDashboard()); }
      const contBotones=document.getElementById('periodo-botones');
      if(contBotones){
        contBotones.innerHTML=labelsPer.map(lbl=>{
          const total=periodCounts[lbl];
          return `<button class="btn-periodo" data-periodo="${lbl}" style="font-size:0.58rem; padding:0.18rem 0.5rem; border:1px solid var(--border-subtle); border-radius:999px; background:var(--bg-glass); color:var(--text-primary); cursor:pointer; font-family:Inter,sans-serif;">${lbl} <span style="background:var(--brand-secondary); color:#fff; border-radius:999px; padding:0 4px; font-size:0.52rem; margin-left:4px;">${total}</span></button>`;
        }).join('');
        contBotones.querySelectorAll('.btn-periodo').forEach(btn=>{
          btn.addEventListener('click',()=>{
            const per=btn.dataset.periodo;
            const supCol=activeLayers[anpK]?.superficieCol||detectarColumnaSuperficie(anpData);
            const supByCat={};
            anpData.forEach(ft=>{
              const d=parseDOF(ft.properties.prim_dof||ft.properties.prim_dec);
              if(periodoDeFecha(d)!==per) return;
              const cat=ft.properties[activeLayers[anpK]?.categoriaCol||'cat_manejo']||'Sin cat';
              const k=String(cat).trim()||'Sin cat';
              const sup=supCol? toHa(ft.properties[supCol]) : 0;
              if(!supByCat[k]) supByCat[k]=0;
              supByCat[k]+=Number.isFinite(sup)?sup:0;
            });
            const cntByCat={};
            anpData.forEach(ft=>{
              const d2=parseDOF(ft.properties.prim_dof||ft.properties.prim_dec);
              if(periodoDeFecha(d2)!==per) return;
              const cat2=ft.properties[activeLayers[anpK]?.categoriaCol||'cat_manejo']||'Sin cat';
              const k2=String(cat2).trim()||'Sin cat';
              cntByCat[k2]=(cntByCat[k2]||0)+1;
            });
            const lblCat=Object.keys(supByCat).sort((a,b)=>supByCat[b]-supByCat[a]);
            window._periodoDetalleBase={per,cats:lblCat,counts:lblCat.map(k=>cntByCat[k]||0),areas:lblCat.map(k=>supByCat[k])};
            periodoDetalleModo='area';
            document.getElementById('btn-toggle-periodo-detalle')?.classList.remove('active');
            renderPeriodoDetalle();
          });
        });
      }
    } else {
      if(dashChartPeriodo){ dashChartPeriodo.data.labels=[]; dashChartPeriodo.data.datasets=[]; dashChartPeriodo.update(); }
      const contBotones=document.getElementById('periodo-botones');
      if(contBotones) contBotones.innerHTML='';
    }
  }

  // ADVC certificadas por periodo (fecha_exp), cronológico
  const ctxPerA=document.getElementById('chart-periodo-advc')?.getContext('2d');
  if(ctxPerA){
    const perCntA={}, perAreaA={};
    if(advcK){
      const scA=activeLayers[advcK].superficieCol||detectarColumnaSuperficie(advcData)||'ha_cert';
      advcData.forEach(ft=>{
        const p=ft.properties||{};
        const d=parseDOF(p.fecha_exp||p.fecha||p.fecha_cert);
        const per=d?periodoDeFecha(d):null;
        if(!per) return;
        if(!perCntA[per]){ perCntA[per]=0; perAreaA[per]=0; }
        perCntA[per]++;
        const n=toHa(p[scA]!==undefined?p[scA]:p.ha_cert);
        if(Number.isFinite(n)) perAreaA[per]+=n;
      });
    }
    const lblPerA=PERIODOS.map(p=>p.lbl).filter(lbl=>perCntA[lbl]>0);
    const isCA=advPeriodoMode==='count';
    const valPerA=lblPerA.map(lbl=>isCA?perCntA[lbl]:Math.round(perAreaA[lbl]));
    if(dashChartPeriodoAdvc){ dashChartPeriodoAdvc.data.labels=lblPerA; dashChartPeriodoAdvc.data.datasets[0].data=valPerA; dashChartPeriodoAdvc.data.datasets[0].label=isCA?'ADVC certificadas':'Superficie certificada (ha)'; dashChartPeriodoAdvc.update(); }
    else{ dashChartPeriodoAdvc=new Chart(ctxPerA,{type:'bar',data:{labels:lblPerA,datasets:[{label:'Superficie certificada (ha)',data:valPerA,backgroundColor:'#6F4489',borderColor:'rgba(0,0,0,0.2)',borderWidth:1,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>advPeriodoMode==='count'?`${c.parsed.y} ADVC`:`${formatearNumero(c.parsed.y)} ha`}}},scales:{y:{beginAtZero:true,ticks:{font:{size:8},callback:v=>advPeriodoMode==='count'?v:formatearNumero(v)}},x:{ticks:{font:{size:7},maxRotation:45}}}}}); }
  }

 actualizarTabla(anpK,advcK,anpData,advcData);
 updateFilterBar();
 applyDashboardFilterToMap();
 }catch(e){ console.error('actualizarDashboard error',e); try{ updateFilterBar(); }catch(e2){} }
}

// detalle de periodo ANP con toggle #/ha (mayor a menor)
function renderPeriodoDetalle(){
 const base=window._periodoDetalleBase; if(!base) return;
 const isC=periodoDetalleModo==='count';
 const order=[...base.cats].sort((a,b)=>{ const i=base.cats.indexOf(a), j=base.cats.indexOf(b); return isC?(base.counts[j]-base.counts[i]):(base.areas[j]-base.areas[i]); });
 const detTitle=document.getElementById('periodo-detalle-titulo');
 if(detTitle) detTitle.textContent=`${base.per} — ${isC?'Conteo':'Superficie'} por categoría (${base.cats.length} categorías)`;
 const detCanvas=document.getElementById('chart-periodo-detalle');
 if(!detCanvas) return;
 const ctxD=detCanvas.getContext('2d');
 if(window._chartPeriodoDetalle) window._chartPeriodoDetalle.destroy();
 window._chartPeriodoDetalle=new Chart(ctxD,{
  type:'bar',
  data:{labels:order.map(c=>getNombreCompleto(c)), datasets:[{label:isC?'ANP':'Hectáreas', data:order.map(c=>{ const i=base.cats.indexOf(c); return isC?base.counts[i]:Math.round(base.areas[i]); }), backgroundColor:order.map(c=>getColorPorCategoria(c)), borderRadius:4}]},
  options:{
   responsive:true, maintainAspectRatio:false,
   plugins:{legend:{display:false}, tooltip:{callbacks:{label:function(c){ return c.label+': '+(periodoDetalleModo==='count'?(c.parsed.y+' ANP'):formatearNumero(c.parsed.y)+' ha'); }}}},
   scales:{
    y:{beginAtZero:true, ticks:{callback:function(v){ return periodoDetalleModo==='count'?v:formatearNumero(v); }}},
    x:{ticks:{maxRotation:45, font:{size:8}}}
   }
  }
 });
 document.getElementById('periodo-detalle').style.display='block';
 document.getElementById('periodo-detalle').scrollIntoView({behavior:'smooth', block:'nearest'});
}
document.getElementById('btn-toggle-periodo-detalle')?.addEventListener('click',function(){ this.classList.toggle('active'); periodoDetalleModo=this.classList.contains('active')?'count':'area'; renderPeriodoDetalle(); });
document.getElementById('toggle-dash-periodo-advc')?.addEventListener('click',function(){ this.classList.toggle('active'); advPeriodoMode=this.classList.contains('active')?'count':'area'; actualizarDashboard(); });

function actualizarTabla(anpK,advcK,filteredAnp,filteredAdvc){
 const tabla=document.getElementById('tabla-datos');
 const thead=tabla.querySelector('thead');
 const tbody=tabla.querySelector('tbody');
 let headers=[],filas=[];
 // ANP ascendente por fecha de decreto; ADVC ascendente por número de certificado
 const fechaDecretoAnp=p=>parseDOF(p.prim_dof||p.prim_dec||p.fecha||p.ult_dof);
 const numCertAdvc=p=>{ const c=p.no_certificado||p.num_cert||p.numero_cert||p.certificado||p.instrument; return (c===undefined||c===null||String(c).trim()==='')?null:String(c).trim(); };
 const anioDeFecha=v=>{ if(!v) return null; const m=String(v).trim().match(/(\d{4})/); if(m) return +m[1]; const d=parseDOF(v); return d?d.getFullYear():null; };
 if(tablaActual==='anp'&&anpK){
  let data=(filteredAnp||(activeLayers[anpK].featuresData||[])).slice();
  const e=activeLayers[anpK];
  data.sort((a,b)=>{ const da=fechaDecretoAnp(a.properties),db=fechaDecretoAnp(b.properties); if(da&&db) return da-db; if(da) return -1; if(db) return 1; return getFeatureName(a.properties).localeCompare(getFeatureName(b.properties),'es'); });
  try{
   const filtroEl=document.getElementById('filtro-tabla');
   const q=filtroEl?filtroEl.value.trim().toLowerCase():'';
   if(q) data=data.filter(ft=>Object.values(ft.properties||{}).some(v=>String(v===undefined||v===null?'':v).toLowerCase().includes(q)));
  }catch(e){}
  headers=['No','Nombre','Categoría','Superficie (ha)','Estados','Región','Fecha decreto'];
  filas=data.map((ft,i)=>{const p=ft.properties;const d=fechaDecretoAnp(p);return[i+1,getFeatureName(p),p[e.categoriaCol]||'—',p[e.superficieCol]||0,p.estados||'—',p.region||p.region_conanp||'—',d?d.toLocaleDateString('es-MX'):'—'];});
 }else if(tablaActual==='advc'&&advcK){
  let data=(filteredAdvc||(activeLayers[advcK].featuresData||[])).slice();
  data.sort((a,b)=>{ const ca=numCertAdvc(a.properties),cb=numCertAdvc(b.properties); if(ca===null&&cb===null) return 0; if(ca===null) return 1; if(cb===null) return -1; return ca.localeCompare(cb,'es',{numeric:true}); });
  try{
   const filtroEl=document.getElementById('filtro-tabla');
   const q=filtroEl?filtroEl.value.trim().toLowerCase():'';
   if(q) data=data.filter(ft=>Object.values(ft.properties||{}).some(v=>String(v===undefined||v===null?'':v).toLowerCase().includes(q)));
  }catch(e){}
  headers=['No','Número de Certificado','Nombre del área','Superficie certificada (ha)','Municipio','Estado','Año de certificación','Vigencia','Tipo de Propiedad','Principales Ecosistemas'];
  filas=data.map((ft,i)=>{const p=ft.properties;const cert=numCertAdvc(p);const tipoRaw=p.tipo_prop||p.tipo_propietario||p.propietario||'';return[i+1,cert||'—',p.advc||p.nombre||getFeatureName(p),(p.ha_cert!==undefined&&p.ha_cert!==null)?p.ha_cert:((p.ha!==undefined&&p.ha!==null)?p.ha:0),p.municipio||'—',p.estado||'—',anioDeFecha(p.fecha_exp||p.fecha)||'—',p.vigencia||'—',tipoRaw?agruparPropiedad(estandarizarTipoPropietario(tipoRaw)):'—',p.ecosistema||'—'];});
 }else{
  try{
   const filtroEl=document.getElementById('filtro-tabla');
   const q=filtroEl? filtroEl.value.trim().toLowerCase() : '';
   if(q){ filas=filas.filter(row=> row.some(cell=> String(cell).toLowerCase().includes(q))); }
  }catch(e){}
 }
 const totalFilas=filas.length;
 const maxRows=tableExpanded?TABLE_EXPANDED_SIZE:TABLE_PAGE_SIZE;
 const visFilas=filas.slice(0,maxRows);
 thead.innerHTML='<tr>'+headers.map(h=>`<th>${h}</th>`).join('')+'</tr>';
 let tbodyHtml=visFilas.length?visFilas.map(row=>`<tr>${row.map(cell=>`<td>${typeof cell==='number'?formatearNumero(cell):cell}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}" class="sin-datos">Sin datos para ${tablaActual.toUpperCase()}</td></tr>`;
 if(totalFilas>TABLE_PAGE_SIZE){
  tbodyHtml+=`<tr><td colspan="${headers.length}" style="text-align:center;padding:0.4rem"><button id="btn-toggle-rows" style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:var(--r-sm);padding:0.22rem 0.7rem;font-size:0.6rem;cursor:pointer;color:var(--text-muted);font-family:Inter,sans-serif">${tableExpanded?'Mostrar menos ('+TABLE_PAGE_SIZE+')':'Mostrar más ('+Math.min(totalFilas,TABLE_EXPANDED_SIZE)+' de '+totalFilas+')'}</button></td></tr>`;
 }
 tbody.innerHTML=tbodyHtml;
 const btnToggle=document.getElementById('btn-toggle-rows');
 if(btnToggle)btnToggle.addEventListener('click',()=>{tableExpanded=!tableExpanded;actualizarTabla(anpK,advcK,filteredAnp,filteredAdvc);});
}

document.querySelectorAll('.tabla-tabs button').forEach(btn=>{btn.addEventListener('click',function(){document.querySelectorAll('.tabla-tabs button').forEach(b=>b.classList.remove('active'));this.classList.add('active');tablaActual=this.dataset.tabla;const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));const anpData=getFilteredFeatures(anpK);const advcData=getFilteredFeatures(advcK);tableExpanded=false;actualizarTabla(anpK,advcK,anpData,advcData);});});
try{
 document.getElementById('filtro-tabla')?.addEventListener('input',()=>{
  const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));const anpData=getFilteredFeatures(anpK);const advcData=getFilteredFeatures(advcK);actualizarTabla(anpK,advcK,anpData,advcData);
 });
 document.getElementById('btn-limpiar-filtro')?.addEventListener('click',()=>{
  const inp=document.getElementById('filtro-tabla'); if(inp) inp.value=''; const anpK=Object.keys(activeLayers).find(k=>esCapaAnpPrincipal(k));const advcK=Object.keys(activeLayers).find(k=>esCapaAdvc(k));const anpData=getFilteredFeatures(anpK);const advcData=getFilteredFeatures(advcK);actualizarTabla(anpK,advcK,anpData,advcData);
 });
}catch(e){}

// ================================================================
// MAIN LOAD
// ================================================================
async function cargarCapas(){
 const statusDiv=document.getElementById('status');const listContainer=document.getElementById('list-container');
 const setStatus=(msg,type)=>{statusDiv.textContent=msg;statusDiv.className=type||'';};
 setStatus('⏳ Conectando a GeoServer…','');
 listContainer.innerHTML='<p class="sin-capas"><i class="fas fa-spinner fa-spin"></i> Buscando capas…</p>';
 try{
  const capasDisponibles=await getCapasDesdeWFS();
  if(!capasDisponibles.length){setStatus('❌ Sin capas disponibles.','error');listContainer.innerHTML=`<p class="sin-capas">No se pudo conectar.<br><small style="color:var(--text-muted)">${GEOSERVER_BASE}</small></p>`;return;}
  setStatus(`✅ ${capasDisponibles.length} capas encontradas.`,'success');listContainer.innerHTML='';allFeaturesForSearch=[];
  const gruposMap={};capasDisponibles.forEach(t=>{const{grupo,tema}=getGrupoYTema(t);if(!gruposMap[grupo])gruposMap[grupo]={tema,capas:[]};gruposMap[grupo].capas.push(t);});
   const orden=['Contexto Geográfico','CONANP','Designaciones Internacionales','Otras'];
   const idxConanp=t=>{ const l=String(t||'').toLowerCase(); if(l.includes('zp_anp'))return 1; if(l.includes('shp_anp'))return 0; if(l.includes('shp_advc'))return 2; if(l.includes('reg_conanp'))return 3; return 99; };
   if(gruposMap['CONANP']) gruposMap['CONANP'].capas.sort((a,b)=>idxConanp(a)-idxConanp(b));
  const gruposOrdenados=Object.keys(gruposMap).sort((a,b)=>{const ia=orden.indexOf(a),ib=orden.indexOf(b);if(ia<0&&ib<0)return a.localeCompare(b);if(ia<0)return 1;if(ib<0)return-1;return ia-ib;});
  const grupoIcons={'Contexto Geográfico':'fas fa-globe','CONANP':'fas fa-leaf','Designaciones Internacionales':'fas fa-award','Otras':'fas fa-ellipsis-h'};
  for(const nombreGrupo of gruposOrdenados){
   const{capas}=gruposMap[nombreGrupo];
   const grupoDiv=document.createElement('div');grupoDiv.className='grupo';
   const titulo=document.createElement('div');titulo.className='grupo-titulo';
   titulo.innerHTML=`<span class="grupo-nombre"><i class="${grupoIcons[nombreGrupo]||'fas fa-folder'}"></i> ${nombreGrupo} <small style="color:var(--text-muted);font-weight:400">(${capas.length})</small></span><span class="flecha ${nombreGrupo!=='Designaciones Internacionales'?'abierto':''}"><i class="fas fa-chevron-down"></i></span>`;
   const contenido=document.createElement('div');contenido.className='grupo-contenido';
   if(nombreGrupo==='Designaciones Internacionales')contenido.classList.add('cerrado');
   let abierto=nombreGrupo!=='Designaciones Internacionales';
   titulo.addEventListener('click',()=>{abierto=!abierto;contenido.classList.toggle('cerrado',!abierto);titulo.querySelector('.flecha').classList.toggle('abierto',abierto);});

   for(const tableName of capas){
    const nombreAmigable=getNombreAmigable(tableName);const temaCapa=getGrupoYTema(tableName).tema;const colorBorde=getColorPorNombreCapa(tableName);
    let geomType=tableName.toLowerCase().includes('00ent')||tableName.toLowerCase().includes('00mun')||tableName.toLowerCase().includes('reg_conanp')?'LineString':'Polygon';
    const div=document.createElement('div');div.className='capa-item';div.dataset.tema=temaCapa;div.dataset.table=tableName;div.style.borderLeftColor=colorBorde;
      div.innerHTML=`<div class="capa-header"><input type="checkbox" id="chk-${tableName}" data-table="${tableName}"><span class="icono">${geomType.includes('Line')?'<i class="fas fa-route"></i>':'<i class="fas fa-draw-polygon"></i>'}</span><span class="nombre" title="${tableName}">${nombreAmigable}</span><button class="btn-info" data-table="${tableName}" title="Ver metadatos (ISO 19115)" aria-label="Metadatos ${tableName}"><i class="fas fa-circle-info"></i></button><button class="btn-zoom" title="Zoom a capa (o México si no hay capa activa)" data-zoom="${tableName}" aria-label="Zoom a capa ${tableName}"><i class="fas fa-crosshairs"></i></button><button class="btn-label" data-table="${tableName}" title="Etiqueta por atributo" aria-label="Etiqueta ${tableName}"><i class="fas fa-tag"></i></button><button class="btn-filtro" title="Filtrar por atributo" aria-label="Filtrar capa ${tableName}"><i class="fas fa-filter"></i></button><div class="btn-descarga" role="button" tabindex="0" aria-label="Descargar capa ${tableName}"><i class="fas fa-download"></i><div class="dropdown-menu"><button data-format="geojson">GeoJSON</button><button data-format="csv">CSV</button><button data-format="kml" style="display:none" disabled>KML</button><button data-format="shp">Shapefile</button></div></div></div><div class="capa-controls"><label>Opac.</label><input type="range" min="0" max="100" value="100" data-table="${tableName}"><span class="opacity-value">100%</span></div><div class="query-filtro" id="query-${tableName}"><label>Atributo</label><select data-q="attr"><option value="">— Selecciona atributo —</option></select><label>Valor</label><select data-q="val" disabled><option value="">— Primero elige atributo —</option></select><div class="query-filtro-btns"><button data-q="aplicar" class="primary">Aplicar + zoom</button><button data-q="limpiar">Limpiar</button></div><div class="query-info" data-q="info"></div></div>`;
     contenido.appendChild(div);
      // solo CONANP permite descarga; Shapefile directo SIG
      (function(){
        const isConanp = nombreGrupo==='CONANP';
        const btn = div.querySelector('.btn-descarga');
        if(!btn) return;
        if(!isConanp){
          btn.style.opacity='0.35';
          btn.style.pointerEvents='none';
          btn.style.cursor='not-allowed';
          btn.title='Descarga solo disponible para capas CONANP · Consulta https://sig.conanp.gob.mx/ y https://simec.conanp.gob.mx/';
          const dd = btn.querySelector('.dropdown-menu');
          if(dd) dd.remove();
        } else {
          const shpB = btn.querySelector('button[data-format="shp"]');
          if(shpB){ shpB.style.display='block'; shpB.disabled=false; shpB.title='Descargar Shapefile oficial desde SIG CONANP'; }
        }
      })();
      const checkbox=div.querySelector('input[type="checkbox"]');const slider=div.querySelector('input[type="range"]');const opVal=div.querySelector('.opacity-value');const btnDesc=div.querySelector('.btn-descarga');const btnZoom=div.querySelector('.btn-zoom');btnZoom.addEventListener('click',e=>{e.stopPropagation(); zoomToLayerOrMexico(btnZoom.dataset.zoom);});wireFiltroCapa(div,tableName,nombreAmigable);

    checkbox.addEventListener('change',async function(){
     const checked=this.checked;const table=this.dataset.table;
     if(checked){
      setStatus(`⏳ Cargando ${nombreAmigable}…`,'');
      try{
       const features=await fetchWFSGeoJSON(table);
       if(!features||!features.length){setStatus(`⚠️ "${nombreAmigable}" vacía.`,'warning');this.checked=false;return;}
       let categoriaCol=null;if(esCapaAnpPrincipal(table))categoriaCol=detectarColumnaCategoria(features);
       const superficieCol=detectarColumnaSuperficie(features);
       geomType=features[0]?.geometry?.type||geomType;
       const getStyle=f=>{const lt=table.toLowerCase();if(lt.includes('shp_00ent'))return{color:'#88aacc',weight:1.5,opacity:0.75,fill:false};if(lt.includes('shp_00mun'))return{color:'#667799',weight:1,opacity:0.6,dashArray:'3,4',fill:false};if(lt.includes('shp_reg_conanp'))return{color:'#6B1132',weight:2,opacity:0.85,fill:false};const cat=categoriaCol?f.properties[categoriaCol]:null;const color=cat?getColorPorCategoria(cat):getColorPorNombreCapa(table);const gt=f.geometry.type;if(gt.includes('Point'))return{color,fillColor:color,fillOpacity:0.88,radius:6,weight:1,opacity:1};if(gt.includes('Line'))return{color,weight:2.5,opacity:0.82};return{color,fillColor:color,fillOpacity:0.42,weight:2,opacity:0.88};};
       const layer=L.geoJSON(features,{style:getStyle,pointToLayer:(f,ll)=>{const cat=categoriaCol?f.properties[categoriaCol]:null;const color=cat?getColorPorCategoria(cat):getColorPorNombreCapa(table);return L.circleMarker(ll,{radius:6,fillColor:color,color,weight:1,opacity:1,fillOpacity:0.88});},onEachFeature:(f,l)=>l.bindPopup(crearPopupHTML(f,getColorPorNombreCapa(table),nombreAmigable,table),{className:'custom-popup'})}).addTo(map);
       activeLayers[table]={layer,color:colorBorde,opacity:1,geomType:features[0]?.geometry?.type||'',featuresData:features,categoriaCol,superficieCol,userColor:colorBorde,userName:nombreAmigable};
       features.forEach(f=>allFeaturesForSearch.push({feature:f,layer,capaNombre:nombreAmigable,color:colorBorde,capaNombreTecnico:table}));
       try{const b=layer.getBounds();if(b.isValid())map.fitBounds(b);}catch(e){}
       slider.value=100;opVal.textContent='100%';
       setStatus(`✅ ${nombreAmigable} cargada (${features.length} elementos).`,'success');
        // Habilitar metadatos solo si capa activa
        try{ const bi = div.querySelector('.btn-info'); if(bi){ bi.disabled=false; bi.style.opacity=''; bi.style.pointerEvents=''; bi.style.cursor='pointer'; bi.title='Ver metadatos (ISO 19115)'; } }catch(e){}
       if(categoriaCol)actualizarGraficosAnp();else if(esCapaAdvc(table))actualizarGraficoAdvc();
       actualizarContador();actualizarLeyenda();if(temaActual==='dashboard')actualizarDashboard();
      }catch(err){setStatus(`❌ ${err.message}`,'error');this.checked=false;}
     }else{
      if(activeLayers[table]){map.removeLayer(activeLayers[table].layer);allFeaturesForSearch=allFeaturesForSearch.filter(i=>i.capaNombreTecnico!==table);delete activeLayers[table];delete filtrosPorCapa[table];setStatus(`⛔ ${nombreAmigable} removida.`,'');
       try{ const bi2 = div.querySelector('.btn-info'); if(bi2){ bi2.disabled=true; bi2.style.opacity='0.35'; bi2.style.pointerEvents='none'; bi2.style.cursor='not-allowed'; bi2.title='Activa la capa para ver metadatos'; } }catch(e){}document.getElementById('resultados-busqueda').style.display='none';if(esCapaAnpPrincipal(table))actualizarGraficosAnp();else if(esCapaAdvc(table))actualizarGraficoAdvc();actualizarContador();actualizarLeyenda();if(temaActual==='dashboard')actualizarDashboard();}
     }
    });
    slider.addEventListener('input',function(){const val=parseInt(this.value);opVal.textContent=val+'%';const entry=activeLayers[this.dataset.table];if(!entry)return;const opacity=val/100;entry.opacity=opacity;entry.layer.eachLayer(sub=>{if(sub.setStyle)sub.setStyle(entry.geomType.includes('Point')?{fillOpacity:opacity,opacity}:entry.geomType.includes('Line')?{opacity}:{fillOpacity:opacity*0.5,opacity});});});
    btnDesc.addEventListener('mousedown',function(e){
     e.preventDefault();e.stopPropagation();
     const dm=this.querySelector('.dropdown-menu');
     const wasOpen=dm.classList.contains('show');
     document.querySelectorAll('.btn-descarga .dropdown-menu.show').forEach(m=>{m.classList.remove('show');});
     document.querySelectorAll('.grupo-contenido').forEach(g=>g.style.overflow='');
     document.querySelectorAll('.capa-item').forEach(c=>c.style.zIndex='');
     document.querySelectorAll('.btn-descarga').forEach(b=>b.style.zIndex='');
     if(!wasOpen){
      dm.classList.add('show');
      const grupo=this.closest('.grupo-contenido');
      if(grupo) grupo.style.overflow='visible';
      this.closest('.capa-item').style.zIndex='50';
      this.style.zIndex='51';
      dm.style.zIndex='100';
     }
    });
     btnDesc.querySelectorAll('.dropdown-menu button').forEach(btn=>{btn.addEventListener('mousedown',e=>{e.stopPropagation();const f=btn.dataset.format,t=btn.closest('.capa-item').dataset.table; descargarCapa(t,f); const dm=btn.closest('.dropdown-menu');dm.classList.remove('show');document.querySelectorAll('.grupo-contenido').forEach(g=>g.style.overflow='');document.querySelectorAll('.capa-item').forEach(c=>c.style.zIndex='');document.querySelectorAll('.btn-descarga').forEach(b=>b.style.zIndex='');});});
   }
   grupoDiv.appendChild(titulo);grupoDiv.appendChild(contenido);listContainer.appendChild(grupoDiv);
  }
  aplicarFiltro('general');setStatus(`✅ ${capasDisponibles.length} capas listas.`,'success');
  if(!chartAnpCount){chartAnpCount=new Chart(document.getElementById('chartAnpCount').getContext('2d'),{type:'bar',data:{labels:[],datasets:[{label:'Número de ANP por Categoría de Manejo',data:[],backgroundColor:[],borderRadius:4}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.y} ANP`}}},scales:{y:{beginAtZero:true}}}});}
  if(!chartAnpArea){chartAnpArea=new Chart(document.getElementById('chartAnpArea').getContext('2d'),{type:'doughnut',data:{labels:[],datasets:[{data:[],backgroundColor:[],borderColor:'rgba(0,0,0,0.3)',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:5,font:{size:9}}},tooltip:{callbacks:{label:c=>`${c.label}: ${formatearNumero(c.parsed)} ha`}}}}});}
  if(!chartAdvc){chartAdvc=new Chart(document.getElementById('chartAdvc').getContext('2d'),{type:'doughnut',data:{labels:[],datasets:[{data:[],backgroundColor:[],borderColor:'rgba(0,0,0,0.3)',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:5,font:{size:9}}}}}});}
  document.getElementById('grafico-advc').classList.add('grafico-oculto');
  document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{const t=cb.dataset.table;if(t&&(esCapaAnpPrincipal(t)||esCapaAdvc(t))&&!cb.checked){cb.checked=true;cb.dispatchEvent(new Event('change'));}});
  setTimeout(()=>{actualizarLeyenda();if(temaActual==='general')actualizarGraficosAnp();else if(temaActual==='advc')actualizarGraficoAdvc();else actualizarDashboard();},900);
  }catch(err){
    let msg=err.message||'Error desconocido';
    const isFile=location.protocol==='file:';
    const isCors=msg.includes('Failed to fetch')||msg.includes('NetworkError')||msg.includes('CORS')||msg.includes('Network request failed');
    if(isCors){
      if(isFile) msg='Bloqueo CORS por file:// — publica el visor por HTTP/HTTPS (ver banner amarillo)';
      else if(GEOSERVER_BASE.includes('geoserver.conanp.gob.mx')) msg='GeoServer remoto sin CORS para '+location.origin+' — sirve el HTML desde https://geoserver.conanp.gob.mx o habilita CORS en GeoServer';
      else msg='No se pudo conectar a GeoServer en '+GEOSERVER_BASE+' — verifica que esté corriendo y con CORS habilitado';
    }
    setStatus(`❌ ${msg}`,'error');
    listContainer.innerHTML=`<p class="sin-capas">Error al cargar capas.<br><small style="color:var(--text-muted)">${msg}<br><code>${GEOSERVER_BASE}</code></small><br><small>Abre F12 → Console/Network. Prueba <a href="${GEOSERVER_BASE}service=WFS&request=GetCapabilities" target="_blank">GetCapabilities</a></small></p>`;
    console.error(err);
  }
}

// componente Filtros de capas eliminado — cada capa tiene su icono de filtro

// ================================================================
// query por capa: icono filtro + atributo + valores únicos + zoom
// ================================================================
// filtrosPorCapa movido arriba junto a activeLayers (evita TDZ en cargarCapas)
function atributosParaQuery(table){
 const entry=activeLayers[table]; if(!entry) return [];
 const feats=entry.featuresData||[];
 if(!feats.length) return [];
 const mapeo=(typeof obtenerMapeoAtributos==='function')?obtenerMapeoAtributos(table):null;
 const sample=feats.slice(0,30);
 if(mapeo){
  return mapeo.orderedKeys.filter(k=>sample.some(f=>{ const v=f.properties[k]; return v!==undefined&&v!==null&&String(v).trim()!==''; })).map(k=>({key:k,label:mapeo.displayMap[k]||k}));
 }
 const excl=['gid','id','fid','objectid','shape_leng','shape_area','shape_len','geom','geometry','st_area','st_length'];
 const keys=Object.keys(sample[0].properties||{}).filter(k=>!excl.some(ex=>k.toLowerCase().includes(ex)));
 return keys.map(k=>({key:k,label:k}));
}
function valoresUnicosParaQuery(table,attr){
 const entry=activeLayers[table]; if(!entry) return [];
 const set=new Set();
 (entry.featuresData||[]).forEach(f=>{ const v=f.properties[attr]; if(v===undefined||v===null) return; const s=String(v).trim(); if(s&&s!=='null') set.add(s); });
 return [...set].sort((a,b)=>a.localeCompare(b,'es')).slice(0,200);
}
function estilosFiltroCapa(entry,ok){
 const gt=entry.geomType||'';
 if(ok){ if(gt.includes('Point'))return{fillOpacity:0.9,opacity:1,weight:1.5}; if(gt.includes('Line'))return{opacity:0.9,weight:3}; return{fillOpacity:0.55,opacity:0.9,weight:2}; }
 return{fillOpacity:0.06,opacity:0.15,weight:0.8};
}
function wireFiltroCapa(div,table,nombre){
 const btn=div.querySelector('.btn-filtro'); const q=div.querySelector('.query-filtro');
 if(!btn||!q) return;
 const selA=q.querySelector('select[data-q="attr"]');
 const selV=q.querySelector('select[data-q="val"]');
 const info=q.querySelector('[data-q="info"]');
 const setInfo=t=>{ if(info) info.textContent=t; };
 btn.addEventListener('click',e=>{
  e.stopPropagation();
  const open=q.classList.toggle('open');
  btn.classList.toggle('active',open);
  if(open){
   const attrs=atributosParaQuery(table);
   const cur=selA.value;
   selA.innerHTML='<option value="">— Selecciona atributo —</option>'+attrs.map(a=>`<option value="${a.key}">${a.label}</option>`).join('');
   if(attrs.some(a=>a.key===cur)) selA.value=cur;
   selV.innerHTML='<option value="">— Primero elige atributo —</option>'; selV.disabled=true;
   const f=filtrosPorCapa[table];
   setInfo(f&&f.val?`Filtro activo: ${f.label} = ${f.val}`:`${attrs.length} atributos en "${nombre}". Elige uno y un valor.`);
  }
 });
 selA.addEventListener('change',()=>{
  const attr=selA.value;
  if(!attr){ selV.innerHTML='<option value="">— Primero elige atributo —</option>'; selV.disabled=true; return; }
  const vals=valoresUnicosParaQuery(table,attr);
  selV.innerHTML='<option value="">— Todos los valores —</option>'+vals.map(v=>`<option value="${v.replace(/"/g,'&quot;')}">${v.length>60?v.substring(0,60)+'…':v}</option>`).join('');
  selV.disabled=false;
  setInfo(`${vals.length} valores únicos en este campo.`);
 });
 q.querySelector('[data-q="aplicar"]')?.addEventListener('click',()=>{
  const attr=selA.value; const val=selV.value;
  if(!attr){ setInfo('Elige primero un atributo.'); return; }
  const entry=activeLayers[table]; if(!entry){ setInfo('La capa no está cargada.'); return; }
  const label=(selA.options[selA.selectedIndex]?.textContent||attr);
  const feats=(entry.featuresData||[]).filter(f=>!val||String(f.properties[attr]??'').trim()===val);
  filtrosPorCapa[table]={attr,val,label};
  try{ entry.layer.eachLayer(sub=>{ if(!sub.setStyle||!sub.feature) return; sub.setStyle(estilosFiltroCapa(entry,!val||String(sub.feature.properties[attr]??'').trim()===val)); }); }catch(e){}
  btn.classList.add('active');
  if(val){ const n=zoomAFeatures(feats); setInfo(n?`✅ ${n.toLocaleString('es-MX')} elementos: ${label} = ${val}`:'⚠️ Sin elementos coincidentes.'); }
  else setInfo('Toda la capa resaltada (sin valor específico).');
  try{ actualizarLeyenda(); }catch(e){}
 });
 q.querySelector('[data-q="limpiar"]')?.addEventListener('click',()=>{
  delete filtrosPorCapa[table];
  selA.value=''; selV.innerHTML='<option value="">— Primero elige atributo —</option>'; selV.disabled=true;
  const entry=activeLayers[table];
  if(entry&&entry.layer){
   try{
    entry.layer.eachLayer(sub=>{
     if(!sub.setStyle) return;
     const gt=entry.geomType||'';
     if(gt.includes('Point'))sub.setStyle({fillOpacity:0.88,opacity:1,weight:1});
     else if(gt.includes('Line'))sub.setStyle({opacity:0.82,weight:2.5});
     else sub.setStyle({fillOpacity:0.42,opacity:0.88,weight:2});
    });
   }catch(e){}
  }
  btn.classList.remove('active');
  setInfo('Filtro limpio.');
  try{ actualizarLeyenda(); }catch(e){}
 });
}


 // Search
function buscar(){
 try{
  const q=document.getElementById('inputBusqueda').value.trim().toLowerCase();
  const container=document.getElementById('resultados-busqueda');
  if(!q){container.style.display='none';return;}
  const NAME_FIELDS=['nom','nombre','nom_geo','NOM','NOMBRE','NOM_GEO'];
  const activeTables=Object.keys(activeLayers);
  if(!allFeaturesForSearch.length||!activeTables.length){
   container.innerHTML='<div class="result-item"><span class="r-nombre" style="color:var(--text-muted)">Cargue capas primero</span></div>';
   container.style.display='block';return;
  }
  const activeEntries=allFeaturesForSearch.filter(e=>activeTables.includes(e.capaNombreTecnico));
  const results=[];
  for(const entry of activeEntries){
   if(results.length>=15)break;
   const props=entry.feature.properties;
   let match=false;
   for(const f of NAME_FIELDS){if(props[f]&&String(props[f]).toLowerCase().includes(q)){match=true;break;}}
   if(!match&&getFeatureName(props).toLowerCase().includes(q))match=true;
   if(match)results.push(entry);
  }
  if(!results.length){container.innerHTML='<div class="result-item"><span class="r-nombre" style="color:var(--text-muted)">Sin resultados</span></div>';container.style.display='block';return;}
  container.innerHTML=results.map((r,i)=>`<div class="result-item" data-index="${i}"><span class="r-nombre">${getFeatureName(r.feature.properties)}</span><span class="r-capa">${r.capaNombre}</span></div>`).join('');
  container.style.display='block';
  container.querySelectorAll('.result-item').forEach((item,idx)=>{item.addEventListener('click',()=>{const r=results[idx];try{const b=L.geoJSON(r.feature).getBounds();if(b.isValid())map.fitBounds(b,{maxZoom:12});}catch(e){}container.style.display='none';document.getElementById('inputBusqueda').value='';if(window.innerWidth<=1440)closePanel();});});
 }catch(e){console.error('buscar error:',e);}
}
document.getElementById('btnBuscar').addEventListener('click',buscar);
document.getElementById('inputBusqueda').addEventListener('keydown',e=>{if(e.key==='Enter')buscar();});

cargarCapas();
window.addEventListener('resize',()=>map.invalidateSize());

// ================================================================
// ANÁLISIS ESPACIAL — vs ANP/ADVC/Regiones
// ================================================================
let analisisLayer=null, ultimoAnalisis=null;
const analisisFuente=document.getElementById('analisis-fuente');
const analisisDestino=document.getElementById('analisis-destino');
const btnAnalizar=document.getElementById('btn-ejecutar-analisis');
const analisisOverlay=document.getElementById('analisis-overlay');
const analisisReportEl=document.getElementById('analisis-report');

function actualizarSelectoresAnalisis(){
 if(!analisisFuente||!analisisDestino) return;
 const prevF=analisisFuente.value, prevD=analisisDestino.value;
 analisisFuente.innerHTML='<option value="">— Selecciona fuente —</option>';
 analisisDestino.innerHTML='<option value="">— Selecciona destino —</option>';
 const drawnCount=drawnItems.getLayers().length;
 if(drawnCount>0){
  const gj=drawnItems.toGeoJSON(); const n=gj.features.length;
  const tipos=[...new Set(gj.features.map(f=>f.geometry.type))].join(', ');
  analisisFuente.innerHTML+=`<option value="__dibujado__">✏️ Dibujo en mapa — ${n} elemento(s) (${tipos})</option>`;
 }
 Object.entries(activeLayers).forEach(([k,entry])=>{
  if(k.startsWith('usuario_') || k.startsWith('dibujo_')){
   const n=(entry.featuresData||[]).length;
   const gt=entry.geomType||'';
   const ic=gt.includes('Point')?'●':gt.includes('Line')?'—':'▭';
   analisisFuente.innerHTML+=`<option value="${k}">${ic} ${entry.userName} — ${n} elem.</option>`;
  }
 });
 let tieneDestino=false;
 Object.entries(activeLayers).forEach(([k,entry])=>{
  if(k.startsWith('usuario_') || k.startsWith('dibujo_')) return;
  const gt=(entry.geomType||'').toLowerCase();
  if(gt.includes('point')) return;
  const n=(entry.featuresData||[]).length;
  const nombre=getNombreAmigable(k);
  analisisDestino.innerHTML+=`<option value="${k}">${nombre} — ${n} polígonos</option>`;
  tieneDestino=true;
 });
 if(!tieneDestino) analisisDestino.innerHTML+=`<option value="" disabled>(Activa una capa CONANP: ANP, ADVC, Regiones…)</option>`;
 if(prevF) analisisFuente.value=prevF;
 if(prevD) analisisDestino.value=prevD;
 const panelAnalisis=document.getElementById('analisis-panel');
 const hasFuente=drawnCount>0 || Object.keys(activeLayers).some(k=>k.startsWith('usuario_') || k.startsWith('dibujo_'));
 if(panelAnalisis) panelAnalisis.style.display=hasFuente?'flex':'none';
 validarBtnAnalizar();
}
function validarBtnAnalizar(){
 const ok=analisisFuente.value && analisisDestino.value;
 btnAnalizar.disabled=!ok;
}
if(analisisFuente) analisisFuente.addEventListener('change', validarBtnAnalizar);
if(analisisDestino) analisisDestino.addEventListener('change', validarBtnAnalizar);

function getFuenteFeatures(key){
 if(key==='__dibujado__') return drawnItems.toGeoJSON().features;
 const e=activeLayers[key]; return e? (e.featuresData||[]) : [];
}
function getFuenteNombre(key){
 if(key==='__dibujado__') return 'Polígono/Línea/Punto dibujado en el mapa';
 const e=activeLayers[key]; return e? e.userName : key;
}
function getDestinoNombre(key){ const e=activeLayers[key]; return e? (e.userName||getNombreAmigable(key)) : key; }
function fmtKm2(m2){ return fmtHa(m2); }
function fmtHa(m2){
 const ha=m2/1e4;
 return ha.toLocaleString('es-MX',{minimumFractionDigits:2, maximumFractionDigits:2})+' ha';
}
function fmtHaShort(m2){
 const ha=m2/1e4;
 if(ha>=1000) return ha.toLocaleString('es-MX',{minimumFractionDigits:0, maximumFractionDigits:0})+' ha';
 return ha.toLocaleString('es-MX',{minimumFractionDigits:2, maximumFractionDigits:2})+' ha';
}

function ejecutarAnalisis(){
 const fKey=analisisFuente.value, dKey=analisisDestino.value;
 if(!fKey||!dKey){ alert('Selecciona fuente y destino.'); return; }
 if(typeof turf==='undefined'){ alert('Turf.js no cargado. Recarga la página.'); return; }
 const fuenteFeatures=getFuenteFeatures(fKey);
 const destinoEntry=activeLayers[dKey];
 if(!fuenteFeatures.length){ alert('La fuente no tiene elementos.'); return; }
 if(!destinoEntry||!(destinoEntry.featuresData||[]).length){ alert('El destino no tiene elementos.'); return; }
 const destinoFeatures=destinoEntry.featuresData;
 const fuenteNombre=getFuenteNombre(fKey);
 const destinoNombre=getDestinoNombre(dKey);
 const fuenteTipo=fuenteFeatures[0]?.geometry?.type||'';
 const esPuntoFuente=fuenteTipo.includes('Point');
 const esLineaFuente=fuenteTipo.includes('Line');
 const esPoligonoFuente=fuenteTipo.includes('Polygon');

 const totalElem=fuenteFeatures.length;
 let totalAreaM2=0;
 fuenteFeatures.forEach(f=>{ if(f.geometry.type.includes('Polygon')){ try{ totalAreaM2+=turf.area(f); }catch(e){} }});
 const totalAreaKm2=totalAreaM2/1e6;

 const intersectIdx=new Set();
 const tocadasMap=new Map();
 let areaEnDestinoM2=0;

 fuenteFeatures.forEach((src, si)=>{
  let toca=false;
  let areaSrcEnDestino=0;
  destinoFeatures.forEach((tgt, ti)=>{
   let inter=false;
   try{
    if(esPuntoFuente){
     if(tgt.geometry.type.includes('Polygon')||tgt.geometry.type.includes('MultiPolygon')){
      inter=turf.booleanPointInPolygon(src, tgt);
      if(!inter && turf.booleanIntersects) inter=turf.booleanIntersects(src,tgt);
     }
    } else {
     if(turf.booleanIntersects) inter=turf.booleanIntersects(src, tgt);
     else inter=!!turf.intersect(src,tgt);
    }
   }catch(e){ inter=false; }
   if(inter){
    toca=true;
    if(!tocadasMap.has(ti)) tocadasMap.set(ti,{count:0, areaM2:0, feature:tgt});
    tocadasMap.get(ti).count+=1;
    if(esPoligonoFuente && (tgt.geometry.type.includes('Polygon'))){
     try{
      const interGeom=turf.intersect(src,tgt);
      if(interGeom){ const a=turf.area(interGeom); areaSrcEnDestino+=a; tocadasMap.get(ti).areaM2+=a; }
     }catch(e){}
    }
   }
  });
  if(toca){
   intersectIdx.add(si);
   areaEnDestinoM2+=areaSrcEnDestino;
  }
 });

 const enDestinoCount=intersectIdx.size;
 const pctCount=totalElem? (enDestinoCount/totalElem*100):0;
 const pctArea=totalAreaM2? (areaEnDestinoM2/totalAreaM2*100):0;
 const tocadasCount=tocadasMap.size;

 const breakdowns={};
 const camposCandidatos=['cat_manejo','categoria','tipo','region','estados','estado','municipio','orden_gob','zona','subzona','tipo_prop','propiedad'];
 const camposExistentes=camposCandidatos.filter(c=> destinoFeatures.some(f=> f.properties[c]!==undefined && f.properties[c]!=='' ));
 if(!camposExistentes.length){
  const allKeys=[...new Set(destinoFeatures.flatMap(f=>Object.keys(f.properties)))];
  for(const k of allKeys){
   const vals=new Set(destinoFeatures.map(f=> String(f.properties[k]||'').trim()).filter(v=>v));
   if(vals.size>=2 && vals.size<=12) { camposExistentes.push(k); if(camposExistentes.length>=3) break; }
  }
 }
 camposExistentes.forEach(campo=>{
  const grupos={};
  tocadasMap.forEach(({count, areaM2, feature}, ti)=>{
   const key=String(feature.properties[campo]||'Sin dato').trim()||'Sin dato';
   if(!grupos[key]) grupos[key]={count:0, areaM2:0};
   grupos[key].count+=count;
   grupos[key].areaM2+=areaM2;
  });
  const arr=Object.entries(grupos).map(([k,v])=>({key:k, count:v.count, areaM2:v.areaM2})).sort((a,b)=> (esPoligonoFuente? b.areaM2-a.areaM2 : b.count-a.count));
  if(arr.length) breakdowns[campo]=arr;
 });

 const detalleTocadas=[...tocadasMap.entries()].map(([ti, v])=>{
  const f=v.feature; const p=f.properties;
  const nombre=getFeatureName(p);
  const cat=p.cat_manejo||p.categoria||p.tipo||'';
  const extra=[p.region, p.estado, p.municipio].filter(Boolean).join(' · ');
  return {ti, nombre, categoria:cat, extra, count:v.count, areaM2:v.areaM2, props:p};
 }).sort((a,b)=> esPoligonoFuente? b.areaM2-a.areaM2 : b.count-a.count);

 const report={
  fuenteKey:fKey, destinoKey:dKey,
  fuenteNombre, destinoNombre,
  fuenteTipo, esPuntoFuente, esLineaFuente, esPoligonoFuente,
  totalElem, totalAreaM2, totalAreaKm2,
  enDestinoCount, areaEnDestinoM2, pctCount, pctArea,
  tocadasCount, tocadasMap, detalleTocadas, breakdowns,
  timestamp:new Date().toLocaleString('es-MX')
 };
 ultimoAnalisis=report;
 renderAnalisisReport(report);
 pintarAnalisisEnMapa(report, fuenteFeatures, destinoFeatures);
}

function pintarAnalisisEnMapa(report, fuenteFeatures, destinoFeatures){
 if(analisisLayer) { map.removeLayer(analisisLayer); analisisLayer=null; }
 const fuenteKey=report.fuenteKey;
 const tocadasIdx=new Set([...report.tocadasMap.keys()]);
 const fuenteIntersect=[]; const fuenteNoIntersect=[];
 fuenteFeatures.forEach((f, i)=>{
  if(report.enDestinoCount>0){
   let hit=false;
   for(const ti of tocadasIdx){
    try{ if(turf.booleanIntersects(f, destinoFeatures[ti])){ hit=true; break; } }catch(e){}
   }
   if(hit) fuenteIntersect.push(f); else fuenteNoIntersect.push(f);
  } else {
   fuenteNoIntersect.push(f);
  }
 });
 const grp=L.featureGroup();
 if(fuenteNoIntersect.length) L.geoJSON({type:'FeatureCollection', features:fuenteNoIntersect}, {style:{color:'#9aa0a6', weight:1.5, opacity:0.5, fillColor:'#9aa0a6', fillOpacity:0.08}, pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5, fillColor:'#9aa0a6', color:'#9aa0a6', fillOpacity:0.5})}).addTo(grp);
 if(fuenteIntersect.length) L.geoJSON({type:'FeatureCollection', features:fuenteIntersect}, {style:{color:'#1a5c4e', weight:2, opacity:0.95, fillColor:'#1a5c4e', fillOpacity:0.32}, pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:6, fillColor:'#1a5c4e', color:'#fff', weight:1.5, fillOpacity:0.95})}).addTo(grp);
 const tocadasFeatures=[...tocadasIdx].map(i=>destinoFeatures[i]);
 if(tocadasFeatures.length) L.geoJSON({type:'FeatureCollection', features:tocadasFeatures}, {style:{color:'#6B1132', weight:2.2, opacity:0.9, fill:false, dashArray:'4,4'}}).addTo(grp);
 grp.addTo(map);
 analisisLayer=grp;
 try{ map.fitBounds(grp.getBounds(),{padding:[20,20], maxZoom:14}); }catch(e){}
}

function renderAnalisisReport(r){
 const titleEl=document.getElementById('analisis-title');
 const subEl=document.getElementById('analisis-subtitle');
 const kpisEl=document.getElementById('analisis-kpis');
 const gridEl=document.getElementById('analisis-grid');
 const detalleEl=document.getElementById('analisis-detalle');
 const filtrosEl=document.getElementById('analisis-filtros');

 const pctMostrar=r.esPoligonoFuente? r.pctArea.toFixed(1)+'%' : r.pctCount.toFixed(1)+'%';
 const tocadasTxt=r.tocadasCount? (r.tocadasCount+' '+ (r.destinoNombre.includes('ANP')?'ANP': r.destinoNombre.split(' ')[0])) : '0';
 titleEl.innerHTML=`Análisis — ${tocadasTxt} · ${pctMostrar} en ${r.destinoNombre.split('—')[0].trim()} <small>${r.fuenteNombre} vs ${r.destinoNombre} · ${r.timestamp}</small>`;
 if(subEl) subEl.textContent='';

 let kpiHtml='';
 kpiHtml+=`<div class="analisis-kpi fuente"><span class="kpi-lbl">Fuente</span><span class="kpi-val" style="font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.fuenteNombre}</span><span class="kpi-sub">${r.fuenteTipo}</span></div>`;
 kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">Elementos</span><span class="kpi-val">${r.totalElem.toLocaleString('es-MX')}</span><span class="kpi-sub">en fuente</span></div>`;
 if(r.esPoligonoFuente){
  kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">Polígonos</span><span class="kpi-val">${r.totalElem.toLocaleString('es-MX')}</span><span class="kpi-sub">fuente</span></div>`;
  kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">Superficie de la fuente (total)</span><span class="kpi-val">${fmtHa(r.totalAreaM2)}</span><span class="kpi-sub">hectáreas</span></div>`;
  kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">Superficie dentro de ANP</span><span class="kpi-val">${fmtHa(r.areaEnDestinoM2)}</span><span class="kpi-sub">${r.pctArea.toFixed(1)}% del total</span></div>`;
 } else {
  kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">En ANP</span><span class="kpi-val">${r.enDestinoCount.toLocaleString('es-MX')}</span><span class="kpi-sub">${r.pctCount.toFixed(1)}% del total</span></div>`;
  kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">Fuera</span><span class="kpi-val">${(r.totalElem - r.enDestinoCount).toLocaleString('es-MX')}</span><span class="kpi-sub">elementos</span></div>`;
 }
 kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">ANP dentro de la fuente</span><span class="kpi-val">${r.tocadasCount.toLocaleString('es-MX')}</span><span class="kpi-sub">de ${(activeLayers[r.destinoKey].featuresData||[]).length.toLocaleString('es-MX')}</span></div>`;
 const pctVal=r.esPoligonoFuente? r.pctArea.toFixed(1)+'%' : r.pctCount.toFixed(1)+'%';
 kpiHtml+=`<div class="analisis-kpi"><span class="kpi-lbl">% en ANP</span><span class="kpi-val">${pctVal}</span><span class="kpi-sub">${r.enDestinoCount.toLocaleString('es-MX')} / ${r.totalElem.toLocaleString('es-MX')}</span></div>`;
 kpisEl.innerHTML=kpiHtml;

 const campos=Object.keys(r.breakdowns);
 let filtrosHtml='<button class="active" data-campo="todas">Todas</button>';
 campos.forEach(c=>{ const lbl=c.replace(/_/g,' '); filtrosHtml+=`<button data-campo="${c}">${lbl}</button>`; });
 filtrosEl.innerHTML=filtrosHtml;
 filtrosEl.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click',()=>{
   filtrosEl.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
   btn.classList.add('active');
   renderDesglose(r, btn.dataset.campo);
  });
 });
 renderDesglose(r, 'todas');

 let detHtml='<div class="analisis-detalle"><h4>'+r.fuenteNombre+' · '+fmtHa(r.totalAreaM2||0)+' <span class="d-badge">'+pctVal+' en '+r.destinoNombre.split(' ')[0].trim()+'</span></h4>';
 if(!r.detalleTocadas.length){
  detHtml+='<p style="font-size:0.6rem;color:var(--text-muted);padding:0.4rem 0">Ningún elemento de la fuente intersecta con el destino.</p>';
 } else {
  r.detalleTocadas.slice(0,25).forEach(d=>{
   const areaTxt=r.esPoligonoFuente? fmtHa(d.areaM2) : d.count.toLocaleString('es-MX')+' elem.';
   const pctTxt=r.esPoligonoFuente && r.areaEnDestinoM2? (d.areaM2/r.areaEnDestinoM2*100).toFixed(1)+'%' : '';
   detHtml+=`<div class="detalle-item"><div class="d-nombre"><b>${d.nombre}</b><small>${d.categoria? d.categoria+' · ':''}${d.extra}</small></div><div class="d-meta"><b>${areaTxt}</b><small style="display:block;color:var(--text-muted);font-size:0.54rem">${pctTxt}</small></div></div>`;
  });
  if(r.detalleTocadas.length>25) detHtml+=`<small style="font-size:0.55rem;color:var(--text-muted)">Mostrando 25 de ${r.detalleTocadas.length} entidades tocadas.</small>`;
 }
 detHtml+='</div>';
 detalleEl.innerHTML=detHtml;

 try{
  const destinoCorto=r.destinoNombre.split(' ')[0];
  const printMeta=document.getElementById('print-meta');
  if(printMeta) printMeta.innerHTML=`<b>Fuente:</b> ${r.fuenteNombre} — ${r.totalElem.toLocaleString('es-MX')} elem. · ${fmtHa(r.totalAreaM2)} &nbsp;|&nbsp; <b>Destino:</b> ${r.destinoNombre} — ${r.tocadasCount.toLocaleString('es-MX')} tocadas · ${pctVal} en ${destinoCorto}<br><b>Fecha:</b> ${r.timestamp} · ${r.fuenteTipo}`;
  const printKpis=document.getElementById('print-kpis');
  if(printKpis){
   printKpis.innerHTML=`
    <div style="text-align:center; padding:6px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:6px;"><div style="font-size:6.5pt; color:#6b7280; text-transform:uppercase; font-weight:700;">Superficie total</div><div style="font-size:9pt; font-weight:800; color:#6B1132;">${fmtHa(r.totalAreaM2)}</div></div>
    <div style="text-align:center; padding:6px; background:#f0fdfa; border:1px solid #a7f3d0; border-radius:6px;"><div style="font-size:6.5pt; color:#065f46; text-transform:uppercase; font-weight:700;">Superficie dentro de ANP</div><div style="font-size:9pt; font-weight:800; color:#065f46;">${r.esPoligonoFuente? fmtHa(r.areaEnDestinoM2) : r.enDestinoCount.toLocaleString('es-MX')}</div><div style="font-size:5.5pt; color:#047857;">${pctVal}</div></div>
    <div style="text-align:center; padding:6px; background:#fef2f2; border:1px solid #fecaca; border-radius:6px;"><div style="font-size:6.5pt; color:#7f1d1d; text-transform:uppercase; font-weight:700;">ANP dentro de la fuente</div><div style="font-size:9pt; font-weight:800; color:#7f1d1d;">${r.tocadasCount.toLocaleString('es-MX')}</div></div>
    <div style="text-align:center; padding:6px; background:#fffbeb; border:1px solid #fde68a; border-radius:6px;"><div style="font-size:6.5pt; color:#92400e; text-transform:uppercase; font-weight:700;">Elementos</div><div style="font-size:9pt; font-weight:800; color:#92400e;">${r.totalElem.toLocaleString('es-MX')}</div></div>`;
  }
  const printLegend=document.getElementById('print-legend');
  if(printLegend){
   let leg=`<div style="font-weight:700; color:#6B1132; margin-bottom:4px; font-size:7pt;">Simbología</div>`;
   leg+=`<div style="display:flex; align-items:center; gap:6px; margin-bottom:3px;"><span style="width:12px; height:7px; background:#1a5c4e; opacity:0.85; display:inline-block; border:1px solid #1a5c4e; border-radius:2px;"></span> Fuente: ${r.fuenteNombre} (${r.fuenteTipo})</div>`;
   leg+=`<div style="display:flex; align-items:center; gap:6px;"><span style="width:12px; height:7px; border:1.5px dashed #6B1132; background:transparent; display:inline-block; border-radius:2px;"></span> ${r.destinoNombre} tocadas (${r.tocadasCount.toLocaleString('es-MX')})</div>`;
   printLegend.innerHTML=leg;
  }
  const pd=document.getElementById('print-date'); if(pd) pd.textContent=r.timestamp;
 }catch(e){}

  lastActiveBeforeAnalisis=document.activeElement;
  analisisOverlay.classList.add('active');
  analisisOverlay.setAttribute('aria-modal','true'); analisisOverlay.setAttribute('role','dialog');
  document.body.style.overflow='hidden';
  try{ document.getElementById('analisis-close')?.focus(); }catch(e){}
  analisisOverlay._trapHandler=function(e){
   if(e.key==='Tab'){
    const focusable=[...analisisOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled && el.offsetParent!==null);
    if(!focusable.length) return;
    const first=focusable[0], last=focusable[focusable.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
   }
  };
  analisisOverlay.addEventListener('keydown', analisisOverlay._trapHandler);
}

function renderDesglose(r, campo){
 const gridEl=document.getElementById('analisis-grid');
 gridEl.innerHTML='';
 const toShow=campo==='todas'? Object.entries(r.breakdowns).slice(0,6) : [[campo, r.breakdowns[campo]]].filter(x=>x[1]);
 if(!toShow.length){
  gridEl.innerHTML='<div class="analisis-card" style="grid-column:span 2"><p style="font-size:0.6rem;color:var(--text-muted)">Sin desglose disponible para esta capa.</p></div>';
  return;
 }
 toShow.forEach(([campoNombre, arr])=>{
  const maxVal=Math.max(...arr.map(a=> r.esPoligonoFuente? a.areaM2 : a.count), 1);
  let html=`<div class="analisis-card"><h4>Por ${campoNombre.replace(/_/g,' ')} <button data-campo="${campoNombre}" onclick="descargarDesgloseCSV('${campoNombre}')"><i class='fas fa-file-csv'></i> CSV</button></h4>`;
  arr.slice(0,6).forEach(item=>{
   const val=r.esPoligonoFuente? item.areaM2 : item.count;
   const pct=(val/maxVal*100).toFixed(0);
   const valTxt=r.esPoligonoFuente? fmtKm2(item.areaM2) : item.count+' elem.';
   html+=`<div class="bar-row"><span class="bar-lbl" title="${item.key}">${item.key}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span><span class="bar-val">${valTxt} · ${pct}%</span></div>`;
  });
  html+='</div>';
  gridEl.innerHTML+=html;
 });
}

function descargarDesgloseCSV(campo){
 if(!ultimoAnalisis || !ultimoAnalisis.breakdowns[campo]) return;
 const arr=ultimoAnalisis.breakdowns[campo];
 const esPoly=ultimoAnalisis.esPoligonoFuente;
 let csv='Categoria,Conteo,Area_m2,Area_km2\n';
 arr.forEach(a=>{ csv+=`"${a.key.replace(/"/g,'""')}",${a.count},${a.areaM2},${a.areaM2/1e6}\n`;});
 const b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
 const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`desglose_${campo}_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
function descargarAnalisisCSV(){
 if(!ultimoAnalisis) return;
 const r=ultimoAnalisis;
 let csv='KPI,Valor\n';
 csv+=`Fuente,"${r.fuenteNombre}"\n`;
 csv+=`Destino,"${r.destinoNombre}"\n`;
 csv+=`Total elementos,${r.totalElem}\n`;
 csv+=`Superficie total m2,${r.totalAreaM2}\n`;
 csv+=`En destino (conteo),${r.enDestinoCount}\n`;
 csv+=`En destino area m2,${r.areaEnDestinoM2}\n`;
 csv+=`% en destino,${r.esPoligonoFuente? r.pctArea : r.pctCount}\n`;
 csv+=`Tocadas,${r.tocadasCount}\n`;
 csv+='\nDetalle tocadas\n';
 csv+='Nombre,Categoria,Extra,Count,Area_m2\n';
 r.detalleTocadas.forEach(d=>{ csv+=`"${d.nombre.replace(/"/g,'""')}","${(d.categoria||'').replace(/"/g,'""')}","${d.extra.replace(/"/g,'""')}",${d.count},${d.areaM2}\n`;});
 const b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
 const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`analisis_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
async function descargarAnalisisPDF(){
 if(!ultimoAnalisis) return;
 const loadingEl=document.getElementById('print-loading'); if(loadingEl) loadingEl.style.display='flex';
  try{
  await new Promise(r=> setTimeout(r, 80));
  const r=ultimoAnalisis;
  const destinoCorto=r.destinoNombre.split(' ')[0];
  const {doc}=generarPDFBase('Geovisor CONANP');
  doc.setFillColor(26,92,78); doc.rect(0,22,210,4,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text(`Análisis · ${r.tocadasCount.toLocaleString('es-MX')} ${destinoCorto} · ${(r.esPoligonoFuente?r.pctArea:r.pctCount).toFixed(1)}% en ${destinoCorto}`, 10, 21);
  doc.setFontSize(6); doc.setFont('helvetica','normal');
  doc.text(`${r.fuenteNombre} vs ${r.destinoNombre} · ${r.timestamp} · ${r.fuenteTipo}`, 110, 21);

  async function chartImage(labels, values, colors, type='bar'){
  return new Promise(res=>{
   const isDough=type==='doughnut';
   const cv=document.createElement('canvas');
   cv.width=isDough? 320 : 520;
   cv.height=isDough? 320 : 220;
   cv.style.position='absolute'; cv.style.left='-9999px'; document.body.appendChild(cv);
   const ctx=cv.getContext('2d');
   const opts={responsive:false, animation:false, plugins:{legend:{display: isDough?{position:'bottom', labels:{font:{size:9}, boxWidth:12}} : false}, tooltip:{enabled:false}}, scales:{}};
   if(type==='bar'){
    opts.scales={y:{beginAtZero:true, ticks:{font:{size:9}, callback:v=>v.toLocaleString('es-MX')}}, x:{ticks:{font:{size:8}, maxRotation:30}}};
   } else if(isDough){
    opts.cutout='62%';
    opts.plugins.legend={display:true, position:'bottom', labels:{font:{size:9}, boxWidth:12, padding:12}};
   }
   const ch=new Chart(ctx,{type, data:{labels, datasets:[{data:values, backgroundColor:colors, borderWidth:isDough?2:1, borderColor:'rgba(255,255,255,0.9)', hoverOffset:2}]}, options:opts});
   setTimeout(()=>{ const u=cv.toDataURL('image/png'); ch.destroy(); document.body.removeChild(cv); res(u); }, 380);
  });
 }

 doc.setFillColor(107,17,50); doc.rect(0,0,210,26,'F');
 doc.setFillColor(26,92,78); doc.rect(0,24,210,2,'F');
 doc.setTextColor(255,255,255);
 doc.setFontSize(12); doc.setFont('helvetica','bold');
 doc.text('Geovisor CONANP', 10, 10);
 doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(255,255,255);
 doc.text('Comisión Nacional de Áreas Naturales Protegidas · Gobierno de México', 10, 14);
 doc.setFontSize(8); doc.setFont('helvetica','bold');
 doc.text(`Análisis · ${r.tocadasCount.toLocaleString('es-MX')} ${destinoCorto} · ${(r.esPoligonoFuente?r.pctArea:r.pctCount).toFixed(1)}% en ${destinoCorto}`, 10, 21);
 doc.setFontSize(6); doc.setFont('helvetica','normal');
 doc.text(`${r.fuenteNombre} vs ${r.destinoNombre} · ${r.timestamp} · ${r.fuenteTipo}`, 110, 21);

   let y=28;
   // Encuadrar la fuente antes de capturar para que el contenido
   // relevante quede centrado en el recorte cuadrado del PDF
   try{
    if(r.fuenteBounds && r.fuenteBounds.isValid){
     await encuadrarRectangulo(r.fuenteBounds);
    } else if(r.fuenteFeature){
     var fb=L.geoJSON(r.fuenteFeature).getBounds();
     if(fb.isValid()) await encuadrarRectangulo(fb);
    }
   }catch(e){ console.warn('encuadre análisis fallo', e); }
   await esperarVistaEstable(4500);
   let imgData=null;
   try{ imgData=await capturarMapa(map.getContainer()); }catch(e){ console.warn('capturarMapa fallo',e); }
  if(!imgData) imgData=placeholderDataURLSquare('Mapa análisis');
  {
   const pw=132, ph=132;
   const x=(210-pw)/2;
   doc.setDrawColor(107,17,50); doc.setLineWidth(0.7); doc.rect(x, y, pw, ph, 'S');
   doc.addImage(imgData, 'PNG', x, y, pw, ph);
   doc.setFillColor(255,255,255); doc.setDrawColor(180,180,180);
   doc.rect(x+2, y+ph-7, 18, 5, 'FD');
   doc.setTextColor(60,60,60); doc.setFontSize(4); doc.text('CONANP', x+3, y+ph-4);
   y+=ph+6;
  }

 const kpiY=y;
 const boxW=45, boxH=22, gap=3.5;
 const kpisVis=[
  {lbl:'Fuente', val:r.fuenteNombre.substring(0,18), sub:r.fuenteTipo, col:[107,17,50]},
  {lbl:'Elementos', val:r.totalElem.toLocaleString('es-MX'), sub:'en fuente', col:[26,92,78]},
  ...(r.esPoligonoFuente?[
   {lbl:'Superficie de la fuente (total)', val:fmtHa(r.totalAreaM2), sub:'hectáreas', col:[124,26,58]},
   {lbl:'Superficie dentro de ANP', val:fmtHa(r.areaEnDestinoM2), sub:r.pctArea.toFixed(1)+'% del total', col:[45,122,106]}
  ]:[
   {lbl:'En ANP', val:r.enDestinoCount.toLocaleString('es-MX'), sub:r.pctCount.toFixed(1)+'% del total', col:[45,122,106]},
   {lbl:'Fuera', val:(r.totalElem-r.enDestinoCount).toLocaleString('es-MX'), sub:'elementos', col:[120,120,120]}
  ]),
  {lbl:'ANP dentro de la fuente', val:r.tocadasCount.toLocaleString('es-MX'), sub:'de '+(activeLayers[r.destinoKey].featuresData||[]).length.toLocaleString('es-MX'), col:[107,17,50]},
  {lbl:'% en ANP', val:(r.esPoligonoFuente?r.pctArea:r.pctCount).toFixed(1)+'%', sub:r.enDestinoCount.toLocaleString('es-MX')+' / '+r.totalElem.toLocaleString('es-MX'), col:[26,92,78]}
 ];
 let cx=10, cy=kpiY;
 kpisVis.slice(0,6).forEach((k,i)=>{
  if(i>0 && i%3===0){ cx=10; cy+=boxH+gap; }
  doc.setFillColor(248,249,250); doc.setDrawColor(220,220,220);
  doc.roundedRect(cx, cy, boxW, boxH, 2, 2, 'FD');
  doc.setFillColor(k.col[0],k.col[1],k.col[2]); doc.rect(cx, cy, boxW, 2.5, 'F');
  doc.setTextColor(100,100,100); doc.setFontSize(5); doc.setFont('helvetica','bold');
  doc.text(k.lbl.toUpperCase(), cx+2, cy+6);
  doc.setTextColor(20,20,20); doc.setFontSize(11); doc.setFont('helvetica','bold');
  const vals=k.val.length>14? k.val.substring(0,14):k.val;
  doc.text(vals, cx+2, cy+13);
  doc.setFontSize(5.5); doc.setFont('helvetica','normal'); doc.setTextColor(90,90,90);
  doc.text(k.sub, cx+2, cy+17);
  cx+=boxW+gap;
 });
 y=cy+boxH+4;

 doc.setFillColor(245,247,248); doc.setDrawColor(220,220,220);
 doc.roundedRect(10, y, 190, 18, 2, 2, 'FD');
 doc.setTextColor(107,17,50); doc.setFontSize(6); doc.setFont('helvetica','bold');
 doc.text('Simbología', 12, y+4);
 doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60); doc.setFontSize(6);
 doc.setFillColor(26,92,78); doc.rect(12, y+7, 5, 3, 'F');
 doc.text(`Fuente: ${r.fuenteNombre} (${r.fuenteTipo})`, 18, y+9);
 doc.setDrawColor(107,17,50); doc.setLineWidth(0.4); doc.rect(12, y+11, 5, 3, 'S');
 doc.setFillColor(255,255,255); doc.rect(12, y+11, 5, 3, 'FD');
 doc.text(`Tocadas: ${r.destinoNombre} (${r.tocadasCount.toLocaleString('es-MX')})`, 18, y+13);
 doc.setFontSize(5); doc.setTextColor(110,110,110);
 doc.text('Base: ESRI Topográfico · Proyección: WGS84', 140, y+13);
 y+=20;

 doc.setTextColor(100,100,100); doc.setFontSize(6);
 doc.text('Página 1/2 · Mapa, KPIs y simbología', 10, 292);
 doc.text('CONANP · Geovisor', 195, 292, {align:'right'});

 doc.addPage();
 y=10;
 doc.setFillColor(107,17,50); doc.rect(0,0,210,10,'F');
 doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
 doc.text('Desglose y detalle del análisis', 10, 6.5);
 doc.setTextColor(30,30,30);
 y=16;

 let chartY=y;
 try{
  const pct=r.esPoligonoFuente? r.pctArea : r.pctCount;
  const doughUrl=await chartImage(['En ANP','Fuera'], [pct, 100-pct], ['#6B1132','#dde3ea'], 'doughnut');
  if(doughUrl) doc.addImage(doughUrl, 'PNG', 10, chartY, 42, 42);
  doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(60,60,60);
  doc.text('% en ANP', 12, chartY+45);
  doc.setFont('helvetica','normal'); doc.setFontSize(6);
  doc.text(`${pct.toFixed(1)}% dentro · ${(100-pct).toFixed(1)}% fuera`, 12, chartY+48);
 }catch(e){}
 try{
  const firstCampo=Object.keys(r.breakdowns)[0];
  if(firstCampo){
   const arr=r.breakdowns[firstCampo].slice(0,4);
   const labels=arr.map(a=> a.key.length>14? a.key.substring(0,14):a.key);
   const vals=arr.map(a=> r.esPoligonoFuente? a.areaM2/1e4 : a.count);
   const cols=labels.map((_,i)=> ['#6B1132','#1a5c4e','#8a1a3a','#2d7a6a'][i%4]);
   const barUrl=await chartImage(labels, vals, cols, 'bar');
   if(barUrl) doc.addImage(barUrl, 'PNG', 58, chartY, 132, 52);
  }
 }catch(e){}
 y=chartY+56;

 doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(107,17,50);
 doc.text('Desglose por atributos del destino',10,y); y+=5;
 doc.setFont('helvetica','normal'); doc.setFontSize(6);
 let shown=0;
 for(const [campo, arr] of Object.entries(r.breakdowns).slice(0,3)){
  if(y>232){ doc.addPage(); y=14; }
  const colW=[92, 42, 28]; const x0=10; const rowH=6;
  doc.setFillColor(107,17,50); doc.setTextColor(255,255,255); doc.setFontSize(6); doc.setFont('helvetica','bold');
  doc.rect(x0, y, 190, rowH, 'F');
  doc.text(`Por ${campo.replace(/_/g,' ')}`.toUpperCase(), x0+2, y+4);
  doc.setFontSize(5.5); doc.text(r.esPoligonoFuente?'Hectáreas':'Conteo', x0+colW[0]+4, y+4);
  doc.text('%', x0+colW[0]+colW[1]+6, y+4);
  y+=rowH;
  doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30); doc.setFontSize(6);
  arr.slice(0,4).forEach((a,i)=>{
   if(y>278){ doc.addPage(); y=14; }
   const isAlt=i%2===0;
   if(isAlt){ doc.setFillColor(248,249,250); doc.rect(x0, y, 190, rowH, 'F'); }
   doc.setDrawColor(220,220,220); doc.rect(x0, y, 190, rowH, 'S');
   doc.setTextColor(30,30,30);
   const pct=(r.esPoligonoFuente? a.areaM2/r.areaEnDestinoM2*100 : a.count/r.enDestinoCount*100).toFixed(1)+'%';
   const valTxt=r.esPoligonoFuente? fmtHa(a.areaM2) : a.count.toLocaleString('es-MX')+' elem.';
   const catTxt=a.key.length>32? a.key.substring(0,32)+'…':a.key;
   doc.text(catTxt, x0+2, y+4);
   doc.text(valTxt, x0+colW[0]+4, y+4);
   doc.text(pct, x0+colW[0]+colW[1]+6, y+4);
   const barW=18; const barX=x0+colW[0]+colW[1]+14;
   doc.setFillColor(220,220,220); doc.rect(barX, y+1.5, barW, 3, 'F');
   doc.setFillColor(107,17,50); doc.rect(barX, y+1.5, barW*parseFloat(pct)/100, 3, 'F');
   y+=rowH;
  });
  y+=3; shown++;
  if(shown>=3) break;
 }
 if(r.detalleTocadas.length){
  if(y>228){ doc.addPage(); y=14; }
  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(107,17,50);
  doc.text(`Detalle — ANP dentro de la fuente (top 10)`,10,y); y+=5;
  const dColW=[78, 42, 38, 22]; const dx0=10; const drH=6;
  doc.setFillColor(107,17,50); doc.setTextColor(255,255,255); doc.setFontSize(5.5); doc.setFont('helvetica','bold');
  doc.rect(dx0, y, 190, drH, 'F');
  doc.text('ANP', dx0+2, y+4);
  doc.text('Categoría', dx0+dColW[0]+2, y+4);
  doc.text(r.esPoligonoFuente?'Superficie':'Conteo', dx0+dColW[0]+dColW[1]+2, y+4);
  doc.text('%', dx0+dColW[0]+dColW[1]+dColW[2]+2, y+4);
  y+=drH;
  doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30); doc.setFontSize(5.8);
  r.detalleTocadas.slice(0,10).forEach((d,i)=>{
   if(y>278){ doc.addPage(); y=14; }
   if(i%2===0){ doc.setFillColor(248,249,250); doc.rect(dx0, y, 190, drH, 'F'); }
   doc.setDrawColor(220,220,220); doc.rect(dx0, y, 190, drH, 'S');
   const nm=d.nombre.length>28? d.nombre.substring(0,28)+'…':d.nombre;
   const cat=(d.categoria||'—').length>14? d.categoria.substring(0,14):(d.categoria||'—');
   const val=r.esPoligonoFuente? fmtHa(d.areaM2) : d.count.toLocaleString('es-MX');
   const pct=r.esPoligonoFuente && r.areaEnDestinoM2? (d.areaM2/r.areaEnDestinoM2*100).toFixed(1)+'%' : '';
   doc.text(nm, dx0+2, y+4);
   doc.text(cat, dx0+dColW[0]+2, y+4);
   doc.text(val, dx0+dColW[0]+dColW[1]+2, y+4);
   doc.text(pct, dx0+dColW[0]+dColW[1]+dColW[2]+2, y+4);
   y+=drH;
  });
  y+=2;
 }
 doc.setFontSize(5.5); doc.setTextColor(80,60,0);
 const disc='Información de carácter informativo. Los resultados aquí presentados no constituyen un dictamen técnico. Para ANP federales, consultar la página oficial de la Comisión Nacional de Áreas Naturales Protegidas (CONANP). La CONANP no se hace responsable del uso que el usuario le dé a los datos.';
 const lines=doc.splitTextToSize(disc, 190);
 if(y+lines.length*2.8+14>285){ doc.addPage(); y=14; } else { y+=4; }
 doc.setFillColor(255,251,235); doc.rect(8, y-3, 194, lines.length*2.8+6, 'F');
 doc.setDrawColor(251,191,36); doc.rect(8, y-3, 194, lines.length*2.8+6, 'S');
 doc.setTextColor(80,60,0);
 doc.text(lines, 10, y); y+=lines.length*2.8+8;
 doc.setTextColor(100,100,100); doc.setFontSize(5.5);
 doc.text(`Generado: ${r.timestamp} · Geovisor CONANP · ${r.fuenteNombre} vs ${r.destinoNombre}`,10,292);
 doc.text('Página 2/2 · KPIs, gráficos y desglose', 10, 286);
 doc.save(`analisis_CONANP_${Date.now()}.pdf`);
  }catch(e){ console.error('descargarAnalisisPDF error',e);
    try{
      const {doc:fb}=generarPDFBase('Geovisor CONANP — Análisis (parcial)');
      fb.setFontSize(7); fb.setTextColor(200,0,0);
      fb.text('Error al generar PDF de análisis: '+(e.message||e),10,30);
      fb.setFontSize(6); fb.setTextColor(60,60,60);
      fb.text('Se generó un PDF parcial. Intente de nuevo con el mapa visible.',10,36);
      fb.save(`analisis_CONANP_${Date.now()}_parcial.pdf`);
    }catch(e2){ alert('Error al generar PDF: '+(e.message||e)); }
  }
  finally{ if(loadingEl) loadingEl.style.display='none'; }
}

function cerrarAnalisisOverlay(){
 analisisOverlay.classList.remove('active'); analisisOverlay.removeAttribute('aria-modal');
 document.body.style.overflow='';
 if(analisisOverlay._trapHandler){ analisisOverlay.removeEventListener('keydown', analisisOverlay._trapHandler); analisisOverlay._trapHandler=null; }
 try{ if(lastActiveBeforeAnalisis && lastActiveBeforeAnalisis.focus) lastActiveBeforeAnalisis.focus(); }catch(e){}
 lastActiveBeforeAnalisis=null;
}
document.getElementById('analisis-close')?.addEventListener('click', cerrarAnalisisOverlay);
analisisOverlay?.addEventListener('click',e=>{ if(e.target===analisisOverlay){ cerrarAnalisisOverlay(); }});
document.getElementById('analisis-ver-mapa')?.addEventListener('click',()=>{
 if(analisisLayer) try{ map.fitBounds(analisisLayer.getBounds(),{padding:[20,20]});}catch(e){}
 cerrarAnalisisOverlay();
});
document.getElementById('analisis-quitar')?.addEventListener('click',()=>{
 if(analisisLayer){ map.removeLayer(analisisLayer); analisisLayer=null; }
 ultimoAnalisis=null;
 cerrarAnalisisOverlay();
});
document.getElementById('analisis-pdf')?.addEventListener('click', descargarAnalisisPDF);
document.getElementById('analisis-csv')?.addEventListener('click', descargarAnalisisCSV);
if(btnAnalizar) btnAnalizar.addEventListener('click', ejecutarAnalisis);
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ if(modalOverlay && modalOverlay.classList.contains('active')) closeModal(); if(analisisOverlay && analisisOverlay.classList.contains('active')){ cerrarAnalisisOverlay(); } } });

const _origActualizarLeyenda=actualizarLeyenda;
actualizarLeyenda=function(){ _origActualizarLeyenda(); actualizarSelectoresAnalisis(); };
map.on(L.Draw.Event.CREATED, ()=> setTimeout(actualizarSelectoresAnalisis, 200));
map.on(L.Draw.Event.DELETED, ()=> setTimeout(actualizarSelectoresAnalisis, 200));
map.on(L.Draw.Event.EDITED, ()=> setTimeout(actualizarSelectoresAnalisis, 200));
drawnItems.on('layeradd', ()=> setTimeout(actualizarSelectoresAnalisis, 200));
drawnItems.on('layerremove', ()=> setTimeout(actualizarSelectoresAnalisis, 200));
setTimeout(actualizarSelectoresAnalisis, 1500);

// ================================================================
// INIT TEMA
// ================================================================
aplicarTema(temaActualUI(),false);
document.getElementById('theme-toggle').addEventListener('click',()=>aplicarTema(temaActualUI()==='dark'?'light':'dark'));

// ================================================================
// MÓDULO 1: DETECCIÓN DE SCROLL EN DASHBOARD (MÓVIL)
// ================================================================
function initDashboardScrollHint() {
  const dashContainer = document.getElementById('dashboard-container');
  const hint = document.getElementById('dashboard-scroll-hint');
  if (!dashContainer || !hint) return;
  const isMobile = window.innerWidth <= 480;
  if (!isMobile) {
    hint.style.display = 'none';
    return;
  }
  const fusedash = dashContainer.querySelector('.dashboard-fusedash');
  if (!fusedash) return;
  const updateHintVisibility = () => {
    const isAtEnd = fusedash.scrollLeft + fusedash.clientWidth >= fusedash.scrollWidth - 10;
    if (isAtEnd) hint.classList.add('hidden');
    else hint.classList.remove('hidden');
  };
  setTimeout(() => {
    if (fusedash.scrollWidth > fusedash.clientWidth) {
      hint.style.display = 'flex';
      updateHintVisibility();
    }
  }, 300);
  fusedash.addEventListener('scroll', updateHintVisibility);
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 480) {
      if (fusedash.scrollWidth > fusedash.clientWidth) {
        hint.style.display = 'flex';
        updateHintVisibility();
      }
    } else {
      hint.style.display = 'none';
    }
  });
}

// ================================================================
// MÓDULO 2: IMPRESIÓN MEJORADA Y ROBUSTA
// ================================================================
function showStatus(msg, type) {
  const s = document.getElementById('status');
  if (s) { s.textContent = msg; s.className = type || ''; }
}
function validateElementVisible(el) {
  if (!el) return false;
  try {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < window.innerHeight;
  } catch (e) { return false; }
}
async function captureWithTimeout(fn, timeoutMs, fallbackData) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs || 3000))
  ]).catch(err => { console.warn('Captura falló:', err.message); return fallbackData || null; });
}
async function captureDashboardMap() {
  const mapEl = document.getElementById('map-dashboard');
  if (!mapEl || !validateElementVisible(mapEl)) {
    return placeholderDataURLSquare('Mapa no visible');
  }
    /* html2canvas primero: captura lo que se ve. */
  try{
    const r = await captureWithTimeout(() => html2canvas(mapEl, { useCORS: true, allowTaint: true, backgroundColor: '#e8edf2', scale: 2, logging: false, imageTimeout: 0 }), 5000, null);
    if (r && r.width > 50) return await canvasToSquareDataURL(r);
  }catch(e){ console.warn('Dashboard html2canvas fallo', e); }
  if (typeof domtoimage !== 'undefined' && domtoimage.toPng) {
    const r = await captureWithTimeout(() => domtoimage.toPng(mapEl, { bgcolor: '#e8edf2', cacheBust: true }), 2000, null);
    if (r && r.length > 1000) return await dataURLToSquareDataURL(r);
  }
  if (typeof domtoimage !== 'undefined' && domtoimage.toCanvas) {
    const r = await captureWithTimeout(() => domtoimage.toCanvas(mapEl, { bgcolor: '#e8edf2' }), 2000, null);
    if (r) return await canvasToSquareDataURL(r);
  }
  if (typeof html2canvas !== 'undefined') {
    const r = await captureWithTimeout(() => html2canvas(mapEl, { useCORS: true, allowTaint: true, backgroundColor: '#e8edf2', scale: 1, logging: false }), 2500, null);
    if (r) return await canvasToSquareDataURL(r);
  }
  console.warn('Todas las estrategias de captura fallaron');
  return placeholderDataURLSquare('Mapa no disponible');
}

// ================================================================
// Impresión homologada (General/ADVC/rectángulo) + especificaciones
// ================================================================
// printAreaBounds/Layer movidos arriba junto a filtrosPorCapa
function etiquetaCortaCapa(key){
 const l=String(key||'').toLowerCase();
 if(l.startsWith('usuario_')||l.startsWith('dibujo_'))return'Capas de usuario';
 if(l.includes('zp_anp'))return'Zonas núcleo';
 if(l.includes('reg_conanp'))return'Regiones CONANP';
 if(l.includes('shp_anp'))return'ANP';
 if(l.includes('shp_advc'))return'ADVC';
 if(l.includes('ramsar'))return'Sitios RAMSAR';
 if(l.includes('kba'))return'KBA';
 if(l.includes('unescomab'))return'UNESCO MaB';
 if(l.includes('unescopatrimonio'))return'Patrimonio UNESCO';
 if(l.includes('00ent'))return'Límite estatal';
 if(l.includes('00mun'))return'Límite municipal';
 return getNombreAmigable(key);
}
function featuresEnArea(feats,bounds){
 if(!feats||!feats.length)return[];
 if(!bounds) return feats;
 return feats.filter(f=>{ try{ return bounds.intersects(L.geoJSON(f).getBounds()); }catch(e){ return true; } });
}
function tituloSeccionPDF(doc,texto,y){
 if(y>272){ doc.addPage(); y=14; }
 doc.setFillColor(107,17,50); doc.rect(10,y,190,7,'F');
 doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
 doc.text(texto,12,y+5);
 return y+10;
}
function dibujarSpecsPDF(doc,y,view){
 if(y>235){ doc.addPage(); y=14; }
 doc.setFillColor(107,17,50); doc.rect(10,y,190,7,'F');
 doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
 doc.text('Especificaciones cartográficas',12,y+5);
 y+=10;
 const mpp=156543.03392*Math.cos((view.lat||23.5)*Math.PI/180)/Math.pow(2,view.zoom||5);
 const pxPorMm=(view.pxW||800)/(view.mmW||132);
 const candidatos=[10,25,50,100,250,500,1000,2000,5000,10000,25000,50000,100000,250000,500000];
 let niceM=1000;
 for(const c of candidatos){ if(c/mpp/pxPorMm<=34) niceM=c; }
 const barMm=Math.max(6,niceM/mpp/pxPorMm);
 const bx=12, by=y+3;
 doc.setDrawColor(30,30,30); doc.setLineWidth(0.4);
 doc.line(bx,by,bx+barMm,by); doc.line(bx,by-1.5,bx,by+1.5); doc.line(bx+barMm,by-1.5,bx+barMm,by+1.5);
 doc.setFontSize(5); doc.setTextColor(30,30,30);
 const etiqueta=niceM>=1000?((niceM/1000)+' km'):(''+niceM+' m');
 doc.text('0',bx,by+5.5); doc.text(etiqueta,bx+barMm-8,by+5.5);
 doc.setFontSize(6);
 doc.text('Proyección: WGS84 (EPSG:4326)',bx+46,y);
 doc.text('Fecha: '+view.fechaStr,bx+46,y+5);
 doc.text('Centro: '+view.center+' · Zoom '+view.zoom,bx+46,y+10);
 doc.setFillColor(255,255,255); doc.setDrawColor(107,17,50); doc.setLineWidth(0.4);
 doc.rect(196,y-2,10,12,'FD');
 doc.setFillColor(107,17,50);
 doc.triangle(198.3,y+5,203.7,y+5,201,y-0.5,'F');
 doc.setFontSize(5.5); doc.setTextColor(30,30,30); doc.setFont('helvetica','bold');
 doc.text('N',200.1,y+9);
 return y+17;
}
function activarImpresionArea(){
 if(!Object.keys(activeLayers).length){ alert('Activa al menos una capa antes de imprimir un área.'); return; }
 try{ if(window._printAreaDrawer) window._printAreaDrawer.disable(); }catch(e){}
 if(printAreaLayer){ try{ map.removeLayer(printAreaLayer); }catch(e){} printAreaLayer=null; }
 printAreaBounds=null;
 window._printAreaActive=true;
 try{
  window._printAreaDrawer=new L.Draw.Rectangle(map,{shapeOptions:{color:'#6B1132',weight:2,opacity:0.9,fillOpacity:0.06,showArea:false}});
  window._printAreaDrawer.enable();
  showStatus('✏️ Dibuja un rectángulo en el mapa para imprimir esa área (Esc para cancelar).','warning');
 }catch(e){ window._printAreaActive=false; alert('No se pudo activar el dibujo de rectángulo.'); }
}
function manejarRectanguloImpresion(layer){
 try{ if(window._printAreaDrawer) window._printAreaDrawer.disable(); }catch(e){}
 window._printAreaActive=false;
 try{
  const b=layer.getBounds&&layer.getBounds();
  if(!b||!b.isValid()){ showStatus('Rectángulo inválido.','error'); return; }
  printAreaBounds=b;
  if(printAreaLayer){ try{ map.removeLayer(printAreaLayer); }catch(e){} }
  printAreaLayer=L.rectangle(b,{color:'#6B1132',weight:2,opacity:0.9,fillOpacity:0.05,interactive:false}).addTo(map);
  showStatus('✅ Área lista. Generando impresión…','success');
  if(temaActual==='dashboard'){ imprimirDashboard(); } else { imprimirGeneralADVC(b); }
 }catch(e){ window._printAreaActive=false; }
}
function limpiarAreaImpresion(){
 window._printAreaActive=false;
 try{ if(window._printAreaDrawer) window._printAreaDrawer.disable(); }catch(e){}
 window._printAreaDrawer=null;
 if(printAreaLayer){ try{ map.removeLayer(printAreaLayer); }catch(e){} printAreaLayer=null; }
 printAreaBounds=null;
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&window._printAreaActive){ try{ if(window._printAreaDrawer) window._printAreaDrawer.disable(); }catch(err){} window._printAreaActive=false; showStatus('Impresión por área cancelada.',''); } });
// espera a que centro/zoom/tiles dejen de moverse antes de capturar
function esperarVistaEstable(maxMs){
 return new Promise(res=>{
  const max=maxMs||4500; const t0=Date.now();
  let lastC=null,lastZ=null,quiet=0,tileOk=false,done=false;
  const fin=()=>{ if(!done){ done=true; res(); } };
  try{ map.once('load',()=>{ tileOk=true; }); }catch(e){ tileOk=true; }
  const iv=setInterval(()=>{
   try{
    const c=map.getCenter(), z=map.getZoom();
    if(lastC&&c.lat===lastC.lat&&c.lng===lastC.lng&&z===lastZ){ quiet++; } else { quiet=0; }
    lastC={lat:c.lat,lng:c.lng}; lastZ=z;
    if((quiet>=3&&tileOk)||(Date.now()-t0>max)){ clearInterval(iv); fin(); }
   }catch(e){ clearInterval(iv); fin(); }
  },150);
  setTimeout(()=>{ try{clearInterval(iv);}catch(e){} fin(); },max+500);
 });
}
// encuadra el rectángulo y verifica que la vista lo contenga (reintenta 1 vez)
async function encuadrarRectangulo(bounds){
 // Padding proporcional: si el mapa es más ancho que alto, el recorte
 // cuadrado del PDF descartaría los lados. Añadimos padding lateral
 // proporcional para que TODO el contenido quepa en el cuadrado.
 var padX=20, padY=20;
 try{
  var rc=map.getContainer().getBoundingClientRect();
  var w=rc.width, h=rc.height;
  if(w>h){
   // Mapa horizontal: padding lateral extra = (w-h)/2 por lado
   var extra=Math.round((w-h)/2);
   padX=Math.max(20, Math.round(extra*0.55));
  } else if(h>w){
   var extraY=Math.round((h-w)/2);
   padY=Math.max(20, Math.round(extraY*0.55));
  }
 }catch(e){}
 try{ map.fitBounds(bounds,{padding:[padY,padX],animate:false}); }catch(e){ return false; }
 await esperarVistaEstable(4500);
 try{
  const vb=map.getBounds();
  if(vb.contains(bounds.pad(-0.05))) return true;
 }catch(e){ return true; }
 try{
  const vb2=map.getBounds();
  if(!vb2.contains(bounds.pad(-0.05))){
   const z=map.getBoundsZoom(bounds,false,[padY,padX]);
   map.setView(bounds.getCenter(),z,{animate:false,reset:true});
  }
 }catch(e){}
 await esperarVistaEstable(4500);
 return true;
}
async function imprimirGeneralADVC(rectBounds){
 const loadingEl=document.getElementById('print-loading');
 if(loadingEl) loadingEl.style.display='flex';
 const vista0={center:map.getCenter(),zoom:map.getZoom()};
 try{
  await new Promise(r=>setTimeout(r,80));
  if(typeof jspdf==='undefined') throw new Error('jsPDF no disponible. Recarga la página.');
  const {jsPDF}=window.jspdf;
  const isAdvc=temaActual==='advc';
  const b=rectBounds||map.getBounds();
  if(rectBounds){ await encuadrarRectangulo(rectBounds); }
  try{ map.invalidateSize(true); }catch(e){}
  try{ map.stop&&map.stop(); }catch(e){}
  await esperarVistaEstable(4500);
  const visibles=Object.keys(activeLayers).filter(k=>{ try{ return map.hasLayer(activeLayers[k].layer); }catch(e){ return false; }});
  const filtrados=isAdvc?visibles.filter(k=>k.toLowerCase().includes('advc')||k.startsWith('usuario_')||k.startsWith('dibujo_')):visibles;
  let totalCount=0,totalHa=0; const porTipo={};
  filtrados.forEach(k=>{
   const entry=activeLayers[k];
   const feats=featuresEnArea(entry.featuresData||[],b);
   if(!feats.length) return;
   const sc=entry.superficieCol||detectarColumnaSuperficie(feats);
   const et=etiquetaCortaCapa(k);
   porTipo[et]=(porTipo[et]||0)+feats.length;
   totalCount+=feats.length;
   if(sc) feats.forEach(f=>{ const v=toHa(f.properties[sc]); if(Number.isFinite(v)) totalHa+=v; });
  });
  const tiposTxt=Object.entries(porTipo).sort((a,c)=>c[1]-a[1]).map(([t,n])=>`${n.toLocaleString('es-MX')} ${t}`).join(' · ')||'Sin elementos';
  if(printAreaLayer){ try{ map.removeLayer(printAreaLayer); }catch(e){} printAreaLayer=null; await esperarVistaEstable(2500); }
  let mapImg=null;
  if(rectBounds){
    // Recortar la captura al área del rectángulo dibujado
    try{ mapImg=await capturarMapaRecortado(rectBounds); }catch(e){}
  }
  if(!mapImg){
    try{ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }
    catch(e){ mapImg=placeholderDataURLSquare('Error capturando mapa'); }
  }
  const impZoom=map.getZoom(), impCenter=map.getCenter();
  let impPxW=800; try{ impPxW=map.getContainer().clientWidth||800; }catch(e){}
  try{ map.setView(vista0.center,vista0.zoom); }catch(e){}
  try{ map.invalidateSize(true); }catch(e){}
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const fmtDate=new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'});
  doc.setFillColor(107,17,50); doc.rect(0,0,210,22,'F');
  doc.setFillColor(26,92,78); doc.rect(0,22,210,4,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont('helvetica','bold');
  doc.text(isAdvc?'Geovisor CONANP — ADVC':'Geovisor CONANP',10,10);
  doc.setFontSize(6); doc.setFont('helvetica','normal');
  doc.text('Comisión Nacional de Áreas Naturales Protegidas · Gobierno de México · '+fmtDate,10,15);
  doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text(isAdvc?'Mapa ADVC · Datos':'Mapa General · Datos',10,21);
  let y=28;
  {
   const pw=132,ph=132,x=(210-pw)/2;
   doc.setDrawColor(107,17,50); doc.setLineWidth(0.7); doc.rect(x,y,pw,ph,'S');
   doc.addImage(mapImg,'PNG',x,y,pw,ph);
   y+=ph+6;
  }
  y=dibujarSpecsPDF(doc,y,{zoom:impZoom,lat:impCenter.lat,pxW:impPxW,mmW:132,fechaStr:new Date().toLocaleString('es-MX'),center:impCenter.lat.toFixed(4)+', '+impCenter.lng.toFixed(4)});
  y=tituloSeccionPDF(doc,'Datos de la vista',y);
  const kpiBoxes=[
   {lbl:'ELEMENTOS',val:totalCount.toLocaleString('es-MX'),sub:tiposTxt.substring(0,40),col:[107,17,50]},
   {lbl:'SUPERFICIE VISIBLE',val:totalHa?fmtHa(totalHa*1e4):'-',sub:isAdvc?'ADVC en vista':'ANP y ADVC en vista',col:[26,92,78]},
   {lbl:'CENTRO MAPA',val:impCenter.lat.toFixed(4)+', '+impCenter.lng.toFixed(4),sub:'Zoom '+impZoom,col:[120,60,60]},
   {lbl:'FECHA',val:new Date().toLocaleDateString('es-MX'),sub:new Date().toLocaleTimeString('es-MX'),col:[146,100,10]}
  ];
  if(y+2*(24+5)+10>275){ doc.addPage(); y=14; }
  const bx0=10,bw=92,bh=24,bgap=6; const yBox=y;
  kpiBoxes.forEach((k,i)=>{
   const bx=bx0+(i%2)*(bw+bgap), by=yBox+Math.floor(i/2)*(bh+bgap);
   doc.setFillColor(248,249,250); doc.setDrawColor(220,220,220);
   doc.roundedRect(bx,by,bw,bh,2,2,'FD');
   doc.setFillColor(k.col[0],k.col[1],k.col[2]); doc.rect(bx,by,bw,2.5,'F');
   doc.setTextColor(100,100,100); doc.setFontSize(5); doc.setFont('helvetica','bold');
   doc.text(k.lbl,bx+2,by+6);
   doc.setTextColor(20,20,20); doc.setFontSize(10); doc.setFont('helvetica','bold');
   doc.text(String(k.val).substring(0,22),bx+2,by+14);
   doc.setFontSize(5.5); doc.setFont('helvetica','normal'); doc.setTextColor(90,90,90);
   doc.text(String(k.sub).substring(0,42),bx+2,by+19);
  });
  y=yBox+2*(bh+bgap)+2;
  let nLegEst=0;
  filtrados.slice(0,10).forEach(k=>{
   const entry=activeLayers[k];
   if(esCapaAnpPrincipal(k)&&entry.categoriaCol){
    const ncats=[...new Set(featuresEnArea(entry.featuresData||[],b).map(f=>String(f.properties[entry.categoriaCol]||'').trim()).filter(Boolean))].sort().slice(0,8);
    nLegEst+=ncats.length?(ncats.length+1):1;
   }else nLegEst+=1;
  });
  nLegEst=Math.min(nLegEst,25);
  if(y+10+nLegEst*5+8>275){ doc.addPage(); y=14; }
  y=tituloSeccionPDF(doc,'Simbología — capas en el área',y);
  doc.setFontSize(6); doc.setTextColor(60,60,60);
  let nLeg=0;
  const legLine=(color,texto)=>{
   if(y>272){ doc.addPage(); y=14; }
   doc.setFillColor(color); doc.rect(12,y-3,5,3,'F');
   doc.text(String(texto).substring(0,80),19,y);
   y+=5; nLeg++;
  };
  filtrados.slice(0,10).forEach(k=>{
   const entry=activeLayers[k];
   if(esCapaAnpPrincipal(k)&&entry.categoriaCol){
    const cats=[...new Set(featuresEnArea(entry.featuresData||[],b).map(f=>String(f.properties[entry.categoriaCol]||'').trim()).filter(Boolean))].sort().slice(0,8);
    if(cats.length){ doc.setFont('helvetica','bold'); doc.text(getNombreAmigable(k).substring(0,60),12,y); y+=5; }
    cats.forEach(c=>{ if(nLeg<24) legLine(getColorPorCategoria(c),getNombreCompleto(c)); });
   }else{
    if(nLeg<24) legLine(entry.userColor||entry.color||'#6B1132',entry.userName||getNombreAmigable(k));
   }
  });
  if(!nLeg){ doc.text('Sin capas visibles en el área.',12,y); y+=5; }
  y+=2;
  doc.setFontSize(6); doc.setTextColor(60,60,60); doc.setFont('helvetica','normal');
  const citasF=[...new Set(filtrados.map(k=>apaForLayer(k)).filter(Boolean))];
  let nLinF=0; citasF.forEach((c,i)=>{ nLinF+=doc.splitTextToSize(`${i+1}. ${c.replace(/<[^>]*>/g,'')}`,186).length; });
  if(y+10+nLinF*4+10>275){ doc.addPage(); y=14; }
  y=tituloSeccionPDF(doc,'Fuentes',y);
  doc.setFontSize(6); doc.setTextColor(60,60,60); doc.setFont('helvetica','normal');
  const citas=[...new Set(filtrados.map(k=>apaForLayer(k)).filter(Boolean))];
  if(citas.length){
   citas.forEach((c,i)=>{
    const lines=doc.splitTextToSize(`${i+1}. ${c.replace(/<[^>]*>/g,'')}`,186);
    lines.forEach(ln=>{ if(y>278){ doc.addPage(); y=14; } doc.text(ln,12,y); y+=4; });
    y+=1;
   });
  }else{ doc.text('Sin fuentes — no hay capas visibles.',12,y); y+=5; }
  y+=2;
  doc.setFontSize(5.5); doc.setTextColor(80,60,0);
  const disc='Información de carácter informativo. Los resultados aquí presentados no constituyen un dictamen técnico. Para ANP federales, consultar la página oficial de la Comisión Nacional de Áreas Naturales Protegidas (CONANP). La CONANP no se hace responsable del uso que el usuario le dé a los datos.';
  const lines=doc.splitTextToSize(disc,190);
  if(y+lines.length*2.8+14>285){ doc.addPage(); y=14; }
  doc.setFillColor(255,251,235); doc.rect(8,y-3,194,lines.length*2.8+6,'F');
  doc.setDrawColor(251,191,36); doc.rect(8,y-3,194,lines.length*2.8+6,'S');
  doc.setTextColor(80,60,0);
  doc.text(lines,10,y); y+=lines.length*2.8+8;
  doc.setTextColor(100,100,100); doc.setFontSize(5.5);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')} · Geovisor CONANP · ${isAdvc?'Mapa ADVC':'Mapa General'}`,10,292);
  doc.save(`mapa_CONANP_${Date.now()}.pdf`);
  showStatus('✅ PDF generado exitosamente','success');
 }catch(e){ console.error('imprimirGeneralADVC error',e); showStatus(`❌ Error: ${e.message}`,'error'); }
 finally{ try{ map.setView(vista0.center,vista0.zoom); }catch(e){} try{ map.invalidateSize(true); }catch(e){} limpiarAreaImpresion(); if(loadingEl)loadingEl.style.display='none'; }
}
async function imprimirDashboard() {
  const loadingEl = document.getElementById('print-loading');
  if (loadingEl) loadingEl.style.display = 'flex';
  try {
    await new Promise(r => setTimeout(r, 100));
    if (typeof jspdf === 'undefined') throw new Error('jsPDF no disponible. Recarga la página.');
    const { jsPDF } = window.jspdf;
    const vista0={center:map.getCenter(),zoom:map.getZoom()};
    const rectBounds=printAreaBounds;
    if(rectBounds){ await encuadrarRectangulo(rectBounds); try{ map.invalidateSize(true); }catch(e){} await esperarVistaEstable(4500); }
    const anpK = Object.keys(activeLayers).find(k => esCapaAnpPrincipal(k));
    const advcK = Object.keys(activeLayers).find(k => esCapaAdvc(k));
    const anpData = getFilteredFeatures(anpK);
    const advcData = getFilteredFeatures(advcK);
    let supTotal = 0, supCert = 0, traslape = 0;
    if (anpK) {
      const sc = activeLayers[anpK].superficieCol || detectarColumnaSuperficie(anpData);
      if (sc) {
        for (let i = 0; i < anpData.length; i += 40) {
          const batch = anpData.slice(i, i + 40);
          batch.forEach(f => { const n = toHa(f.properties[sc]); if (Number.isFinite(n)) supTotal += n; });
          if (i + 40 < anpData.length) await new Promise(r => setTimeout(r, 0));
        }
      }
    }
    if (advcK) {
      const sc = activeLayers[advcK].superficieCol || detectarColumnaSuperficie(advcData) || 'ha_cert';
      for (let i = 0; i < advcData.length; i += 40) {
        const batch = advcData.slice(i, i + 40);
        batch.forEach(f => {
          let v = f.properties[sc];
          if (v === undefined) v = f.properties['ha_cert'];
          if (typeof v === 'number' && !isNaN(v)) supCert += v;
        });
        if (i + 40 < advcData.length) await new Promise(r => setTimeout(r, 0));
      }
    }
    if (anpK && advcK && anpData.length && advcData.length && typeof turf !== 'undefined') {
      for (let i = 0; i < Math.min(advcData.length, 50); i += 10) {
        const aBatch = advcData.slice(i, i + 10);
        for (const a of aBatch) {
          for (const b of anpData.slice(0, Math.min(anpData.length, 20))) {
            try {
              if (turf.booleanIntersects(a, b)) {
                const inter = turf.intersect(a, b);
                if (inter) { const am2 = turf.area(inter); if (am2 > 0) traslape += am2 / 1e4; }
              }
            } catch (e) {}
          }
        }
        if (i + 10 < Math.min(advcData.length, 50)) await new Promise(r => setTimeout(r, 0));
      }
    }
    const totalProt = supTotal + supCert - traslape;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const fmtDate = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    // Encabezado homologado con análisis: franja guinda + tira verde + subtítulo
    doc.setFillColor(107, 17, 50);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setFillColor(26, 92, 78);
    doc.rect(0, 22, 210, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Geovisor CONANP — Dashboard', 10, 10);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Comisión Nacional de Áreas Naturales Protegidas · Gobierno de México · ' + fmtDate, 10, 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Mapa · KPIs · Gráficas', 10, 21);
    let y = 28;
    try{ map.invalidateSize(true); }catch(e){}
    try{ map.stop&&map.stop(); }catch(e){}
    await esperarVistaEstable(4500);
    if(printAreaLayer){ try{ map.removeLayer(printAreaLayer); }catch(e){} printAreaLayer=null; await esperarVistaEstable(2500); }
    let mapImg = null;
    try {
      mapImg = await captureDashboardMap();
      if (!mapImg) throw new Error('Captura retornó null');
    } catch (err) {
      console.warn('Error en captura de mapa:', err);
      mapImg = placeholderDataURLSquare('Error capturando mapa');
    }
    const impZoom=map.getZoom(), impCenter=map.getCenter();
    let impPxW=800; try{ impPxW=map.getContainer().clientWidth||800; }catch(e){}
    if(rectBounds){ try{ map.setView(vista0.center,vista0.zoom); }catch(e){} try{ map.invalidateSize(true); }catch(e){} }
    {
      const pw = 132, ph = 132;
      const x = (210 - pw) / 2;
      doc.setDrawColor(107, 17, 50);
      doc.setLineWidth(0.7);
      doc.rect(x, y, pw, ph, 'S');
      doc.addImage(mapImg, 'PNG', x, y, pw, ph);
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(0.35);
      doc.line(x + 4, y + ph - 8, x + 24, y + ph - 8);
      doc.line(x + 4, y + ph - 10, x + 4, y + ph - 6);
      doc.line(x + 24, y + ph - 10, x + 24, y + ph - 6);
      doc.setFontSize(4.5);
      doc.text('Escala aprox.', x + 5, y + ph - 4);
      y += ph + 8;
    }
    if(y+110>275){ doc.addPage(); y=14; }
    y=dibujarSpecsPDF(doc,y,{zoom:impZoom,lat:impCenter.lat,pxW:impPxW,mmW:132,fechaStr:new Date().toLocaleString('es-MX'),center:impCenter.lat.toFixed(4)+', '+impCenter.lng.toFixed(4)});
    y=tituloSeccionPDF(doc,'KPIs Principales',y);
    // KPIs en tarjetas gráficas como en el informe de análisis
    const kpiBoxes = [
      { lbl: 'SUPERFICIE ANP', val: supTotal ? supTotal.toLocaleString('es-MX') + ' ha' : '—', sub: 'hectáreas', col: [26, 92, 78] },
      { lbl: 'CANTIDAD DE ANP', val: (anpData.length || 0).toLocaleString('es-MX'), sub: 'polígonos', col: [107, 17, 50] },
      { lbl: 'ADVC ACTIVAS', val: (advcData.length || 0).toLocaleString('es-MX'), sub: 'áreas voluntarias', col: [111, 68, 137] },
      { lbl: 'SUP. CERTIFICADA', val: supCert ? supCert.toLocaleString('es-MX') + ' ha' : '—', sub: 'ADVC hectáreas', col: [111, 68, 137] },
      { lbl: 'SUP. PROTEGIDA', val: totalProt > 0 ? totalProt.toLocaleString('es-MX') + ' ha' : '—', sub: 'ANP + ADVC − traslape', col: [26, 92, 78] }
    ];
    if(y+2*(24+5)+12>275){ doc.addPage(); y=14; }
    const bx0 = 10, bw = 60, bh = 24, bgap = 5;
    const yBox = y;
    kpiBoxes.forEach((k, i) => {
      const bx = bx0 + (i % 3) * (bw + bgap), by = yBox + Math.floor(i / 3) * (bh + bgap);
      doc.setFillColor(248, 249, 250); doc.setDrawColor(220, 220, 220);
      doc.roundedRect(bx, by, bw, bh, 2, 2, 'FD');
      doc.setFillColor(k.col[0], k.col[1], k.col[2]); doc.rect(bx, by, bw, 2.5, 'F');
      doc.setTextColor(100, 100, 100); doc.setFontSize(5); doc.setFont('helvetica', 'bold');
      doc.text(k.lbl, bx + 2, by + 6);
      doc.setTextColor(20, 20, 20); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text(String(k.val).substring(0, 16), bx + 2, by + 14);
      doc.setFontSize(5.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90);
      doc.text(String(k.sub).substring(0, 30), bx + 2, by + 19);
    });
    y = yBox + 2 * (bh + bgap) + 2;
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text('Página 1/2 · Mapa y KPIs', 10, 292);

    doc.addPage();
    y = 14;
    doc.setFillColor(107, 17, 50);
    doc.rect(0, 0, 210, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Gráficos y Distribución', 10, 6.5);
    doc.setTextColor(30, 30, 30);
    y = 18;
    const chartIds = ['chart-terrestre-marina', 'chart-bar-cat', 'chart-periodo', 'chart-periodo-advc'];
    const chartTitulos = {'chart-terrestre-marina':'Superficie terrestre y marina', 'chart-bar-cat':(((document.getElementById('chart-bar-cat-title')||{}).textContent)||'Superficie por categoría'), 'chart-periodo':'ANP por periodo', 'chart-periodo-advc':'ADVC por periodo'};
    let chartY = y;
    const celdaW = 90, celdaHMax = 60;
    async function escalaCapturaImg(cEl){
      try{
        var natW = cEl.width || 0, cssW = cEl.clientWidth || 0;
        var s = (natW && cssW) ? (natW/cssW) : (window.devicePixelRatio||1);
        if(!isFinite(s) || s<2) s = 2;
        return Math.min(3, s);
      }catch(e){ return 2; }
    }
    for (let i = 0; i < chartIds.length; i+=2) {
      const fila = [];
      for (let k=i; k<Math.min(i+2, chartIds.length); k++){
        try {
          const cEl = document.getElementById(chartIds[k]);
          if (cEl && validateElementVisible(cEl)) {
            const sc = await escalaCapturaImg(cEl);
            const cImg = await captureWithTimeout(() => html2canvas(cEl, { backgroundColor: '#ffffff', scale: sc, useCORS: true, logging:false }), 4000, null);
            if (cImg && cImg.width>10 && cImg.height>10) fila.push({id:chartIds[k], img:cImg});
          }
        } catch (e) { console.warn('Error capturando gráfico', e); }
      }
      if(!fila.length) continue;
      // encajar cada gráfica en su celda conservando aspecto (sin deformar nunca)
      const celdas = fila.map(function(f){
        const iw = Math.max(1, f.img.width), ih = Math.max(1, f.img.height);
        const sc = Math.min(celdaW/iw, celdaHMax/ih);
        return {f:f, dw:iw*sc, dh:ih*sc};
      });
      let altFila = 0;
      celdas.forEach(function(c){ altFila = Math.max(altFila, c.dh); });
      if(chartY + 8 + altFila + 4 > 278){ doc.addPage(); chartY = 14; }
      celdas.forEach(function(c, j){
        const xx = 10 + j*95 + (celdaW - c.dw)/2;
        try{
          const u = c.f.img.toDataURL('image/png');
          doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(60,60,60);
          doc.text(String(chartTitulos[c.f.id]||'Gráfica').substring(0,52), 10 + j*95, chartY+3);
          doc.addImage(u, 'PNG', xx, chartY+6, c.dw, c.dh);
        }catch(e){ console.warn('Error colocando gráfico', e); }
      });
      chartY += 6 + altFila + 8;
    }
    y = chartY;
    if (y > 240) { doc.addPage(); y = 14; }
    y=tituloSeccionPDF(doc,'Fuentes',y);
    doc.setFontSize(6); doc.setTextColor(60,60,60); doc.setFont('helvetica','normal');
    {
     const visF=Object.keys(activeLayers).filter(k=>{ try{ return map.hasLayer(activeLayers[k].layer); }catch(e){ return false; }});
     const citasF=[...new Set(visF.map(k=>apaForLayer(k)).filter(Boolean))];
     const linF=[];
     citasF.forEach((c,i)=>{ doc.splitTextToSize(`${i+1}. ${c.replace(/<[^>]*>/g,'')}`,186).forEach(ln=>linF.push(ln)); });
     if(y+linF.length*4+12>275){ doc.addPage(); y=14; }
     if(linF.length){ linF.forEach(ln=>{ if(y>278){ doc.addPage(); y=14; } doc.text(ln,12,y); y+=4; }); y+=2; }
     else { doc.text('Sin fuentes — no hay capas visibles.',12,y); y+=7; }
    }
    doc.setFontSize(5.5);
    doc.setTextColor(80, 60, 0);
    const disc = 'Información de carácter informativo. Los resultados aquí presentados no constituyen un dictamen técnico. Para ANP federales, consultar la página oficial de la Comisión Nacional de Áreas Naturales Protegidas (CONANP).';
    const lines = doc.splitTextToSize(disc, 190);
    if (y+lines.length*2.8+14>285) { doc.addPage(); y = 14; }
    doc.setFillColor(255, 251, 235);
    doc.rect(8, y - 3, 194, lines.length * 2.8 + 6, 'F');
    doc.setDrawColor(251, 191, 36);
    doc.rect(8, y - 3, 194, lines.length * 2.8 + 6, 'S');
    doc.text(lines, 10, y);
    doc.setFontSize(5.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')} · Geovisor CONANP`, 10, 292);
    doc.save(`dashboard_CONANP_${Date.now()}.pdf`);
    showStatus('✅ PDF generado exitosamente', 'success');
    limpiarAreaImpresion();
  } catch (err) {
    console.error('Error en impresión:', err);
    showStatus(`❌ Error: ${err.message}`, 'error');
    try {
      const { jsPDF } = window.jspdf;
      const docFb = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      docFb.setFillColor(107, 17, 50);
      docFb.rect(0, 0, 210, 22, 'F');
      docFb.setTextColor(255, 255, 255);
      docFb.setFontSize(12);
      docFb.setFont('helvetica', 'bold');
      docFb.text('Geovisor CONANP · Dashboard (Parcial)', 10, 10);
      docFb.setFontSize(7);
      docFb.setTextColor(200, 0, 0);
      docFb.text('Error al generar PDF completo', 10, 30);
      docFb.setFontSize(6);
      docFb.setTextColor(60, 60, 60);
      docFb.text('Se generó un PDF parcial debido a: ' + err.message, 10, 40);
      docFb.text('Intente de nuevo con el dashboard visible en pantalla completa.', 10, 46);
      docFb.save(`dashboard_CONANP_${Date.now()}_parcial.pdf`);
    } catch (e2) { alert('Error fatal en PDF: ' + e2.message); }
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Reemplazar listener original
const printBtn = document.getElementById('btn-print-dashboard');
if (printBtn) {
  // remover listeners previos (si existen)
  const newPrintBtn = printBtn.cloneNode(true);
  printBtn.parentNode.replaceChild(newPrintBtn, printBtn);
  newPrintBtn.addEventListener('click', imprimirDashboard);
}
// También exponer globalmente por si se llama desde otro sitio
window.imprimirDashboard = imprimirDashboard;
document.getElementById('btn-print-area-dashboard')?.addEventListener('click',()=>activarImpresionArea());



// Etiquetas avanzadas por capa: 1-3 campos secuenciales, tipografía, color, offset auto
function getLabelFields(table){
  try{
    var e = (typeof activeLayers!=='undefined') ? activeLayers[table] : null;
    if(!e || !e.featuresData || !e.featuresData.length) return [];
    var props = e.featuresData[0].properties || {};
    var excl = ['gid','geom','geometry','shape_leng','shape_area','objectid','fid'];
    return Object.keys(props).filter(function(k){ var lo=k.toLowerCase(); for(var i=0;i<excl.length;i++){ if(lo.indexOf(excl[i])!==-1) return false; } return true; }).slice(0,30);
  }catch(err){ return []; }
}
function getLabelConfig(table){
  try{
    var e = activeLayers[table];
    if(e && e.labelConfig) return e.labelConfig;
  }catch(e){}
  return {fields:[], fontFamily:'Inter, sans-serif', fontSize:11, bold:true, italic:false, color:'#1a2b26', offsetX:0, offsetY:0, auto:true, halo:true};
}
function buildLabelText(props, fields){
  var parts = [];
  (fields||[]).forEach(function(f){
    if(!f) return;
    var v = props ? props[f] : null;
    if(v===null||v===undefined||v==='') return;
    var s = String(v);
    if(s.length>32) s = s.substring(0,31)+'\u2026';
    parts.push(s);
  });
  return parts.join('\n');
}
function centroidOf(sub){
  try{
    if(sub.getLatLng) return sub.getLatLng();
    if(sub.getBounds){ return sub.getBounds().getCenter(); }
    if(sub.feature){
      var gj = {type:'Feature', properties:{}, geometry:sub.feature.geometry};
      try{
        if(typeof turf!=='undefined' && turf.centroid){
          var c = turf.centroid({type:'FeatureCollection', features:[sub.feature]});
          if(c && c.geometry && c.geometry.coordinates) return L.latLng(c.geometry.coordinates[1], c.geometry.coordinates[0]);
        }
      }catch(e){}
      try{ return L.geoJSON(gj).getBounds().getCenter(); }catch(e){}
    }
  }catch(e){}
  return null;
}
function setLayerLabelsAdvanced(table, cfg){
  try{
    var entry = activeLayers[table];
    if(!entry || !entry.layer) return;
    entry.labelConfig = cfg;
    // limpiar
    entry.layer.eachLayer(function(sub){ try{ sub.unbindTooltip(); }catch(e){} });
    if(!cfg || !cfg.fields || !cfg.fields.filter(function(f){return !!f;}).length){
      entry.labelField = null;
      try{ var b0=document.querySelector('.btn-label[data-table="'+table+'"]'); if(b0) b0.classList.remove('active'); }catch(e){}
      return;
    }
    var fields = cfg.fields.filter(function(f){return !!f;});
    // Recolectar candidatos con su punto
    var items = [];
    entry.layer.eachLayer(function(sub){
      try{
        var p = sub.feature ? sub.feature.properties : {};
        var txt = buildLabelText(p, fields);
        if(!txt) return;
        var ll = centroidOf(sub);
        if(!ll) return;
        items.push({sub:sub, txt:txt, ll:ll});
      }catch(e){}
    });
    // Ordenar por tamaño (mayor primero) para dar prioridad anti-traslape
    items.sort(function(a,b){ return b.txt.length - a.txt.length; });
    var placed = [];
    function overlaps(x,y,w,h){
      for(var i=0;i<placed.length;i++){
        var r=placed[i];
        if(!(x+w<r.x || r.x+r.w<x || y+h<r.y || r.y+r.h<y)) return true;
      }
      return false;
    }
    var candidates = [[0,0],[0,-22],[0,22],[-22,0],[22,0],[-16,-16],[16,-16],[-16,16],[16,16],[0,-34],[0,34]];
    items.forEach(function(it){
      try{
        var base = map.latLngToContainerPoint(it.ll);
        var estW = Math.min(220, 8 + it.txt.split('\n').reduce(function(m,l){return Math.max(m,l.length);},0) * (cfg.fontSize*0.62));
        var lines = it.txt.split('\n').length;
        var estH = lines * (cfg.fontSize*1.35) + 8;
        var ox = Number(cfg.offsetX)||0, oy = Number(cfg.offsetY)||0;
        var chosen = {x:base.x+ox, y:base.y+oy, dx:ox, dy:oy};
        if(cfg.auto){
          var found=false;
          for(var i=0;i<candidates.length;i++){
            var cx = base.x + ox + candidates[i][0];
            var cy = base.y + oy + candidates[i][1];
            if(!overlaps(cx-estW/2, cy-estH/2, estW, estH)){ chosen={x:cx,y:cy,dx:ox+candidates[i][0],dy:oy+candidates[i][1]}; found=true; break; }
          }
          if(!found){ chosen={x:base.x+ox, y:base.y+oy, dx:ox, dy:oy}; }
        }
        placed.push({x:chosen.x-estW/2, y:chosen.y-estH/2, w:estW, h:estH});
        var off = map.containerPointToLatLng([chosen.x, chosen.y]);
        // offset de Leaflet respecto al ancla: diferencia entre punto elegido y centroide
        var anchor = map.latLngToContainerPoint(it.ll);
        var dOff = L.point(chosen.x-anchor.x, chosen.y-anchor.y);
        var style = 'font-family:'+cfg.fontFamily+';font-size:'+cfg.fontSize+'px;'+(cfg.bold?'font-weight:800;':'font-weight:400;')+(cfg.italic?'font-style:italic;':'')+'color:'+cfg.color+';';
        it.sub.bindTooltip('<span style="'+style+'">'+it.txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>', {permanent:true, direction:'center', offset:dOff, className:'layer-label-adv'+(cfg.halo===false?' no-halo':''), opacity:0.96});
      }catch(e){}
    });
    entry.labelField = fields[0] || null;
    try{ var b1=document.querySelector('.btn-label[data-table="'+table+'"]'); if(b1){ b1.classList.add('active'); b1.title='Etiquetas: '+fields.join(' + '); } }catch(e){}
    // re-evaluar en movimiento (debounce) para mantener anti-traslape
    try{
      if(entry._labMoveH) map.off('moveend', entry._labMoveH);
      var h = function(){ try{ if(entry.labelConfig && entry.labelConfig.fields && entry.labelConfig.fields.length) setLayerLabelsAdvanced(table, entry.labelConfig); }catch(e){} };
      var deb=null;
      entry._labMoveH = function(){ clearTimeout(deb); deb=setTimeout(h, 350); };
      map.on('moveend', entry._labMoveH);
    }catch(e){}
  }catch(e){ console.warn('labelsAdv', e); }
}
// Compat: llamada simple de 1 campo
function setLayerLabels(table, field){
  try{
    if(!field){ setLayerLabelsAdvanced(table, {fields:[], fontFamily:'Inter, sans-serif', fontSize:11, bold:true, italic:false, color:'#1a2b26', offsetX:0, offsetY:0, auto:true, halo:true}); return; }
    var cur = getLabelConfig(table);
    cur.fields = [field];
    setLayerLabelsAdvanced(table, cur);
  }catch(e){}
}

function openLabelEditor(btn){
  try{
    var item = btn.closest ? btn.closest('.capa-item') : null;
    if(!item) return;
    var table = btn.dataset.table;
    // cerrar otros editores inline
    document.querySelectorAll('.label-editor-inline.open').forEach(function(el){ if(el.dataset.table!==table) el.classList.remove('open'); });
    var ed = item.querySelector('.label-editor-inline');
    if(!ed){
      ed = document.createElement('div');
      ed.className = 'label-editor-inline';
      ed.dataset.table = table;
      // insertar después de .capa-controls (como symbology-editor)
      var anchor = item.querySelector('.capa-controls');
      if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(ed, anchor.nextSibling);
      else item.appendChild(ed);
    }
    if(ed.classList.contains('open')){ ed.classList.remove('open'); return; }
    renderLabelEditorInline(ed, table);
    ed.classList.add('open');
  }catch(e){}
}
function renderLabelEditorInline(ed, table){
  try{
    var fields = getLabelFields(table);
    var cfg = getLabelConfig(table);
    function optList(sel){
      var h='<option value="">— campo —</option>';
      fields.forEach(function(f){ h+='<option value="'+f+'"'+(sel===f?' selected':'')+'>'+f+'</option>'; });
      return h;
    }
    var n = Math.max(1, Math.min(3, (cfg.fields&&cfg.fields.length)||1));
    var html='<h5>Etiqueta · '+table+'</h5>';
    html+='<div class="lab-row"><select data-lf="0">'+optList(cfg.fields[0]||'')+'</select><button class="mini-btn" data-add="1" title="Añadir campo 2">+</button></div>';
    if(n>=2) html+='<div class="lab-row"><select data-lf="1">'+optList(cfg.fields[1]||'')+'</select><button class="mini-btn" data-add="2" title="Añadir campo 3">+</button><button class="mini-btn" data-del="1" title="Quitar">×</button></div>';
    if(n>=3) html+='<div class="lab-row"><select data-lf="2">'+optList(cfg.fields[2]||'')+'</select><button class="mini-btn" data-del="2" title="Quitar">×</button></div>';
    html+='<h5>Tipografía</h5><div class="lab-row"><select data-ff><option>Inter, sans-serif</option><option>Space Grotesk, sans-serif</option><option>Noto Sans, sans-serif</option><option>Arial, sans-serif</option><option>Georgia, serif</option></select></div>';
    html+='<div class="lab-row"><label style="font-size:0.64rem;">Tamaño</label><input type="number" data-fs min="8" max="20" value="'+(cfg.fontSize||11)+'" style="max-width:60px"><button class="style-btn'+(cfg.bold?' on':'')+'" data-bold>B</button><button class="style-btn'+(cfg.italic?' on':'')+'" data-italic><i>I</i></button><input type="color" data-color value="'+(cfg.color||'#1a2b26')+'" style="width:32px;height:26px;border:none;background:none"></div>';
    html+='<h5>Posición</h5><div class="lab-row"><label style="font-size:0.64rem;">X</label><input type="number" data-ox min="-40" max="40" value="'+(cfg.offsetX||0)+'" style="max-width:54px"><label style="font-size:0.64rem;">Y</label><input type="number" data-oy min="-40" max="40" value="'+(cfg.offsetY||0)+'" style="max-width:54px"><label style="font-size:0.64rem;"><input type="checkbox" data-auto'+(cfg.auto?' checked':'')+'> auto anti-traslape</label></div>';
    html+='<div class="lab-row"><label style="font-size:0.64rem;"><input type="checkbox" data-halo'+(cfg.halo!==false?' checked':'')+'> recuadro</label></div>';
    html+='<div class="lab-row"><button class="mini-btn" data-apply style="width:auto;padding:0 0.8rem;border-radius:999px;background:#1a5c4e;color:#fff;">Aplicar</button><button class="mini-btn" data-clear style="width:auto;padding:0 0.8rem;border-radius:999px;">Quitar</button></div>';
    if(!fields.length) html+='<div style="font-size:0.64rem;color:var(--text-muted);">Carga la capa para listar atributos.</div>';
    ed.innerHTML=html;
    try{ var sel=ed.querySelector('[data-ff]'); if(sel) sel.value=cfg.fontFamily||'Inter, sans-serif'; }catch(e){}
  }catch(e){}
}
function openLabelEditorRefresh(btn, cfg){
  try{
    var table=btn.dataset.table;
    try{ var e=activeLayers[table]; if(e) e.labelConfig=cfg; }catch(e2){}
    var item=btn.closest?btn.closest('.capa-item'):null;
    var ed=item?item.querySelector('.label-editor-inline'):null;
    if(!ed) return;
    renderLabelEditorInline(ed, table);
    try{
      ed.querySelectorAll('select[data-lf]').forEach(function(s){ var i=Number(s.dataset.lf); if(cfg.fields[i]) s.value=cfg.fields[i]; });
      try{ ed.querySelector('[data-ff]').value=cfg.fontFamily||'Inter, sans-serif'; }catch(e2){}
    }catch(e){}
  }catch(e){}
}
window.setLayerLabels=setLayerLabels;

document.addEventListener('click', function(e){
  try{
    var ed = e.target.closest ? e.target.closest('.label-editor-inline') : null;
    if(ed){
      var act = e.target.closest ? e.target.closest('[data-add],[data-del],[data-apply],[data-clear],[data-bold],[data-italic]') : null;
      if(act){
        e.preventDefault(); e.stopPropagation();
        var item = ed.closest ? ed.closest('.capa-item') : null;
        var btn0 = item ? item.querySelector('.btn-label') : null;
        var table0 = (item && item.dataset ? item.dataset.table : null) || ed.dataset.table;
        if(!table0 || !btn0) return;
        var cfg0 = getLabelConfig(table0);
        ed.querySelectorAll('select[data-lf]').forEach(function(s){ cfg0.fields[Number(s.dataset.lf)] = s.value||null; });
        try{ cfg0.fontFamily = ed.querySelector('[data-ff]').value; }catch(e2){}
        try{ cfg0.fontSize = Number(ed.querySelector('[data-fs]').value)||11; }catch(e2){}
        try{ cfg0.color = ed.querySelector('[data-color]').value; }catch(e2){}
        try{ cfg0.offsetX = Number(ed.querySelector('[data-ox]').value)||0; cfg0.offsetY = Number(ed.querySelector('[data-oy]').value)||0; }catch(e2){}
        try{ cfg0.auto = ed.querySelector('[data-auto]').checked; }catch(e2){}
        try{ var _h0 = ed.querySelector('[data-halo]'); if(_h0) cfg0.halo = _h0.checked; }catch(e2){}
        if(act.hasAttribute('data-add')){ if(cfg0.fields.filter(function(f){return !!f;}).length>=3) return; cfg0.fields.push(null); openLabelEditorRefresh(btn0, cfg0); return; }
        if(act.hasAttribute('data-del')){ var idx=Number(act.dataset.del); cfg0.fields.splice(idx,1); if(!cfg0.fields.length) cfg0.fields=[null]; openLabelEditorRefresh(btn0, cfg0); return; }
        if(act.hasAttribute('data-bold')){ cfg0.bold=!cfg0.bold; setLayerLabelsAdvanced(table0, cfg0); openLabelEditorRefresh(btn0, cfg0); return; }
        if(act.hasAttribute('data-italic')){ cfg0.italic=!cfg0.italic; setLayerLabelsAdvanced(table0, cfg0); openLabelEditorRefresh(btn0, cfg0); return; }
        if(act.hasAttribute('data-apply')){ setLayerLabelsAdvanced(table0, cfg0); return; }
        if(act.hasAttribute('data-clear')){ setLayerLabelsAdvanced(table0, {fields:[], fontFamily:cfg0.fontFamily, fontSize:cfg0.fontSize, bold:cfg0.bold, italic:cfg0.italic, color:cfg0.color, offsetX:0, offsetY:0, auto:true, halo:true}); return; }
        return;
      }
      e.stopPropagation(); return;
    }
    var lbl = e.target.closest ? e.target.closest('.btn-label') : null;
    if(lbl){ e.preventDefault(); e.stopPropagation(); openLabelEditor(lbl); return; }
  }catch(e){}
});
 window.setLayerLabelsAdvanced=setLayerLabelsAdvanced; window.getLabelFields=getLabelFields;



// Estado del sistema — rojo hasta conectar capa
function updateSystemStatus(){
  try{
    var el = document.getElementById('system-status') || document.querySelector('.header-status');
    if(!el) return;
    var txt = document.getElementById('system-status-text');
    var has = false;
    try{
      if(typeof activeLayers!=='undefined'){
        var keys = Object.keys(activeLayers);
        has = keys.length>0 && Object.values(activeLayers).some(function(e){ return e && e.featuresData && e.featuresData.length>0; });
      }
    }catch(e){}
    if(has){ el.classList.remove('status-disconnected'); el.classList.add('status-connected'); if(txt) txt.textContent='Sistema activo'; }
    else { el.classList.remove('status-connected'); el.classList.add('status-disconnected'); if(txt) txt.textContent='Sin conexión'; }
  }catch(e){}
}
try{ setInterval(updateSystemStatus, 2000); }catch(e){}
try{ document.addEventListener('DOMContentLoaded', function(){ setTimeout(updateSystemStatus, 600); }); }catch(e){}
try{ setTimeout(updateSystemStatus, 800); }catch(e){}
window.updateSystemStatus = updateSystemStatus;
