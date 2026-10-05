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