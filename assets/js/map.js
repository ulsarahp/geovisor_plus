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
 const leyendaSrc=document.getElementById('leyenda');
 const leyendaHtml=leyendaSrc?.innerHTML || '<p style="font-size:7pt; color:#777;">Sin capas visibles</p>';
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
     <div style="text-align:center; padding:6px; background:#f0fdfa; border:1px solid #a7f3d0; border-radius:6px;"><div style="font-size:6.5pt; color:#065f46; text-transform:uppercase; font-weight:700;">Superficie visible</div><div style="font-size:9pt; font-weight:800; color:#065f46;">${supTxt}</div><div style="font-size:5.5pt; color:#047857;">${isAdvc?'ADVC':'ANP/ADVC'} en vista</div></div>
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
  const s=Math.min(canvas.width, canvas.height);
  if(s<=0 || (canvas.width===s && canvas.height===s)) return canvas;
  const x=(canvas.width - s)/2, y=(canvas.height - s)/2;
  const c=document.createElement('canvas'); c.width=s; c.height=s;
  c.getContext('2d').drawImage(canvas, x,y,s,s, 0,0,s,s);
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
    /* Captura nativa Leaflet primero (recompone tiles + SVG + marcadores). */
  try{
    var natCap = await capturaLeafletNativa((typeof map==='undefined')?null:map);
    if(natCap && natCap.length>2000){
      if(typeof dataURLToSquareDataURL==='function'){
        try{ var natSq = await dataURLToSquareDataURL(natCap); if(natSq && natSq.length>2000) return natSq; }catch(e){}
      }
      return natCap;
    }
  }catch(e){ console.warn('capturaLeafletNativa fallo, continuo con DOM', e); }
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
   /* Captura nativa Leaflet primero (recompone tiles + SVG + marcadores). */
  try{
    var natCap = await capturaLeafletNativa((typeof map==='undefined')?null:map);
    if(natCap && natCap.length>2000){
      if(typeof dataURLToSquareDataURL==='function'){
        try{ var natSq = await dataURLToSquareDataURL(natCap); if(natSq && natSq.length>2000) return natSq; }catch(e){}
      }
      return natCap;
    }
  }catch(e){ console.warn('capturaLeafletNativa fallo, continuo con DOM', e); }
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
function generarPDFBase(titulo){
 const {jsPDF}=window.jspdf; const doc=new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
 const fmtDate=new Date().toLocaleDateString('es-MX',{day:'2-digit', month:'long', year:'numeric'});
 doc.setFillColor(107,17,50); doc.rect(0,0,210,22,'F');
 doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text(titulo||'Geovisor CONANP',10,10);
 doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.text('Comisión Nacional de Áreas Naturales Protegidas · Gobierno de México · '+fmtDate,10,15);
 return {doc, fmtDate};
}
