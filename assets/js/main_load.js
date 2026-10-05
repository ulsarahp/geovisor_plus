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
      div.innerHTML=`<div class="capa-header"><input type="checkbox" id="chk-${tableName}" data-table="${tableName}"><span class="icono">${geomType.includes('Line')?'<i class="fas fa-route"></i>':'<i class="fas fa-draw-polygon"></i>'}</span><span class="nombre" title="${tableName}">${nombreAmigable}</span><button class="btn-zoom" title="Zoom a capa (o México si no hay capa activa)" data-zoom="${tableName}" aria-label="Zoom a capa ${tableName}"><i class="fas fa-crosshairs"></i></button><button class="btn-filtro" title="Filtrar por atributo" aria-label="Filtrar capa ${tableName}"><i class="fas fa-filter"></i></button><div class="btn-descarga" role="button" tabindex="0" aria-label="Descargar capa ${tableName}"><i class="fas fa-download"></i><div class="dropdown-menu"><button data-format="geojson">GeoJSON</button><button data-format="csv">CSV</button><button data-format="kml" style="display:none" disabled>KML</button><button data-format="shp" style="display:none" disabled>Shapefile</button></div></div></div><div class="capa-controls"><label>Opac.</label><input type="range" min="0" max="100" value="100" data-table="${tableName}"><span class="opacity-value">100%</span></div><div class="query-filtro" id="query-${tableName}"><label>Atributo</label><select data-q="attr"><option value="">— Selecciona atributo —</option></select><label>Valor</label><select data-q="val" disabled><option value="">— Primero elige atributo —</option></select><div class="query-filtro-btns"><button data-q="aplicar" class="primary">Aplicar + zoom</button><button data-q="limpiar">Limpiar</button></div><div class="query-info" data-q="info"></div></div>`;
    contenido.appendChild(div);
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
       if(categoriaCol)actualizarGraficosAnp();else if(esCapaAdvc(table))actualizarGraficoAdvc();
       actualizarContador();actualizarLeyenda();if(temaActual==='dashboard')actualizarDashboard();
      }catch(err){setStatus(`❌ ${err.message}`,'error');this.checked=false;}
     }else{
      if(activeLayers[table]){map.removeLayer(activeLayers[table].layer);allFeaturesForSearch=allFeaturesForSearch.filter(i=>i.capaNombreTecnico!==table);delete activeLayers[table];delete filtrosPorCapa[table];setStatus(`⛔ ${nombreAmigable} removida.`,'');document.getElementById('resultados-busqueda').style.display='none';if(esCapaAnpPrincipal(table))actualizarGraficosAnp();else if(esCapaAdvc(table))actualizarGraficoAdvc();actualizarContador();actualizarLeyenda();if(temaActual==='dashboard')actualizarDashboard();}
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

  async function chartImage(labels, values, colors, type='bar', escala=2){
  return new Promise(res=>{
   const isDough=type==='doughnut';
   const cv=document.createElement('canvas');
   cv.width=(isDough? 320 : 520)*escala;
   cv.height=(isDough? 320 : 220)*escala;
   cv.style.position='absolute'; cv.style.left='-9999px'; document.body.appendChild(cv);
   const ctx=cv.getContext('2d');
   const F=px=>px*escala;
   const opts={responsive:false, animation:false, plugins:{legend:{display: isDough?{position:'bottom', labels:{font:{size:F(9)}, boxWidth:F(12)}} : false}, tooltip:{enabled:false}}, scales:{}};
   if(type==='bar'){
    opts.scales={y:{beginAtZero:true, ticks:{font:{size:F(9)}, callback:v=>v.toLocaleString('es-MX')}}, x:{ticks:{font:{size:F(8)}, maxRotation:30}}};
   } else if(isDough){
    opts.cutout='62%';
    opts.plugins.legend={display:true, position:'bottom', labels:{font:{size:F(9)}, boxWidth:F(12), padding:F(12)}};
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
   if(barUrl) doc.addImage(barUrl, 'PNG', 58, chartY, 132, 56);
  }
 }catch(e){}
 y=chartY+60;

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