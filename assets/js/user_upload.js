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
  div.innerHTML=`<div class="capa-header"><input type="checkbox" checked id="chk-${tableName}" data-table="${tableName}"><span class="icono">${gt.includes('Point')?'<i class="fas fa-map-pin"></i>':gt.includes('Line')?'<i class="fas fa-route"></i>':'<i class="fas fa-draw-polygon"></i>'}</span><span class="nombre" title="${tableName}">${nombreInicial}</span><button class="btn-info" data-table="${tableName}" title="Ver metadatos" aria-label="Metadatos ${tableName}"><i class="fas fa-circle-info"></i></button><button class="btn-rename" title="Editar nombre" aria-label="Renombrar capa ${tableName}"><i class="fas fa-pen"></i></button><button class="btn-zoom" title="Zoom a capa (o México si no hay)" data-zoom="${tableName}" aria-label="Zoom a capa ${tableName}"><i class="fas fa-crosshairs"></i></button><button class="btn-filtro" title="Filtrar por atributo" aria-label="Filtrar capa ${tableName}"><i class="fas fa-filter"></i></button><div class="btn-descarga" role="button" tabindex="0" aria-label="Descargar capa ${tableName}"><i class="fas fa-download"></i><div class="dropdown-menu"><button data-format="geojson">GeoJSON</button><button data-format="csv">CSV</button><button data-format="kml" style="display:none" disabled>KML</button><button data-format="shp" style="display:none" disabled>Shapefile</button></div></div><button class="btn-delete" title="Eliminar capa" aria-label="Eliminar capa ${tableName}"><i class="fas fa-trash"></i></button></div><div class="capa-controls capa-controls-global" style="display:none"><label>Opac.</label><input type="range" min="0" max="100" value="100" data-table="${tableName}"><span class="opacity-value">100%</span></div><button class="btn-symbology" data-table="${tableName}" aria-label="Simbología ${tableName}"><i class="fas fa-palette"></i> Simbología</button><div class="symbology-editor" id="symb-${tableName}"></div><div class="query-filtro" id="query-${tableName}"><label>Atributo</label><select data-q="attr"><option value="">— Selecciona atributo —</option></select><label>Valor</label><select data-q="val" disabled><option value="">— Primero elige atributo —</option></select><div class="query-filtro-btns"><button data-q="aplicar" class="primary">Aplicar + zoom</button><button data-q="limpiar">Limpiar</button></div><div class="query-info" data-q="info"></div></div>`;
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