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
 const e=activeLayers[tbl]; if(!e){alert('Capa no cargada.');return;}
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
 if(fmt==='kml' || fmt==='shp'){ alert(fmt.toUpperCase()+' no implementado — use GeoJSON/CSV.'); return; }
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