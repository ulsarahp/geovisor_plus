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