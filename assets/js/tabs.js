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
 gCount.style.display='none';gArea.style.display='none';gAdvc.style.display='none';dashboardContainer.style.display='none';
 const mapEl=document.getElementById('map');
 if(mapEl.parentElement===mapDashboardContainer){mapOriginalContainer.appendChild(mapEl);setTimeout(()=>map.invalidateSize(),100);}
  if(tabId==='general'){if(!gCount.classList.contains('grafico-cerrado'))gCount.style.display='block';if(!gArea.classList.contains('grafico-cerrado'))gArea.style.display='block';gAdvc.classList.add('grafico-oculto');actualizarGraficosAnp();actualizarContador();}
  else if(tabId==='advc'){if(!gAdvc.classList.contains('grafico-cerrado')){gAdvc.classList.remove('grafico-oculto');gAdvc.style.display='block';}actualizarGraficoAdvc();actualizarContador();}
 else if(tabId==='dashboard'){dashboardContainer.style.display='block';if(!mapDashboardContainer.contains(mapEl)){mapDashboardContainer.appendChild(mapEl);setTimeout(()=>{map.invalidateSize();map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);},150);}else{map.fitBounds([[MEXICO_BOUNDS.south,MEXICO_BOUNDS.west],[MEXICO_BOUNDS.north,MEXICO_BOUNDS.east]]);}actualizarDashboard();}
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
     if(leyendaSrc && leyendaSrc.innerHTML.trim() && leyendaSrc.style.display!=='none'){
       leyenda.innerHTML=leyendaSrc.innerHTML;
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