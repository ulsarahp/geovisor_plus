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