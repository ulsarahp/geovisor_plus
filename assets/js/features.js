
// ================================================================
// WELCOME · TOUR · FAQ · AI ASSISTANT (solo sistema)
// ================================================================
(function(){
  const WELCOME_KEY = 'welcome_dismissed_v6';
  const WELCOME_DONT = 'welcome_dont_show_v6';
  const TOUR_KEY = 'tour_completed_v6';
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

  // --- WELCOME ---
  const welcomeOverlay = $('#welcome-overlay');
  const welcomeDont = $('#welcome-dont-show');
  const btnWelcomeEnter = $('#welcome-enter');
  const btnWelcomeSkip = $('#welcome-skip');
  const btnWelcomeTour = $('#welcome-tour-btn');
  function shouldShowWelcome(){
    try{
      if(localStorage.getItem(WELCOME_DONT)==='true') return false;
      if(sessionStorage.getItem(WELCOME_KEY)==='true') return false;
    }catch(e){}
    return true;
  }
  function showWelcome(){
    if(!welcomeOverlay) return;
    welcomeOverlay.classList.add('active');
    welcomeOverlay.style.display='flex';
    welcomeOverlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function hideWelcome(persist){
    if(!welcomeOverlay) return;
    welcomeOverlay.classList.remove('active');
    welcomeOverlay.style.display='none';
    welcomeOverlay.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    try{
      if(persist) sessionStorage.setItem(WELCOME_KEY,'true');
      if(welcomeDont && welcomeDont.checked) localStorage.setItem(WELCOME_DONT,'true');
    }catch(e){}
  }
  // Mostrar tras disclaimer (500ms delay) si corresponde
  function initWelcome(){
    if(!shouldShowWelcome()) return;
    // Esperar a que disclaimer se haya mostrado/cerrado: mostrar welcome después de 1200ms
    setTimeout(()=>{
      // si disclaimer aún activo, esperar a que se cierre
      const disc = document.getElementById('disclaimer-modal');
      const show = ()=>{ if(disc && disc.classList.contains('active')) setTimeout(show, 700); else showWelcome(); };
      show();
    }, 1300);
  }
  btnWelcomeEnter?.addEventListener('click', ()=>{ hideWelcome(true); });
  btnWelcomeSkip?.addEventListener('click', ()=>{ hideWelcome(true); });
  btnWelcomeTour?.addEventListener('click', ()=>{ hideWelcome(true); startTour(); });
  welcomeOverlay?.addEventListener('click', (e)=>{ if(e.target===welcomeOverlay) hideWelcome(true); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && welcomeOverlay?.classList.contains('active')) hideWelcome(true); });

  // --- TOUR ---
  const tourOverlay = $('#tour-overlay');
  const tourTitle = $('#tour-title');
  const tourText = $('#tour-text');
  const tourCurrent = $('#tour-current');
  const tourTotal = $('#tour-total');
  const tourPrev = $('#tour-prev');
  const tourNext = $('#tour-next');
  const tourClose = $('#tour-close');
  const tourSkip = $('#tour-skip');
  const steps = [
    { sel:null, title:'Bienvenido', html:'Te guiaremos por <b>7 pasos</b> esenciales. Usa <b>Siguiente</b> para avanzar, o <b>Omitir</b> para salir. Este recorrido no bloquea el mapa.', icon:'fa-compass' },
    { sel:'#panel', title:'Panel de capas', html:'Aquí activas <b>CONANP</b> (ANP, ADVC, Zonas Núcleo) y <b>Contexto Geográfico</b>. Ajusta la <b>opacidad</b> con el deslizador y usa <b>...</b> para filtrar por atributos.', icon:'fa-layer-group' },
    { sel:'#buscador', title:'Búsqueda y carga', html:'<b>Busca</b> por nombre (ej. “El Pinacate” o “Lago de Texcoco”). Con <b>Cargar capa local</b> sube GeoJSON/KML/SHP ZIP como <b>fuente o destino</b> para análisis.<br><small style="display:block; margin-top:0.45rem; padding:0.35rem 0.55rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:6px; font-size:0.68rem;">Tip: si no ves la barra, abre el panel lateral con <i class="fas fa-chevron-right"></i></small>', icon:'fa-magnifying-glass' },
    { sel:'.leaflet-draw-toolbar, .leaflet-control-zoom, #map', title:'Mapa y herramientas', html:'Navega, usa <b>dibujo</b> en la barra izquierda para <b>polígono/rectángulo</b>, controla <b>zoom</b> y abre <b>Impresión</b> (<i class="fas fa-print"></i> abajo a la izquierda). El <b>norte</b> y la <b>escala</b> se incluyen en el PDF.<br><small style="display:block; margin-top:0.4rem; color:var(--text-muted);">Tip: prueba dibujar un polígono para activar el análisis territorial.</small>', icon:'fa-map-location-dot' },
    { sel:'[data-tab="dashboard"]', title:'Dashboard', html:'Pestaña <b>Dashboard</b>: <b>KPIs</b>, gráficas de categoría/estado/propiedad/periodo y <b>tabla ADVC/ANP</b>. Amplía con <i class="fas fa-expand-alt"></i> y exporta <b>PNG/JPG/CSV</b>.', icon:'fa-chart-line' },
    { sel:'#analisis-panel', title:'Análisis territorial', html:'Define <b>Fuente</b> (tu polígono o capa usuario) y <b>Destino</b> (CONANP). El sistema calcula <b>superficie, % en ANP y traslapes</b> con Turf.js. Descarga <b>PDF/CSV</b> o <b>Ver en mapa</b>.', icon:'fa-draw-polygon' },
    { sel:'#ai-toggle', title:'Balam y ayuda', html:'Habla con <b>Balam</b> (<i class="fas fa-paw"></i> abajo a la derecha) — el jaguar IA que solo usa datos del sistema — o abre <b>FAQ</b> (<i class="fas fa-circle-question"></i>) e <b>Impresión</b> con encabezado institucional.', icon:'fa-paw' },
  ];
  let tourIdx = 0;
  let prevHighlight = null;
  let prevHighlightSel = null;
  function highlight(sel){
    if(prevHighlight){ try{ prevHighlight.classList.remove('tour-highlight'); }catch(e){} prevHighlight=null; prevHighlightSel=null; }
    if(!sel) return;
    const needsPanel = sel.includes('#panel') || sel.includes('#buscador') || sel.includes('#cargar-capa') || sel.includes('.grupo') || sel.includes('#inputBusqueda');
    if(needsPanel){
      try{
        const p = document.getElementById('panel');
        const ov = document.getElementById('panel-overlay');
        if(p && window.innerWidth<=1440 && !p.classList.contains('panel-open')){
          if(typeof openPanel==='function'){ openPanel(); }
          else { p.classList.add('panel-open'); ov&&ov.classList.add('active'); setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} },360); }
        } else if(p && p.classList.contains('panel-open')){
          // ya abierto
        }
      }catch(e){}
    }
    // Para mapa: usar highlight suave sin elevar demasiado y sin bloquear tour-card
    if(sel.includes('#map')){
      try{
        const el = document.querySelector('#map');
        if(el){
          // No usar z-index elevado para #map, solo outline; aplicar clase especial sin bloquear
          // Esperar un poco para que busqueda se limpie
          setTimeout(()=>{
            el.classList.add('tour-highlight');
            // Reducir z-index para mapa para no tapar tour-card (tour-card 10006 > highlight 10002)
            el.style.zIndex='10002';
            prevHighlight=el; prevHighlightSel=sel;
          }, 90);
          try{ el.scrollIntoView({behavior:'smooth', block:'center', inline:'center'}); }catch(e){}
        }
        return;
      }catch(e){}
    }
    let el=null;
    if(sel.includes(',')){
      const parts=sel.split(',').map(s=>s.trim());
      for(const part of parts){
        const cand=document.querySelector(part);
        if(cand && cand.offsetParent!==null){ el=cand; break; }
        if(cand && !el) el=cand;
      }
    } else {
      el=document.querySelector(sel);
      // Fallback para #buscador: si no encontrado, probar #inputBusqueda o #buscador contenedor
      if(!el && sel==='#buscador'){
        el=document.getElementById('buscador')||document.getElementById('inputBusqueda')||document.querySelector('#buscador');
      }
    }
    if(el){
      if(needsPanel && window.innerWidth<=1440){
        setTimeout(()=>{
          el.classList.add('tour-highlight');
          prevHighlight=el; prevHighlightSel=sel;
          try{ el.scrollIntoView({behavior:'smooth', block:'center', inline:'center'}); }catch(e){}
        }, 400);
      } else {
        el.classList.add('tour-highlight');
        prevHighlight=el; prevHighlightSel=sel;
        try{ el.scrollIntoView({behavior:'smooth', block:'center', inline:'center'}); }catch(e){}
      }
    } else {
      console.warn('Tour highlight no encontrado para', sel);
    }
  }
  function renderTour(){
    const s = steps[tourIdx];
    if(tourCurrent) tourCurrent.textContent = String(tourIdx+1);
    if(tourTotal) tourTotal.textContent = String(steps.length);
    if(tourTitle) tourTitle.innerHTML = `<i class="fas ${s.icon}"></i> ${s.title}`;
    if(tourText) tourText.innerHTML = s.html;
    highlight(s.sel);
    if(tourPrev) tourPrev.style.display = tourIdx===0 ? 'none':'inline-flex';
    if(tourNext) { tourNext.style.display = tourIdx===steps.length-1 ? 'none':'inline-flex'; tourNext.innerHTML = 'Siguiente <i class="fas fa-chevron-right"></i>'; }
    if(tourClose) tourClose.style.display = tourIdx===steps.length-1 ? 'inline-flex':'none';
  }
  function startTour(){
    tourIdx=0;
    if(!tourOverlay) return;
    tourOverlay.classList.add('active');
    tourOverlay.style.display='block';
    tourOverlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    renderTour();
  }
  function endTour(){
    if(tourOverlay){ tourOverlay.classList.remove('active'); tourOverlay.style.display='none'; tourOverlay.setAttribute('aria-hidden','true'); }
    document.body.style.overflow='';
    if(prevHighlight){
      try{ prevHighlight.classList.remove('tour-highlight'); prevHighlight.style.zIndex=''; }catch(e){}
      prevHighlight=null; prevHighlightSel=null;
    }
    // limpiar highlight de mapa si quedó
    try{ const mp=document.getElementById('map'); if(mp){ mp.classList.remove('tour-highlight'); mp.style.zIndex=''; } }catch(e){}
    try{ localStorage.setItem(TOUR_KEY, String(Date.now())); }catch(e){}
  }
  tourNext?.addEventListener('click', ()=>{ if(tourIdx < steps.length-1){ tourIdx++; renderTour(); } });
  tourPrev?.addEventListener('click', ()=>{ if(tourIdx>0){ tourIdx--; renderTour(); } });
  tourClose?.addEventListener('click', endTour);
  tourSkip?.addEventListener('click', endTour);
  // Tour: no cerrar al hacer click fuera (evita cierre accidental en paso del mapa)
  // 
  tourOverlay?.addEventListener('click', (e)=>{ if(e.target===tourOverlay){ /* no-op: solo cerrar con botones/Escape */ } });
  // Evitar que highlight del mapa intercepte clicks del tour
  document.getElementById('tour-card')?.addEventListener('click', e=>e.stopPropagation());
  document.addEventListener('keydown', (e)=>{ if(tourOverlay?.classList.contains('active')){ if(e.key==='Escape') endTour(); if(e.key==='ArrowRight' && tourIdx < steps.length-1){ tourIdx++; renderTour(); } if(e.key==='ArrowLeft' && tourIdx>0){ tourIdx--; renderTour(); } } });

  // Header buttons
  document.getElementById('btn-tour-header')?.addEventListener('click', startTour);
  $('#welcome-tour-btn')?.addEventListener('click', startTour);
  // También exponer global
  window.startTour = startTour;
  window.showWelcome = showWelcome;

  // Init welcome after DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initWelcome);
  else initWelcome();

  // --- FAQ ---
  const faqOverlay = $('#faq-overlay');
  const faqClose = $('#faq-close');
  const faqSearch = $('#faq-search');
  const faqBody = $('#faq-body');
  const faqStats = $('#faq-stats');
  const faqAskAi = $('#faq-ask-ai');
  function openFaq(){ if(!faqOverlay) return; faqOverlay.classList.add('active'); faqOverlay.style.display='flex'; faqOverlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeFaq(){ if(!faqOverlay) return; faqOverlay.classList.remove('active'); faqOverlay.style.display='none'; faqOverlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.getElementById('btn-faq-header')?.addEventListener('click', openFaq);
  faqClose?.addEventListener('click', closeFaq);
  faqOverlay?.addEventListener('click', (e)=>{ if(e.target===faqOverlay) closeFaq(); });
  faqAskAi?.addEventListener('click', ()=>{ closeFaq(); toggleAi(true); });
  // Acordeón
  $$('.faq-item .faq-q', faqBody||document).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // cerrar otros opcional: mantener abiertos múltiples; si quieres solo uno, descomenta:
      // $$('.faq-item.open', faqBody).forEach(i=>i.classList.remove('open'));
      if(wasOpen) item.classList.remove('open'); else item.classList.add('open');
    });
  });
  // Búsqueda FAQ
  faqSearch?.addEventListener('input', ()=>{
    const q = faqSearch.value.trim().toLowerCase();
    const items = $$('.faq-item', faqBody);
    let visible=0;
    items.forEach(it=>{
      const txt = it.textContent.toLowerCase();
      const match = !q || txt.includes(q);
      it.style.display = match ? '' : 'none';
      if(match) visible++;
    });
    // categorías visibility
    $$('.faq-category', faqBody).forEach(cat=>{
      let next = cat.nextElementSibling;
      let hasVisible=false;
      while(next && !next.classList.contains('faq-category')){
        if(next.style.display!=='none' && next.classList.contains('faq-item')){ hasVisible=true; break; }
        next=next.nextElementSibling;
      }
      cat.style.display = hasVisible || !q ? '' : 'none';
    });
    if(faqStats) faqStats.textContent = visible + ' preguntas';
    if(q && visible===0 && faqStats) faqStats.textContent='Sin resultados';
  });
  // links dentro de FAQ que disparan tour
  $$('.faq-link[data-action="tour"]', faqBody||document).forEach(el=>el.addEventListener('click', ()=>{ closeFaq(); startTour(); }));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && faqOverlay?.classList.contains('active')) closeFaq(); });
  window.openFaq = openFaq;

  // --- AI ASSISTANT (solo sistema) ---
  const aiToggle = $('#ai-toggle');
  const aiPanel = $('#ai-panel');
  const aiClose = $('#ai-close');
  const aiClear = $('#ai-clear');
  const aiInput = $('#ai-input');
  const aiSend = $('#ai-send');
  const aiMessages = $('#ai-messages');
  const aiSuggestions = $('#ai-suggestions');
  let aiOpen = false;
  function toggleAi(force){
    aiOpen = typeof force==='boolean' ? force : !aiOpen;
    if(!aiOpen){ try{ aiCallar(); }catch(e){} try{ aiMicDetener(); }catch(e){} }
    if(aiOpen){ try{ aiRevisarMicrofono(); }catch(e){} try{ aiVocesCargadas(); }catch(e){} }
    if(aiPanel) aiPanel.style.display = aiOpen ? 'flex':'none';
    if(aiToggle) aiToggle.style.display = aiOpen ? 'none':'flex';
    if(aiOpen && aiInput) setTimeout(()=>aiInput.focus(), 120);
  }
  aiToggle?.addEventListener('click', ()=>toggleAi(true));
  aiClose?.addEventListener('click', ()=>toggleAi(false));
  // Click fuera para cerrar? mantener abierto hasta close
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && aiOpen) toggleAi(false); });

  // Memoria conversacional para ANP
  let lastAnpDisplay = null;
  let lastAnpSigId = null;
  let lastAnpSimecId = null;
  // Control del geovisor por Balam
  function balamNewQuery(query){
  try{ try{ map.closePopup(); }catch(e){} }catch(e){}
  try{ var b=document.getElementById('inputBusqueda'); if(b) b.value=''; }catch(e){}
  try{ var r=document.getElementById('resultados-busqueda'); if(r) r.style.display='none'; }catch(e){}
  try{
    if(typeof allFeaturesForSearch!=='undefined'){
      allFeaturesForSearch.forEach(function(item){
        try{ if(item.layer && item.layer.eachLayer) item.layer.eachLayer(function(s){ try{ if(s.setStyle) s.setStyle({fillOpacity:0.42, weight:2, opacity:0.88}); }catch(e){} }); }catch(e){}
      });
    }
  }catch(e){}
  try{ return balamZoomToAnp(query); }catch(e){ return {found:false, name:query}; }
}
window.balamNewQuery = balamNewQuery;

function balamZoomToAnp(query){
    const q = normalize(query);
    // Comando explícito para limpiar
    if(q.includes('borra') || q.includes('limpiar') || q.includes('nueva consulta') || q.includes('limpia')){
      try{
        map.closePopup();
        const busq = document.getElementById('inputBusqueda');
        if(busq) busq.value='';
        const res = document.getElementById('resultados-busqueda');
        if(res) res.style.display='none';
        if(typeof allFeaturesForSearch!=='undefined'){
          allFeaturesForSearch.forEach(item=>{
            try{ if(item.layer && item.layer.eachLayer) item.layer.eachLayer(s=>{ try{ if(s.setStyle) s.setStyle({fillOpacity:0.42, weight:2}); }catch(e){} }); }catch(e){}
          });
        }
        lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null;
        try{ map.setView([23.5, -102], 5); }catch(e){}
      }catch(e){}
      return {found:true, name:'limpieza', cleared:true};
    }
    let targetDisplay = null;
    let targetId = null;
    // 1) Buscar en SIG_ANP_MAP por nombre exacto/normalizado
    if(typeof SIG_ANP_MAP!=='undefined'){
      for(const disp in SIG_ANP_MAP){
        const nDisp = normalize(disp);
        if(q.includes(nDisp) && nDisp.length>=4){ targetDisplay=disp; targetId=SIG_ANP_MAP[disp]; break; }
      }
      if(!targetDisplay){
        for(const id of Object.values(SIG_ANP_MAP)){
          const nId = normalize(id);
          if(q.includes(nId) && nId.length>=4){ targetDisplay=id; targetId=id; break; }
        }
      }
    }
    // 2) Si no se encontró por SIG, buscar directamente en allFeaturesForSearch por coincidencia de palabras
    let bestFeat = null;
    let bestLayerEntry = null;
    try{
      if(typeof allFeaturesForSearch!=='undefined' && allFeaturesForSearch.length){
        // Primero intentar con targetDisplay si ya lo tenemos
        if(targetDisplay){
          for(const item of allFeaturesForSearch){
            const fname = (typeof getFeatureName==='function' ? getFeatureName(item.feature.properties) : (item.feature.properties.nombre||item.feature.properties.nom||'')) || '';
            const nName = normalize(fname);
            const nTarget = normalize(targetDisplay);
            if(nName && (nName===nTarget || nName.includes(nTarget) || nTarget.includes(nName))){
              bestFeat = item.feature; bestLayerEntry=item; targetDisplay = fname||targetDisplay; break;
            }
          }
        }
        // Si no hay targetDisplay o no se encontró, buscar por palabras del query
        if(!bestFeat){
          const qWords = q.split(' ').filter(w=>w.length>2);
          let bestScore=0;
          for(const item of allFeaturesForSearch){
            const fname = (typeof getFeatureName==='function' ? getFeatureName(item.feature.properties) : (item.feature.properties.nombre||'')) || '';
            const nName = normalize(fname);
            if(!nName) continue;
            let score=0;
            for(const w of qWords){ if(nName.includes(w)) score+=w.length; }
            // Bonus si contiene 'lago' y 'texcoco' juntos
            if(q.includes('lago') && q.includes('texcoco') && nName.includes('lago') && nName.includes('texcoco')) score+=20;
            if(score>bestScore){ bestScore=score; bestFeat=item.feature; bestLayerEntry=item; targetDisplay=fname; }
          }
          if(bestScore>=4 && bestFeat){
            // ya tenemos best
          } else if(!targetDisplay){
            // Si aún no hay target, usar el de mejor score aunque sea bajo, si es lago texcoco
            if(q.includes('texcoco') && bestFeat) { /* keep */ } else { bestFeat=null; }
          }
        }
      }
    }catch(e){ console.warn('balamZoom search error', e); }

    // 2.5) Limpiar consulta anterior automáticamente si es otra ANP/ADVC
    try{
      if(lastAnpDisplay && targetDisplay && normalize(lastAnpDisplay)!==normalize(targetDisplay)){
        try{ map.closePopup(); }catch(e){}
        try{
          if(typeof allFeaturesForSearch!=='undefined'){
            allFeaturesForSearch.forEach(item=>{
              try{ if(item.layer && item.layer.eachLayer) item.layer.eachLayer(subl=>{ try{ if(subl.setStyle) subl.setStyle({fillOpacity:0.42, weight:2, opacity:0.88}); }catch(e){} }); }catch(e){}
            });
          }
        }catch(e){}
        const busqPrev = document.getElementById('inputBusqueda');
        if(busqPrev) busqPrev.value='';
        const resPrev = document.getElementById('resultados-busqueda');
        if(resPrev) resPrev.style.display='none';
        // Limpiar filtros de dashboard si existen
        try{ const cs = document.querySelectorAll('.capa-item.atenuado'); cs.forEach(el=>el.classList.remove('atenuado')); }catch(e){}
      }
    }catch(e){}

    // 3) Si encontramos feature, hacer zoom a SU geometría (no a toda la capa)
    if(bestFeat && typeof map!=='undefined' && typeof L!=='undefined'){
      try{
        const featBounds = L.geoJSON(bestFeat).getBounds();
        if(featBounds && featBounds.isValid()){
          // Guardar memoria
          lastAnpDisplay = targetDisplay; lastAnpSigId = targetId;
          try{ lastAnpSimecId = (typeof getSimecIdForAnp==='function') ? getSimecIdForAnp(targetDisplay) : null; }catch(e){}
          map.fitBounds(featBounds, {padding:[30,30], animate:true, duration:0.8}); // zoom a coordenadas extremas sin limitar maxZoom, encuadra exacto
          // Mostrar coordenadas extremas en consola y popup
          try{
            const sw = featBounds.getSouthWest();
            const ne = featBounds.getNorthEast();
            console.log(`Balam zoom extremas ${targetDisplay}: SW [${sw.lat.toFixed(5)}, ${sw.lng.toFixed(5)}] NE [${ne.lat.toFixed(5)}, ${ne.lng.toFixed(5)}]`);
          }catch(e){}
          // Intentar abrir popup del feature específico (buscar sublayer)
          try{
            const parentEntry = bestLayerEntry;
            if(parentEntry && parentEntry.layer){
              let opened=false;
              parentEntry.layer.eachLayer(subl=>{
                try{
                  const p = subl.feature && subl.feature.properties;
                  const sName = p ? (getFeatureName ? getFeatureName(p) : p.nombre) : '';
                  if(sName && normalize(sName)===normalize(targetDisplay)){
                    try{ subl.openPopup(); opened=true; }catch(e){}
                    // Resaltar brevemente
                    try{ if(subl.setStyle) subl.setStyle({fillOpacity:0.7, weight:3}); setTimeout(()=>{ try{ subl.setStyle({fillOpacity:0.42, weight:2}); }catch(e){} }, 1800); }catch(e){}
                  }
                }catch(e){}
              });
              if(!opened){
                // Fallback: crear popup temporal en centro
                try{
                  const center = featBounds.getCenter();
                  L.popup({className:'custom-popup'}).setLatLng(center).setContent(`<div style="padding:0.5rem; font-family:Inter; font-size:0.78rem;"><b>${targetDisplay}</b><br><small style="color:#5e8e30;">Centrado por Balam</small></div>`).openOn(map);
                }catch(e){}
              }
            }
          }catch(e){}
          // Forzar actualización de dashboard si está activo
          try{ if(typeof temaActual!=='undefined' && temaActual==='dashboard' && typeof actualizarDashboard==='function'){ setTimeout(()=>actualizarDashboard(), 500); } }catch(e){}
          // También asegurar que el panel no tape
          try{ if(window.innerWidth<=1440 && typeof closePanel==='function'){ /* no cerrar para que se vea */ } }catch(e){}
          return {found:true, name:targetDisplay, bounds:true};
        }
      }catch(e){ console.warn('balamZoom featBounds error', e); }
    }

    // 4) Si tenemos targetId de SIG pero no encontramos feature (capa no cargada), intentar cargar la capa ANP si no está activa y reintentar
    if(targetId && typeof map!=='undefined'){
      try{
        // Si la capa ANP no está cargada, intentar activarla
        const chk = document.getElementById('chk-shp_anp');
        if(chk && !chk.checked){
          chk.checked=true; chk.dispatchEvent(new Event('change'));
          // Esperar a que cargue y reintentar zoom en 1.2s
          setTimeout(()=>{ try{ balamZoomToAnp(targetDisplay); }catch(e){} }, 1400);
          return {found:true, name:targetDisplay, viaCarga:true};
        }
        // Fallback buscador
        const busq = document.getElementById('inputBusqueda');
        if(busq){
          busq.value = targetDisplay || query;
          busq.dispatchEvent(new Event('input', {bubbles:true}));
          busq.focus();
          setTimeout(()=>{
            const firstResult = document.querySelector('#resultados-busqueda .result-item');
            if(firstResult){ firstResult.click(); }
            else {
              // Si no hay resultado, al menos hacer zoom al texto
              const v = busq.value;
              if(v) console.log('Balam buscador sin resultados para', v);
            }
          }, 700);
          return {found:true, name:targetDisplay||query, viaBuscador:true};
        }
      }catch(e){}
    }

    // 5) Último fallback: si solo tenemos query, intentar con buscador directo
    try{
      const busq2 = document.getElementById('inputBusqueda');
      if(busq2 && !targetDisplay){
        busq2.value = query;
        busq2.dispatchEvent(new Event('input', {bubbles:true}));
        setTimeout(()=>{
          const fr = document.querySelector('#resultados-busqueda .result-item');
          if(fr) fr.click();
        }, 700);
        return {found:true, name:query, viaBuscador:true};
      }
    }catch(e){}
    return {found:!!targetDisplay, name:targetDisplay||query};
  }

  // Base de conocimiento local (solo sistema)
  const KB = [
    { k:['hola','buenos','saludo','balam','jaguar'], a:'¡Hola! Soy <b>Balam</b> <i class="fas fa-paw"></i>, tu jaguar IA del geovisor CONANP. Solo respondo con datos del sistema (capas CONANP, búsqueda, análisis, dashboard e impresión) y te dirijo a <a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener">SIG</a> / <a href="https://simec.conanp.gob.mx/" target="_blank" rel="noopener">SIMEC</a> para descargas oficiales. ¿En qué te ayudo?' },
    { k:['qué es','que es','anp','area natural protegida'], a:'<b>ANP</b> = Áreas Naturales Protegidas decretadas y administradas por <b>CONANP</b>. En el grupo <b>CONANP</b> verás su polígono, categoría de manejo, superficie y decreto. Son datos oficiales.' },
    { k:['advc','destinada voluntariamente','certificada'], a:'<b>ADVC</b> = Áreas Destinadas Voluntariamente a la Conservación: predios de ejidos, comunidades, personas físicas o morales y gobiernos que sus dueños dedican a conservar y la CONANP certifica. En la CONANP se tienen registradas <b>623 ADVC vigentes (junio 2026)</b> en 30 entidades. Cada ADVC tiene <b>tipo de propiedad (Social/Privada/Pública)</b>, <b>superficie certificada (supCertADVC)</b> y <b>superficie sin traslape con ANP</b> para no contar doble.<br><div style="margin-top:0.5rem;font-size:0.70rem;color:var(--text-muted);">¿La filtramos por propiedad, descargamos el <b>SHP</b> o contamos cuántas hay por tipo? ¿Puedo ayudarte en algo más?</div>' },
    { k:['capas oficiales','grupo conanp','cuales son oficiales','capas validadas'], a:'Solo el grupo <b>CONANP</b> (ANP, ADVC, Regiones, Zonas Núcleo) es oficial CONANP. Ramsar, KBA, UNESCO y límites son <b>referencia externa</b> y su precisión depende de la fuente.' },
    { k:['buscar','buscador','nombre'], a:'Usa el <b>buscador superior</b> (“Buscar área o polígono…”). Escribe ≥2 letras, filtra capas CONANP visibles y selecciona un resultado para hacer <b>zoom y resaltar</b>.' },
    { k:['cargar capa','capa local','geojson','kml','shp'], a:'Con <b>Cargar capa local</b> sube <b>GeoJSON, KML o SHP.ZIP</b> (.shp/.shx/.dbf/.prj). Aparece arriba, con <b>opacidad</b> y editor de <b>simbología</b>. Sirve como <b>fuente o destino</b> en Análisis.' },
    { k:['filtro','filtrar','propiedad','categoria','estado','atributo'], a:'En cada grupo pulsa <i class="fas fa-filter"></i> → elige <b>atributo → valores</b>. Filtra ANP por <b>categoría/estado</b> y ADVC por <b>propiedad (Social/Privada/Pública)</b>. El Dashboard y el mapa se actualizan.' },
    { k:['opacidad','transparencia','ver'], a:'Cada capa tiene deslizador <b>Opacidad</b> (0–100%). Baja la opacidad de la capa superior para comparar traslapes. Está bajo el nombre de la capa.' },
    { k:['analisis','análisis','territorial','superficie','traslape','poligono','dibujar'], a:'Dibuja <b>rectángulo/polígono</b> (barra izquierda) o haz <b>clic en una entidad</b>. El panel <b>Análisis territorial</b> calcula <b>superficie seleccionada, % en ANP/ADVC y traslapes</b> con <code>Turf.js</code>. Define <b>Fuente</b> y <b>Destino</b>.' + aiNavRow('<button class="ai-chip" data-ai-action="ir-mapa">Ir al mapa</button>') },
    { k:['supcertsintraslape','sin traslape','doble'], a:'<b>supCertSinTraslape = supCertADVC − traslape con ANP</b>. Evita contar dos veces la misma superficie al sumar ANP + ADVC. El Dashboard lo muestra en tooltips.' },
    { k:['dashboard','kpi','grafica','gráfica','tabla'], a:'Pestaña <b>Dashboard</b>: <b>KPIs</b> (conteo/superficie), gráficas de <b>categoría, estado, propiedad y periodo</b> y <b>tabla ADVC/ANP</b>. Usa <i class="fas fa-expand-alt"></i> para <b>Vista ampliada</b> y <i class="fas fa-download"></i> para <b>PNG/JPG/CSV</b>.' + aiNavRow('<button class="ai-chip" data-ai-action="ir-dashboard">Abrir Dashboard</button>') },
    { k:['imprimir','impresion','pdf','impresora','escala','norte'], a:'Botón <b>Imprimir</b> (<i class="fas fa-print"></i>) en el mapa: <b>Imprimir vista</b> (encabezado 132 mm + KPIs + leyenda + fuentes + disclaimer) o <b>Imprimir área</b> (dibuja rectángulo). El Dashboard también tiene <b>Imprimir Dashboard</b> paginado. Incluye <b>escala, norte y fecha</b>.' },
    { k:['restaurar','quitar grafica','cerrar grafica'], a:'Cada tarjeta del Dashboard tiene <i class="fas fa-times"></i> para <b>cerrar</b>. Para recuperarlas pulsa <b>Restaurar gráficas</b> (guarda en <code>localStorage grafico-cerrados</code>).' },
    { k:['descargar','png','jpg','csv','exportar'], a:'Descarga por capa (<i class="fas fa-download"></i>) o por gráfica: elige <b>PNG/JPG/CSV</b>. La tabla ADVC/ANP también permite CSV. Para <b>shapefiles oficiales</b> y capas completas visita <b>SIG CONANP</b> y <b>SIMEC</b> (ver enlaces abajo).' },
    { k:['geoserver','wfs','no cargan','vacias','cargando'], a:'Si una capa no carga, verifica que el <b>GeoServer</b> esté en línea y publica el geovisor por HTTP o HTTPS (evita abrirlo como archivo local <code>file://</code> por bloqueo CORS). El contador muestra “cargada (N elementos)” o el error.' },
    { k:['advc propiedad','tipo de propiedad','propiedad social','propiedad privada','filtrar advc'], a:'Para filtrar ADVC por propiedad abre el filtro de la capa <b>shp_advc</b> (icono de embudo) y elige el atributo de tipo de propiedad con valores <b>Social, Privada o Pública</b>. El mapa y el Dashboard se actualizan, y la gráfica <b>Tipo de propiedad ADVC</b> muestra el reparto.' + aiNavRow('<button class="ai-chip" data-ai-action="ir-dashboard">Ver en Dashboard</button>') + '<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">¿Descargo el <b>SHP</b> o cuento cuántas hay por tipo? ¿Puedo ayudarte en algo más?</div>' },
    { k:['cuantas advc','numero advc','advc hay','total advc','cuantas areas voluntarias'], a:'En la CONANP se tienen registradas <b>623 ADVC vigentes (junio 2026)</b> en 30 entidades federativas. Si tienes la capa <b>shp_advc</b> cargada te doy el conteo en vivo por tipo de propiedad.<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">¿Las vemos por estado o por propiedad? ¿Puedo ayudarte en algo más?</div>' },
    { k:['diferencia anp advc','anp vs advc','anp o advc','que diferencia hay'], a:'La <b>ANP</b> la decreta el Gobierno Federal y la administra CONANP; el <b>ADVC</b> lo propone su dueño (ejido, comunidad, privado o gobierno) y CONANP lo certifica. En la CONANP se tienen registradas <b>232 ANP</b> y <b>623 ADVC vigentes</b>. Ambas se consultan en el grupo <b>CONANP</b>.<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">¿Buscamos un ANP o un ADVC? ¿Puedo ayudarte en algo más?</div>' },
    { k:['anp shapefile','shp anp','shape anp','descargar anp','anp shp','areas naturales shapefile'], a:'<b>ANP – Shapefile oficial (232 ANP, ITRF08):</b> <a href="https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip" target="_blank" rel="noopener">Descargar ZIP directo</a><br>Portal: <a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener">https://sig.conanp.gob.mx/</a> · Fichas y decretos: <a href="https://simec.conanp.gob.mx/" target="_blank" rel="noopener">https://simec.conanp.gob.mx/</a>' },
    { k:['advc shapefile','shp advc','shape advc','descargar advc','advc shp','advc vigentes shape'], a:'<b>SHP ADVC oficial (623 vigentes, junio 2026):</b> <a href="https://sig.conanp.gob.mx/container/descargas/files/shape/623_ADVC_VIGENTES_JUNIO_2026.zip" target="_blank" rel="noopener">SHP</a> · <b>KML:</b> <a href="https://sig.conanp.gob.mx/container/descargas/files/kml/623_ADVC_VIGENTES_JUNIO_2026.kmz" target="_blank" rel="noopener">KML</a><br>Portales: <a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener">SIG</a> · <a href="https://simec.conanp.gob.mx/" target="_blank" rel="noopener">SIMEC</a><br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">¿También el <b>SHP de ANP</b>? ¿Puedo ayudarte en algo más?</div>' },
    { k:['shapefile','shp','shape','descarga shape','descargar shape','sig conanp','simec','sig','descargas oficiales','datos abiertos'], a:'<b>Descargas oficiales en Shapefile / Geoespaciales:</b><br>· <b>ANP</b>: <a href="https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip" target="_blank" rel="noopener">SHP ANP</a> · <b>ADVC</b>: <a href="https://sig.conanp.gob.mx/container/descargas/files/shape/623_ADVC_VIGENTES_JUNIO_2026.zip" target="_blank" rel="noopener">SHP ADVC</a><br>· Portales: <a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener">SIG</a> · <a href="https://sig.conanp.gob.mx/SIG-ENP/" target="_blank" rel="noopener">SIG-ENP</a> · <a href="https://simec.conanp.gob.mx/" target="_blank" rel="noopener">SIMEC</a> (<a href="https://simec.conanp.gob.mx/ficha.php" target="_blank" rel="noopener">FICHAS</a> · <a href="https://www.gob.mx/conanp/documentos/programas-de-manejo" target="_blank" rel="noopener">PROGRAMAS</a>)<br>Desde el geovisor: <b>PNG/JPG/CSV</b> por capa/gráfica; <b>Shapefile</b> directo arriba para CONANP.' },
    { k:['decreto','publicacion','programa de manejo','manejo','diario oficial','anp decreto'], a:'<b>Decretos y Programas de Manejo:</b><br>· Decretos por ANP en <b>SIMEC</b>: <a href="https://simec.conanp.gob.mx/decretos.php" target="_blank" rel="noopener">DECRETOS</a> y <a href="https://simec.conanp.gob.mx/ficha.php" target="_blank" rel="noopener">FICHA SIMEC</a> por ANP<br>· Programas de manejo PDF: <a href="https://www.gob.mx/conanp/documentos/programas-de-manejo" target="_blank" rel="noopener">PROGRAMAS DE MANEJO</a><br>· Información geoespacial en <a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener">SIG CONANP</a>.' },
    { k:['tema','oscuro','claro','dark','light'], a:'Botón <b>Sol/Luna</b> en el header cambia entre <b>tema claro y oscuro</b>. Se guarda en <code>localStorage geovisor-theme</code> y no produce destello (anti-FOUC).' },
    { k:['ayuda','faq','preguntas','tutorial','recorrido'], a:'Para ayuda: <b>Recorrido guiado</b> (<i class="fas fa-graduation-cap"></i> en el header) te lleva paso a paso; <b>FAQ</b> (<i class="fas fa-circle-question"></i>) reúne respuestas; y <b>Balam</b> solo usa datos del sistema y te guía a SIG/SIMEC.' },
    { k:['responsable','disclaimer','uso','dictamen'], a:'<b>Aviso:</b> “Información de carácter informativo. No constituye dictamen técnico. La CONANP no se hace responsable del uso que el usuario le dé a los datos.” Aparece en Análisis y en cada impreso.' },
    { k:['zonificacion','subzonificacion','zonas nucleo','zona nucleo','subzona'], a:'<b>Zonificaci\u00f3n primaria</b> = las <b>zonas n\u00facleo</b> del ANP. <b>Subzonificaci\u00f3n</b> = la dispuesta por los <b>programas de manejo</b> (<b>solo las ANP con programa de manejo</b> tienen subzonificaci\u00f3n). Si ya ubicaste un ANP, p\u00eddele su <b>subzonificaci\u00f3n (SHP)</b> y te doy la descarga.<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">\u00bfPuedo ayudarte en algo m\u00e1s?</div>' },
    { k:['fuente','donde','origen'], a:'Las <b>Fuentes</b> se listan en cada impreso y en el Dashboard. Solo CONANP es oficial; las demás capas citan su dependencia origen.' },
    { k:['gracias','ok','perfecto'], a:'¡De nada! Si necesitas más, prueba el <b>Recorrido</b> o escribe otra duda. Solo respondo sobre el geovisor y datos CONANP.' },
  ];
  const FALLBACK = 'Soy <b>Balam</b> y solo respondo con <b>datos del geovisor y del grupo CONANP</b>. Para <b>shapefiles, decretos y programas de manejo</b> visita <a href="https://sig.conanp.gob.mx/" target="_blank" rel="noopener">SIG</a> y <a href="https://simec.conanp.gob.mx/" target="_blank" rel="noopener">SIMEC</a>. Prueba: <b>“¿Dónde está Lago de Texcoco?”</b>, <b>“descargar shapefile Calakmul”</b> o <b>“¿Qué es ADVC?”</b>.<br><div style="margin-top:0.5rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>';

  // --- Balam: solo asistente virtual + navegación por el geovisor ---
  let aiPendingOffer = null;
  let aiChartSeq = 0;
  const aiChartQueue = {};
  const aiCharts = [];
  function aiNavRow(botones){
    return `<div class="ai-nav-row">${botones}</div>`;
  }
  function irSeccion(dest){
    try{
      if(typeof switchTab!=='function') return false;
      if(dest==='dashboard') switchTab('dashboard');
      else if(dest==='advc') switchTab('advc');
      else switchTab('general');
      return true;
    }catch(e){ return false; }
  }
  function urlDocAi(tipo){
    try{
      var disp = lastAnpDisplay;
      var sid = lastAnpSimecId || ((typeof getSimecIdForAnp==='function' && disp) ? getSimecIdForAnp(disp) : null);
      var sig = lastAnpSigId || disp;
      if(tipo==='decreto') return sid ? ('https://simec.conanp.gob.mx/pdf_decretos/'+sid+'_decreto.pdf') : 'https://simec.conanp.gob.mx/decretos.php';
      if(tipo==='ficha') return sid ? ('https://simec.conanp.gob.mx/ficha.php?anp='+sid) : 'https://simec.conanp.gob.mx/ficha.php';
      if(tipo==='programa') return sid ? ('https://simec.conanp.gob.mx/ficha.php?anp='+sid) : 'https://www.gob.mx/conanp/documentos/programas-de-manejo';
      if(tipo==='shp') return sig ? ('https://sig.conanp.gob.mx/container/data/shp/anp/'+sig+'.zip') : null;
      if(tipo==='kml') return sig ? ('https://sig.conanp.gob.mx/container/data/kml/anp/'+sig+'.kml') : null;
      if(tipo==='zon') return sig ? ('https://sig.conanp.gob.mx/container/data/shp/zonificacion/Sub_'+sig+'.zip') : null;
    }catch(e){}
    return null;
  }
  function abrirDocAi(tipo){
    var nombres = {decreto:'decreto (PDF)', ficha:'ficha SIMEC', programa:'programa de manejo', shp:'shapefile', kml:'KML', zon:'subzonificación'};
    var url = urlDocAi(tipo);
    if(!url){ addMsg('Aún no ubico un ANP/ADVC para abrir su ' + (nombres[tipo]||'documento') + '. Dime primero el nombre (por ejemplo “Calakmul”).', 'bot'); return; }
    var w = null;
    try{ w = window.open(url, '_blank', 'noopener'); }catch(e){ w = null; }
    if(!w){
      addMsg('Tu navegador bloqueó la ventana nueva. Ábrelo con este enlace: <a href="' + url + '" target="_blank" rel="noopener">Abrir ' + (nombres[tipo]||'documento') + '</a>', 'bot');
    } else {
      try{ if(w.opener!=null) w.opener = null; }catch(e){}
      addMsg('Abriendo ' + (nombres[tipo]||'el documento') + (lastAnpDisplay ? (' de <b>' + lastAnpDisplay + '</b>') : '') + ' en una pestaña nueva…<br><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>', 'bot');
    }
  }
  function atenderAccionAi(action){
    try{
      if(action==='ir-dashboard'){
        aiPendingOffer = null;
        if(irSeccion('dashboard')) addMsg('Listo, te llevé al <b>Dashboard</b>. Ahí están las gráficas y KPIs con los datos en vivo.<br><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>', 'bot');
        else addMsg('Abre la pestaña <b>Dashboard</b> (barra superior) para ver las gráficas.', 'bot');
      } else if(action==='ir-mapa' || action==='ir-general'){
        aiPendingOffer = null;
        if(irSeccion('general')) addMsg('Te llevé al <b>mapa general</b>.', 'bot');
      } else if(action==='ir-advc'){
        aiPendingOffer = null;
        if(irSeccion('advc')) addMsg('Te llevé a la vista de <b>ADVC</b>.', 'bot');
      } else if(action.indexOf('abrir-')===0){
        aiPendingOffer = null;
        abrirDocAi(action.slice(6));
      }
    }catch(e){}
  }
  function datosCategoriaAi(){
    try{
      if(typeof activeLayers==='undefined') return null;
      var anpK = Object.keys(activeLayers).find(function(k){ try{ return (typeof esCapaAnpPrincipal==='function' && esCapaAnpPrincipal(k)); }catch(e){ return k==='shp_anp'; } });
      if(!anpK || !activeLayers[anpK]) return null;
      var entry = activeLayers[anpK];
      var feats = entry.featuresData || [];
      if(!feats.length) return null;
      var catCol = entry.categoriaCol;
      if(!catCol) return null;
      var supCol = entry.superficieCol || ((typeof detectarColumnaSuperficie==='function') ? detectarColumnaSuperficie(feats) : null);
      var grupos = {};
      feats.forEach(function(f){
        var pr = f.properties || {};
        var cat = pr[catCol];
        if(cat===null || cat===undefined || cat==='') return;
        var k = String(cat).trim();
        if(!grupos[k]) grupos[k] = {count:0, area:0};
        grupos[k].count++;
        if(supCol && typeof pr[supCol]==='number') grupos[k].area += pr[supCol];
      });
      var keys = Object.keys(grupos);
      if(!keys.length) return null;
      return {grupos:grupos, keys:keys, total:feats.length};
    }catch(e){ return null; }
  }
  function respuestaGraficaAi(modo){
    var datos = datosCategoriaAi();
    if(!datos){
      return 'Para graficar necesito la capa de <b>ANP</b> cargada en el visor. Actívala en el panel de capas y vuelve a pedirme la gráfica.' + aiNavRow('<button class="ai-chip" data-ai-action="ir-mapa">Ir al mapa</button>') + '<div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>';
    }
    var metrica = (modo==='conteo') ? 'count' : 'area';
    var orden = datos.keys.slice().sort(function(a,b){ return metrica==='count' ? (datos.grupos[b].count - datos.grupos[a].count) : (datos.grupos[b].area - datos.grupos[a].area); }).slice(0,8);
    var etiquetas = orden.map(function(k){ try{ return (typeof getNombreCompleto==='function') ? getNombreCompleto(k) : k; }catch(e){ return k; } });
    var valores = orden.map(function(k){ return metrica==='count' ? datos.grupos[k].count : Math.round(datos.grupos[k].area); });
    var colores = orden.map(function(k){ try{ return (typeof getColorPorCategoria==='function') ? getColorPorCategoria(k) : '#1a5c4e'; }catch(e){ return '#1a5c4e'; } });
    var titulo = metrica==='count' ? 'Número de ANP por categoría de manejo' : 'Superficie por categoría de manejo (ha)';
    aiChartSeq++;
    var cid = 'ai-chart-' + aiChartSeq;
    aiChartQueue[cid] = {labels:etiquetas, values:valores, colors:colores, ylabel:(metrica==='count' ? 'ANP' : 'Hectáreas')};
    aiPendingOffer = {dest:'dashboard'};
    var otroModo = metrica==='count' ? 'superficie' : 'conteo';
    return '¡Claro, aquí está lo que buscas! <b>' + titulo + '</b>, con los datos cargados en el visor (' + datos.total + ' ANP).'
      + '<div class="ai-chart-wrap"><canvas class="ai-chart" id="' + cid + '"></canvas></div>'
      + '<div style="margin-top:0.5rem; font-size:0.72rem;">Esta gráfica también está en el <b>Dashboard</b> (tarjeta “Superficie por categoría”). ¿Quieres verla en el Dashboard?</div>'
      + aiNavRow('<button class="ai-chip" data-ai-action="ir-dashboard">Sí, ver en el Dashboard</button><button class="ai-chip" data-q="gráfica de ' + otroModo + ' por categoría">Ver ' + otroModo + '</button>')
      + '<div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>';
  }
  function renderAiCharts(){
    try{
      if(typeof Chart==='undefined' || !aiMessages) return;
      var cvs = aiMessages.querySelectorAll('canvas.ai-chart');
      for(var i=0;i<cvs.length;i++){
        (function(cv){
          try{
            if(!cv.id || cv.dataset.rendered) return;
            var spec = aiChartQueue[cv.id];
            if(!spec) return;
            cv.dataset.rendered = '1';
            var esConteo = spec.ylabel==='ANP';
            var inst = new Chart(cv.getContext('2d'), {type:'bar',
              data:{labels:spec.labels, datasets:[{label:spec.ylabel, data:spec.values, backgroundColor:spec.colors, borderRadius:4}]},
              options:{responsive:true, maintainAspectRatio:true, plugins:{legend:{display:false}, tooltip:{callbacks:{label:function(c){ return ' ' + Number(c.parsed.y).toLocaleString('es-MX') + (esConteo ? ' ANP' : ' ha'); }}}}, scales:{y:{beginAtZero:true, ticks:{font:{size:8}}}, x:{ticks:{font:{size:7}, maxRotation:40, minRotation:20}}}}});
            aiCharts.push(inst);
          }catch(e){}
        })(cvs[i]);
      }
    }catch(e){}
  }

  function normalize(t){ return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').trim(); }

  function answerFor(text){
    const n = normalize(text);
    var nFlat = n.replace(/\s+/g,'');
    // 1) Detección per-ANP: si el texto menciona un ANP, devolver links directos SIG
    try{
      if(typeof getSigIdForAnp==='function' && typeof SIG_ANP_MAP!=='undefined'){
        // Si pide documento del ANP ya en contexto, ceder al follow-up (no re-presentar)
        var _quiereDoc = /decreto|ficha|programa|zonific|shp|kml|shape/.test(n);
        var _esFollow = n.includes('decreto') || n.includes('ficha') || n.includes('programa de manejo') || n.includes('programa manejo') || n.includes('zonificacion') || n.includes('shp') || n.includes('kml') || n.includes('shapefile');
        var _docDirecto = false;
        // Buscar ANP por nombre en el texto (normalizado)
        for(const display in SIG_ANP_MAP){
          const normDisp = normalize(display);
          var normFlat = normDisp.replace(/\s+/g,'');
          if((n.includes(normDisp) && normDisp.length>=4) || (normFlat.length>=4 && nFlat.includes(normFlat))){
            if(_quiereDoc && lastAnpDisplay && normalize(display)===normalize(lastAnpDisplay)) continue;
            const sigId = SIG_ANP_MAP[display];
            // Acción geovisor: hacer zoom y mostrar en dashboard
            var zoomResD = null;
            try{ zoomResD = balamZoomToAnp(display); }catch(e){}
            lastAnpDisplay = display; lastAnpSigId = sigId;
            try{ lastAnpSimecId = (typeof getSimecIdForAnp==='function') ? getSimecIdForAnp(display) : null; }catch(e){}
            if(_quiereDoc && _esFollow){ _docDirecto = true; break; }
            var leadD = `He ubicado <b>${display}</b> en el mapa y dashboard.`;
            if(zoomResD && zoomResD.viaCarga) leadD = `Estoy cargando la capa de ANP para ubicar <b>${display}</b>; el mapa se centrará en cuanto termine la carga.`;
            else if(!(zoomResD && zoomResD.found)) leadD = `Ubiqué <b>${display}</b> en el sistema, pero aún no puedo centrar el mapa (activa la capa ANP en el panel de capas).`;
            // Respuesta dialogada: no dar todo de golpe, preguntar primero
            const follow = `<div style="margin-top:0.65rem; padding:0.6rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.72rem;"><div style="font-weight:600; color:var(--text-primary); margin-bottom:0.4rem;">¿Qué quieres de <b>${display}</b>?</div><div style="display:flex; gap:0.35rem; flex-wrap:wrap;"><button class="ai-chip" data-q="ficha ${display}">FICHA SIMEC</button><button class="ai-chip" data-q="decreto ${display}">DECRETO</button><button class="ai-chip" data-q="programa de manejo ${display}">PROGRAMA</button><button class="ai-chip" data-q="descargar shapefile ${display}">SHP/KML</button><button class="ai-chip" data-q="subzonificación ${display}">SUBZONIFICACIÓN</button></div><div style="font-size:0.65rem; color:var(--text-muted); margin-top:0.35rem;">He centrado el mapa en <b>${display}</b>. Elige una opción.</div><div style="font-size:0.62rem; color:var(--text-muted); margin-top:0.35rem; border-top:1px dashed var(--border-subtle); padding-top:0.3rem;">Para otra ANP/ADVC, solo dime el nombre y generaré una <b>nueva consulta automáticamente</b> (limpio la anterior).</div></div>`;
            return `${leadD}<br>${follow}<div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
          }
        }
        // También probar por ID directo (ej: Calakmul)
        for(const id of Object.values(SIG_ANP_MAP)){
          const normId = normalize(id);
          var normIdFlat = normId.replace(/\s+/g,'');
          if((n.includes(normId) && normId.length>=4) || (normIdFlat.length>=4 && nFlat.includes(normIdFlat))){
            if(_quiereDoc && lastAnpDisplay && (id===lastAnpSigId || normalize(id)===normalize(lastAnpDisplay))) continue;
            if(_docDirecto) break;
            const shp = `https://sig.conanp.gob.mx/container/data/shp/anp/${id}.zip`;
            const kml = `https://sig.conanp.gob.mx/container/data/kml/anp/${id}.kml`;
            const zon = `https://sig.conanp.gob.mx/container/data/shp/zonificacion/Sub_${id}.zip`;
            try{ balamZoomToAnp(id); }catch(e){}
            lastAnpDisplay = id; lastAnpSigId = id;
            try{ lastAnpSimecId = (typeof getSimecIdForAnp==='function') ? getSimecIdForAnp(id) : null; }catch(e){}
            const follow2 = `<div style="margin-top:0.6rem; padding:0.55rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.72rem;"><div style="font-weight:600; margin-bottom:0.3rem;">He centrado <b>${id}</b> en el mapa.</div><div style="display:flex; gap:0.3rem; flex-wrap:wrap;"><button class="ai-chip" data-q="ficha ${id}">FICHA SIMEC</button><button class="ai-chip" data-q="decreto ${id}">DECRETO</button><button class="ai-chip" data-q="programa de manejo ${id}">PROGRAMA</button><button class="ai-chip" data-q="descargar shapefile ${id}">SHP/KML</button><button class="ai-chip" data-q="subzonificación ${id}">SUBZONIFICACIÓN</button></div><div style="font-size:0.62rem; color:var(--text-muted); margin-top:0.35rem; border-top:1px dashed var(--border-subtle); padding-top:0.3rem;">Para otra consulta, dime el nombre y haré una <b>nueva búsqueda automática</b>.</div></div>`;
            return `He ubicado <b>${id}</b>.<br>${follow2}<div style="margin-top:0.3rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
          }
        }
      }
    }catch(e){ console.warn('per-ANP Balam error', e); }
    
    // 1b) Numeralia ANP en vivo del visor
    try{
      var wantNum = /cuant|numer|total/.test(n);
      if(wantNum && !n.includes('advc')){
        var anpFeats = [];
        try{ if(typeof activeLayers!=='undefined' && activeLayers['shp_anp'] && activeLayers['shp_anp'].featuresData) anpFeats = activeLayers['shp_anp'].featuresData; }catch(e){}
        if(anpFeats && anpFeats.length){
          var byCat = {};
          var withPM = 0;
          var supTot = 0;
          anpFeats.forEach(function(f){
            var pr = f.properties||{};
            var c = String(pr.cat_manejo||pr.CAT_MAN||pr.categoria||'').toUpperCase().trim();
            var key = c;
            if(/PARQUE/.test(c)||c==='PN') key='PN';
            else if(/RESERVA|BIOSFERA/.test(c)||c==='RB') key='RB';
            else if(/FLORA|FAUNA|APFF/.test(c)) key='APFF';
            else if(/RECURSOS|APRN/.test(c)) key='APRN';
            else if(/MONUMENTO|^MN$/.test(c)) key='MN';
            else if(/SANTUARIO|SANT/.test(c)) key='SANT';
            byCat[key]=(byCat[key]||0)+1;
            var pm = pr.pm||pr.PCM1||pr.pcm1||pr.programa_manejo;
            if(pm!==null&&pm!==undefined&&String(pm).trim()!=='') withPM++;
            var s = Number(pr.superficie||pr.SUPERFICIE||0);
            if(isFinite(s)) supTot+=s;
          });
          var total = anpFeats.length;
          function catName(k){ return {'PN':'Parques Nacionales','RB':'Reservas de la Biosfera','APFF':'\u00c1reas de Protecci\u00f3n de Flora y Fauna','APRN':'\u00c1reas de Protecci\u00f3n de Recursos Naturales','MN':'Monumentos Naturales','SANT':'Santuarios'}[k]||k; }
          if(/parque/.test(n)){
            try{ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; }catch(e){}
            return 'En la CONANP se tienen registrados los siguientes datos: <b>'+(byCat['PN']||0)+' Parques Nacionales</b> de '+total+' ANP cargadas.<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">\u00bfLos vemos en el mapa o por estado? \u00bfPuedo ayudarte en algo m\u00e1s?</div>';
          }
          if(/programa de manejo/.test(n)){
            try{ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; }catch(e){}
            return 'En la CONANP se tienen registrados los siguientes datos: <b>'+withPM+'</b> de '+total+' ANP tienen programa de manejo publicado.<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">\u00bfTe listo cu\u00e1les son? \u00bfPuedo ayudarte en algo m\u00e1s?</div>';
          }
          var rows = Object.keys(byCat).sort().map(function(k){ return '\u00b7 '+catName(k)+' (<b>'+k+'</b>): <b>'+byCat[k]+'</b>'; }).join('<br>');
          try{ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; }catch(e){}
          return 'En la CONANP se tienen registrados los siguientes datos (<b>'+total+' ANP</b>):<br>'+rows+'<br>\u00b7 Superficie total: <b>'+Math.round(supTot).toLocaleString('es-MX')+' ha</b>.<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">\u00bfDetalle por categor\u00eda o por estado? \u00bfPuedo ayudarte en algo m\u00e1s?</div>';
        }
      }
    }catch(e){}
    // 1b-bis) Numeralia ADVC en vivo (capa cargada o dato oficial)
    try{
      if(n.includes('advc') && /cuant|numer|total|cuantas hay|cuantos hay|tienen|tiene|hay\b/.test(n)){
        var advcFeats = [];
        try{ if(typeof activeLayers!=='undefined' && activeLayers['shp_advc'] && activeLayers['shp_advc'].featuresData) advcFeats = activeLayers['shp_advc'].featuresData; }catch(e){}
        try{ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; }catch(e){}
        if(advcFeats && advcFeats.length){
          var byProp = {};
          advcFeats.forEach(function(f){
            var pr2 = f.properties||{};
            var v = String(pr2.tipo_prop||pr2.TIPO_PROP||pr2.propiedad||pr2.tipo_propiedad||'').toLowerCase();
            var k2 = 'Otras';
            if(v.indexOf('social')!==-1 || v.indexOf('ejid')!==-1 || v.indexOf('comun')!==-1) k2='Social';
            else if(v.indexOf('priva')!==-1 || v.indexOf('moral')!==-1 || v.indexOf('fisica')!==-1) k2='Privada';
            else if(v.indexOf('public')!==-1 || v.indexOf('feder')!==-1 || v.indexOf('estat')!==-1 || v.indexOf('munic')!==-1) k2='P\u00fablica';
            byProp[k2]=(byProp[k2]||0)+1;
          });
          var rows2 = Object.keys(byProp).sort().map(function(k){ return '\u00b7 Propiedad <b>'+k+'</b>: <b>'+byProp[k]+'</b>'; }).join('<br>');
          return 'En la CONANP se tienen registrados los siguientes datos (<b>'+advcFeats.length+' ADVC</b> cargadas en el visor):<br>'+rows2+'<br><div style="margin-top:0.4rem;font-size:0.70rem;color:var(--text-muted);">Dato oficial: <b>623 ADVC vigentes (junio 2026)</b>. \u00bfLas filtramos por propiedad? \u00bfPuedo ayudarte en algo m\u00e1s?</div>';
        }
      }
    }catch(e){}

    // Intención gráfica: mini-gráfica en el chat + ofrecimiento del Dashboard
    try{
      var quiereGraf = /grafic|chart/.test(n);
      var hablaCat = n.includes('categoria') || n.includes('manejo');
      if(quiereGraf && hablaCat && (n.includes('superficie') || n.includes('area') || n.includes('hectarea'))){
        try{ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; }catch(e){}
        return respuestaGraficaAi('superficie');
      }
      if(quiereGraf && hablaCat && (n.includes('conteo') || n.includes('numero') || n.includes('cantidad') || n.includes('cuantas') || n.includes('numero de anp'))){
        try{ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; }catch(e){}
        return respuestaGraficaAi('conteo');
      }
      if(quiereGraf && (n.includes('dashboard') || hablaCat)){
        return 'Puedo mostrarte aquí la gráfica de <b>superficie</b> o <b>conteo por categoría de manejo</b>, y también está completa en el <b>Dashboard</b>.' + aiNavRow('<button class="ai-chip" data-q="gráfica de superficie por categoría">Ver superficie</button><button class="ai-chip" data-q="gráfica de conteo por categoría">Ver conteo</button><button class="ai-chip" data-ai-action="ir-dashboard">Abrir Dashboard</button>') + '<div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>';
      }
    }catch(e){}
let best=null, score=0;
    for(const entry of KB){
      let s=0;
      for(const kw of entry.k){
        const nk = normalize(kw);
        if(n.includes(nk)) s += nk.length;
      }
      if(s>score){ score=s; best=entry; }
    }
    // Follow-up contextual dialogado: solo dar lo pedido y preguntar por más
    // Comando limpiar/borra
    if(n.includes('borra') || n.includes('limpiar') || n.includes('limpia') || n.includes('nueva consulta')){
      try{ balamZoomToAnp('limpiar'); }catch(e){}
      return `He limpiado la consulta anterior. ¿Qué otra <b>ANP</b> o <b>ADVC</b> quieres consultar? Solo dime el nombre y haré una <b>nueva búsqueda automática</b>.<br><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
    }
    const isFollow = n.includes('decreto') || n.includes('ficha') || n.includes('programa de manejo') || n.includes('programa manejo') || n.includes('zonificacion') || n.includes('shp') || n.includes('kml') || n.includes('shapefile');
    // Multiconsulta: cambio de tema a ADVC -> soltar contexto ANP
    try{ if(isFollow && lastAnpDisplay && n.includes('advc')){ lastAnpDisplay=null; lastAnpSigId=null; lastAnpSimecId=null; } }catch(e){}
    // Multiconsulta: si menciona otra ANP distinta, tomarla como nueva consulta
    try{
      if(isFollow && lastAnpDisplay && typeof SIG_ANP_MAP!=='undefined'){
        var _nf2 = n.replace(/\s+/g,'');
        for(var _d2 in SIG_ANP_MAP){
          if(_d2===lastAnpDisplay) continue;
          var _nd2 = normalize(_d2); if(!_nd2||_nd2.length<4) continue;
          var _nf22 = _nd2.replace(/\s+/g,'');
          if(n.includes(_nd2)||(_nf22.length>=4&&_nf2.includes(_nf22))){
            try{ if(typeof balamNewQuery!=='undefined') balamNewQuery(_d2); else balamZoomToAnp(_d2); }catch(e){}
            lastAnpDisplay=_d2;
            try{ lastAnpSigId=SIG_ANP_MAP[_d2]; }catch(e){}
            try{ lastAnpSimecId=(typeof getSimecIdForAnp==='function')?getSimecIdForAnp(_d2):null; }catch(e){}
            break;
          }
        }
      }
    }catch(e){}
    if(isFollow && lastAnpDisplay && !n.includes('advc')){
      const wantDecreto = n.includes('decreto');
      const wantFicha = n.includes('ficha');
      const wantPrograma = n.includes('programa');
      const wantShp = n.includes('shp') || (n.includes('shape') && !n.includes('shapefile') ? true : n.includes('shapefile'));
      const wantKml = n.includes('kml');
      const wantZon = n.includes('zonific');
      // Si pide algo específico, dar solo eso + pregunta
      if(wantDecreto && !wantFicha && !wantPrograma && !wantShp && !wantKml && !wantZon){
        const sid = lastAnpSimecId || (typeof getSimecIdForAnp==='function' ? getSimecIdForAnp(lastAnpDisplay) : null);
        const decUrl = sid ? `https://simec.conanp.gob.mx/pdf_decretos/${sid}_decreto.pdf` : `https://simec.conanp.gob.mx/decretos.php`;
        return `Para <b>${lastAnpDisplay}</b>: <b>DECRETO</b> → <a href="${decUrl}" target="_blank" rel="noopener">DECRETO</a>${aiNavRow('<button class="ai-chip" data-ai-action="abrir-decreto">Abrir decreto PDF</button>' + (sid ? '<a class="ai-chip" href="https://simec.conanp.gob.mx/ficha.php?anp=' + sid + '" target="_blank" rel="noopener">Ver ficha</a>' : ''))}<br><div style="margin-top:0.6rem; padding:0.5rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.72rem;">¿Quieres también la <b>FICHA SIMEC</b> o el <b>PROGRAMA DE MANEJO</b> de <b>${lastAnpDisplay}</b>? ¿O descargar su <b>SHP/KML</b>?</div><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
      }
      if(wantFicha && !wantDecreto && !wantPrograma){
        const sid = lastAnpSimecId || (typeof getSimecIdForAnp==='function' ? getSimecIdForAnp(lastAnpDisplay) : null);
        const fichaUrl = sid ? `https://simec.conanp.gob.mx/ficha.php?anp=${sid}` : `https://simec.conanp.gob.mx/ficha.php`;
        return `Para <b>${lastAnpDisplay}</b>: <b>FICHA SIMEC</b> → <a href="${fichaUrl}" target="_blank" rel="noopener">FICHA SIMEC</a>${aiNavRow('<button class="ai-chip" data-ai-action="abrir-ficha">Abrir ficha</button>')}<br><div style="margin-top:0.6rem; padding:0.5rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.72rem;">¿Te interesa el <b>DECRETO</b> o el <b>PROGRAMA DE MANEJO</b>? También puedo darte su <b>SHP/KML</b>.</div><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
      }
      if(wantPrograma && !wantFicha && !wantDecreto){
        const sid = lastAnpSimecId || (typeof getSimecIdForAnp==='function' ? getSimecIdForAnp(lastAnpDisplay) : null);
        const progUrl = sid ? `https://simec.conanp.gob.mx/ficha.php?anp=${sid}` : `https://www.gob.mx/conanp/documentos/programas-de-manejo`;
        return `Para <b>${lastAnpDisplay}</b>: <b>PROGRAMA DE MANEJO</b> → <a href="${progUrl}" target="_blank" rel="noopener">PROGRAMA DE MANEJO</a>${aiNavRow('<button class="ai-chip" data-ai-action="abrir-programa">Abrir programa</button>')}<br><div style="margin-top:0.6rem; padding:0.5rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.72rem;">¿Quieres ver la <b>FICHA SIMEC</b> o el <b>DECRETO</b>? ¿O descargar <b>SHP/KML</b>?</div><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
      }
      // Si pide combinación o genérico, dar solo lo pedido
      let html = `Para <b>${lastAnpDisplay}</b>:<br>`;
      let has=false;
      if(wantDecreto){ const sid = lastAnpSimecId || (typeof getSimecIdForAnp==='function' ? getSimecIdForAnp(lastAnpDisplay) : null); const decUrl = sid ? `https://simec.conanp.gob.mx/pdf_decretos/${sid}_decreto.pdf` : `https://simec.conanp.gob.mx/decretos.php`; html += `· <b>DECRETO:</b> <a href="${decUrl}" target="_blank" rel="noopener">DECRETO</a><br>`; has=true; }
      if(wantFicha){ const sid = lastAnpSimecId || (typeof getSimecIdForAnp==='function' ? getSimecIdForAnp(lastAnpDisplay) : null); const fichaUrl = sid ? `https://simec.conanp.gob.mx/ficha.php?anp=${sid}` : `https://simec.conanp.gob.mx/ficha.php`; html += `· <b>FICHA SIMEC:</b> <a href="${fichaUrl}" target="_blank" rel="noopener">FICHA SIMEC</a><br>`; has=true; }
      if(wantPrograma){ const sid = lastAnpSimecId || (typeof getSimecIdForAnp==='function' ? getSimecIdForAnp(lastAnpDisplay) : null); const progUrl = sid ? `https://simec.conanp.gob.mx/ficha.php?anp=${sid}` : `https://www.gob.mx/conanp/documentos/programas-de-manejo`; html += `· <b>PROGRAMA DE MANEJO:</b> <a href="${progUrl}" target="_blank" rel="noopener">PROGRAMA DE MANEJO</a><br>`; has=true; }
      if(wantShp || wantKml || wantZon){
        const shp = `https://sig.conanp.gob.mx/container/data/shp/anp/${lastAnpSigId}.zip`;
        const kml = `https://sig.conanp.gob.mx/container/data/kml/anp/${lastAnpSigId}.kml`;
        const zon = `https://sig.conanp.gob.mx/container/data/shp/zonificacion/Sub_${lastAnpSigId}.zip`;
        if(wantShp) html += `· <b>SHP:</b> <a href="${shp}" target="_blank" rel="noopener">SHP</a><br>`;
        if(wantKml) html += `· <b>KML:</b> <a href="${kml}" target="_blank" rel="noopener">KML</a><br>`;
        if(wantZon) html += `· <b>SUBZONIFICACIÓN (programa de manejo):</b> <a href="${zon}" target="_blank" rel="noopener">SHP Subzonificación</a><br><span style="font-size:0.62rem;color:var(--text-muted);">La zonificación primaria son las zonas núcleo; la subzonificación la definen los programas de manejo (solo ANP con programa).</span><br>`;
        if(!wantShp && !wantKml && !wantZon) html += `· <b>SHP:</b> <a href="${shp}" target="_blank" rel="noopener">SHP</a> · <b>KML:</b> <a href="${kml}" target="_blank" rel="noopener">KML</a><br>`;
        has=true;
      }
      var _abrirBtns = [];
      if(wantDecreto) _abrirBtns.push('<button class="ai-chip" data-ai-action="abrir-decreto">Abrir decreto</button>');
      if(wantFicha) _abrirBtns.push('<button class="ai-chip" data-ai-action="abrir-ficha">Abrir ficha</button>');
      if(wantPrograma) _abrirBtns.push('<button class="ai-chip" data-ai-action="abrir-programa">Abrir programa</button>');
      if(wantShp) _abrirBtns.push('<button class="ai-chip" data-ai-action="abrir-shp">Abrir SHP</button>');
      if(wantKml) _abrirBtns.push('<button class="ai-chip" data-ai-action="abrir-kml">Abrir KML</button>');
      if(wantZon) _abrirBtns.push('<button class="ai-chip" data-ai-action="abrir-zon">Abrir subzonificación</button>');
      if(_abrirBtns.length) html += aiNavRow(_abrirBtns.join(''));
      if(has){
        html += `<div style="margin-top:0.6rem; padding:0.5rem; background:var(--bg-glass); border:1px dashed var(--border-subtle); border-radius:8px; font-size:0.72rem;">¿Quieres ver más de <b>${lastAnpDisplay}</b> como <b>FICHA</b>, <b>DECRETO</b> o <b>SHP</b>?</div><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
        return html;
      }
    }
    if(best && score>=3) return 'En la CONANP se tiene registrado: ' + best.a;
    if(n.includes('hola')||n.includes('ayuda')||n.includes('balam')) return KB[0].a;
    return FALLBACK;
  }

  function addMsg(text, who){
    if(!aiMessages) return;
    const div = document.createElement('div');
    div.className = 'ai-msg ' + who;
    const time = new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
    div.innerHTML = text + (who==='bot' && aiVozTTS() ? `<button class="ai-speak" data-ai-speak title="Escuchar respuesta" aria-label="Escuchar respuesta en voz alta"><i class="fas fa-volume-high"></i></button>` : '') + `<span class="ai-time">${time} · ${who==='user'?'Tú':'Balam'}</span>`;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }
  function showTyping(){
    if(!aiMessages) return null;
    const d=document.createElement('div');
    d.className='ai-msg bot';
    d.innerHTML='<div class="ai-typing"><span></span><span></span><span></span></div>';
    aiMessages.appendChild(d);
    aiMessages.scrollTop=aiMessages.scrollHeight;
    return d;
  }
  function handleSend(){
    const t = aiInput ? aiInput.value.trim() : '';
    if(!t) return;
    addMsg(t, 'user');
    aiInput.value='';
    if(aiSend) aiSend.disabled=true;
    const typing = showTyping();
    // Detectar intención de ubicación/zoom antes de responder
    const lower = t.toLowerCase();
    const isLocationQuery = lower.includes('donde esta') || lower.includes('dónde está') || lower.includes('donde se encuentra') || lower.includes('ubicacion') || lower.includes('ubicación') || lower.includes('llevar') || lower.includes('mostrar') || lower.includes('zoom') || lower.includes('ir a') || lower.includes('lago de texcoco') || lower.includes('texcoco');
    let didZoom = false;
    if(isLocationQuery){
      try{
        const res = (typeof balamNewQuery!=='undefined' ? balamNewQuery(t) : balamZoomToAnp(t));
        if(res && res.found){
          didZoom = true;
        }
      }catch(e){}
    }
    var normAff = '';
    try{ normAff = normalize(t); }catch(e){ try{ normAff = t.toLowerCase(); }catch(e2){} }
    var esAfirmacion = !!aiPendingOffer && /^(si|claro|vale|ok|yes|adelante|vamos|muestrame|llevame|dale|sale|perfecto)\b/.test(normAff);
    setTimeout(()=>{
      if(typing) typing.remove();
      let ans;
      if(esAfirmacion){
        var destAf = aiPendingOffer.dest; aiPendingOffer = null;
        if(destAf==='dashboard' && irSeccion('dashboard')) ans = 'Perfecto, te llevé al <b>Dashboard</b>: ahí está la gráfica completa con los datos en vivo.<br><div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>';
        else { aiPendingOffer = null; ans = answerFor(t); }
      } else {
        aiPendingOffer = null;
        ans = answerFor(t);
      }
      // Si hizo zoom y la respuesta no menciona zoom, añadir confirmación + instrucción auto-clear
      if(didZoom && !ans.includes('ubicado')){
        ans = ans.replace('¿Puedo ayudarte en algo más?', 'He limpiado la consulta anterior y centrado el mapa. Para otra ANP/ADVC, solo dime el nombre y generaré una nueva consulta automáticamente.<br>¿Puedo ayudarte en algo más?');
      } else if(didZoom){
        // Ya contiene ubicado, añadir instrucción
        if(!ans.includes('nueva consulta')){
          ans = ans.replace('¿Puedo ayudarte en algo más?', 'Para otra ANP/ADVC, solo dime el nombre y haré una nueva búsqueda automática.<br>¿Puedo ayudarte en algo más?');
        }
      }
      // Asegurar que siempre termina preguntando si puede ayudar
      if(!ans.includes('¿Puedo ayudarte')){
        ans += `<div style="margin-top:0.4rem; font-size:0.70rem; color:var(--text-muted);">¿Puedo ayudarte en algo más?</div>`;
      }
      addMsg(ans, 'bot');
      renderAiCharts();
      if(aiSend) aiSend.disabled=false;
      if(aiInput) aiInput.focus();
    }, 620 + Math.min(800, t.length*18));
  }
  aiSend?.addEventListener('click', handleSend);
  aiInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); } });
  aiClear?.addEventListener('click', ()=>{
    try{ aiCallar(); }catch(e){}
    try{ aiCharts.forEach(function(c){ try{ c.destroy(); }catch(e){} }); aiCharts.length=0; }catch(e){}
    for(var k in aiChartQueue){ try{ delete aiChartQueue[k]; }catch(e){} }
    aiPendingOffer = null;
    if(aiMessages) aiMessages.innerHTML='';
    hello();
  });
  aiSuggestions?.addEventListener('click', (e)=>{
    const chip = e.target.closest('.ai-chip');
    if(!chip) return;
    if(chip.hasAttribute('data-ai-action')){ atenderAccionAi(chip.getAttribute('data-ai-action')); return; }
    const q = chip.getAttribute('data-q') || chip.textContent;
    if(aiInput){ aiInput.value=q; handleSend(); }
  });
  aiMessages?.addEventListener('click', (e)=>{
    try{
      const spk = e.target.closest('[data-ai-speak]');
      if(spk){
        try{
          var box = spk.closest('.ai-msg');
          var htmlSpk = '';
          if(box){
            var tmpSpk = box.cloneNode(true);
            var r1 = tmpSpk.querySelector('[data-ai-speak]'); if(r1) r1.remove();
            var r2 = tmpSpk.querySelector('.ai-time'); if(r2) r2.remove();
            htmlSpk = tmpSpk.innerHTML;
          }
          hablarAi(htmlSpk, box, spk);
        }catch(err){}
        return;
      }
      const act = e.target.closest('[data-ai-action]');
      if(act){ atenderAccionAi(act.getAttribute('data-ai-action')); return; }
      const chip = e.target.closest('.ai-chip[data-q]');
      if(chip){ const q = chip.getAttribute('data-q') || chip.textContent; if(aiInput){ aiInput.value=q; handleSend(); } }
    }catch(err){}
  });

  // --- Balam por voz: dictado + lectura bajo demanda (ideal móvil) ---
  const AI_TTS_LANG = 'es-MX';
  let aiVozLista = null;
  let aiHablandoId = null;
  let aiResumeT = null;
  function aiVozTTS(){
    try{ return window.speechSynthesis || null; }catch(e){ return null; }
  }
  function aiPuntajeVoz(v){
    try{
      var lang = String((v && v.lang) || '').toLowerCase();
      var nom = String((v && v.name) || '').toLowerCase();
      var es = lang.indexOf('es')===0;
      if(!es && nom.indexOf('espa')===-1 && nom.indexOf('spanish')===-1) return -1000;
      var pts = 0;
      if(lang.indexOf('es-mx')===0) pts += 100;
      else if(lang.indexOf('es-us')===0) pts += 80;
      else if(lang.indexOf('es')===0) pts += 50;
      if(nom.indexOf('google')!==-1) pts += 60;
    if(nom.indexOf('natural')!==-1 || nom.indexOf('neuronal')!==-1 || nom.indexOf('neural')!==-1) pts += 70;
    if(nom.indexOf('online')!==-1) pts += 45;
    if(nom.indexOf('google espa')!==-1) pts += 20;
      if(nom.indexOf('microsoft')!==-1 || nom.indexOf('sabina')!==-1 || nom.indexOf('dalila')!==-1 || nom.indexOf('helena')!==-1) pts += 55;
      if(nom.indexOf('samsung')!==-1) pts += 40;
      if(nom.indexOf('samantha')!==-1 || nom.indexOf('monica')!==-1 || nom.indexOf('paulina')!==-1 || nom.indexOf('jorge')!==-1 || nom.indexOf('diego')!==-1) pts += 35;
      try{ if(v.localService===false) pts += 15; }catch(e){}
      if(nom.indexOf('pico')!==-1 || nom.indexOf('espeak')!==-1 || nom.indexOf('e-spea')!==-1) pts -= 80;
      return pts;
    }catch(e){ return -1000; }
  }
  function aiVocesEs(){
    try{
      var tts = aiVozTTS();
      if(!tts) return [];
      var voces = [];
      try{ voces = tts.getVoices() || []; }catch(e){}
      var out = [];
      for(var i=0;i<voces.length;i++){
        if(aiPuntajeVoz(voces[i]) > -1000) out.push(voces[i]);
      }
      out.sort(function(a,b){ return aiPuntajeVoz(b) - aiPuntajeVoz(a); });
      return out;
    }catch(e){ return []; }
  }
  function aiVozGuardada(){
    try{ return localStorage.getItem('balam-voz') || ''; }catch(e){ return ''; }
  }
  function aiVocesCargadas(){
    try{ aiVozLista = aiElegirVoz(); }catch(e){}
    try{ aiActualizarBotonVoz(); }catch(e){}
  }
  function aiElegirVoz(){
    try{
      var lista = aiVocesEs();
      if(!lista.length) return null;
      var pref = aiVozGuardada(), i;
      if(pref){
        for(i=0;i<lista.length;i++){
          try{ if(lista[i] && (lista[i].voiceURI===pref || lista[i].name===pref)) return lista[i]; }catch(e){}
        }
      }
      return lista[0];
    }catch(e){ return null; }
  }
  function aiPartirFrases(t){
    try{
      var limpio = String(t||'').replace(/\s+/g,' ').trim();
      if(!limpio) return [];
      var partes = limpio.match(/[^.!?…;]+[.!?…;]+["\)»]*|\S[^.!?…;]*$/g) || [limpio];
      var frases = [], buf = '', i;
      for(i=0;i<partes.length;i++){
        var p = String(partes[i]||'').trim();
        if(!p) continue;
        if(buf && (buf + ' ' + p).length > 220){ frases.push(buf); buf = p; }
        else buf = buf ? (buf + ' ' + p) : p;
      }
      if(buf) frases.push(buf);
      return frases;
    }catch(e){ return [String(t||'')]; }
  }
  try{
    if(aiVozTTS()){
      aiVozLista = aiElegirVoz();
      try{
        var _vtts = aiVozTTS();
        if(_vtts) _vtts.onvoiceschanged = function(){ aiVocesCargadas(); };
      }catch(e){}
    }
  }catch(e){}
  let aiColaVoz = [];
  let aiChunkVoz = 0;
  function aiCallar(){
    try{ if(aiResumeT){ clearInterval(aiResumeT); aiResumeT = null; } }catch(e){}
    aiColaVoz = []; aiChunkVoz = 0;
    try{ var tts = aiVozTTS(); if(tts && (tts.speaking || tts.pending)) tts.cancel(); }catch(e){}
    aiHablandoId = null;
    try{
      if(aiMessages){
        var bs = aiMessages.querySelectorAll('[data-ai-speak].hablando');
        for(var i=0;i<bs.length;i++){ bs[i].classList.remove('hablando'); var ic=bs[i].querySelector('i'); if(ic) ic.className='fas fa-volume-high'; }
      }
    }catch(e){}
  }
  function aiTextoPlano(html, msgEl){
    try{
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var rm = tmp.querySelectorAll('.ai-nav-row, .ai-time, button, .ai-typing');
      for(var i=0;i<rm.length;i++){ rm[i].remove(); }
      var t = (tmp.textContent||'').replace(/\s+/g,' ').trim();
      try{
        t = t.replace(/·/g,'. ')
          .replace(/\bANP\b/g,'A N P').replace(/\bADVC\b/g,'A D V C')
          .replace(/\bSHP\b/g,'S H P').replace(/\bKML\b/g,'K M L')
          .replace(/\bCSV\b/g,'C S V').replace(/\bPNG\b/g,'P N G')
          .replace(/\bJPG\b/g,'J P G').replace(/\bPDF\b/g,'P D F');
      }catch(e){}
      try{
        if(msgEl){
          var cv = msgEl.querySelector('canvas.ai-chart');
          if(cv && cv.id && aiChartQueue[cv.id]){
            var sp = aiChartQueue[cv.id];
            var top = [];
            for(var j=0;j<Math.min(3,sp.labels.length);j++){ top.push(sp.labels[j] + ' con ' + Number(sp.values[j]).toLocaleString('es-MX')); }
            if(top.length) t += ' Incluye una gráfica de ' + (sp.ylabel==='ANP' ? 'conteo' : 'superficie') + ': ' + top.join(', ') + '.';
          }
        }
      }catch(e){}
      if(t.length>900) t = t.substring(0,900);
      return t;
    }catch(e){ return ''; }
  }
  function hablarAi(html, msgEl, btn){
    try{
      var tts = aiVozTTS();
      if(!tts) return false;
      try{
        if(btn && btn.classList.contains('hablando')){ aiCallar(); return true; }
      }catch(e){}
      aiCallar();
      var texto = aiTextoPlano(html, msgEl);
      if(!texto) return false;
      var frases = aiPartirFrases(texto);
      if(!frases.length) return false;
      var ident = 'h' + Date.now();
      aiHablandoId = ident;
      aiColaVoz = frases;
      aiChunkVoz = 0;
      try{
        if(btn){ btn.classList.add('hablando'); var ic0=btn.querySelector('i'); if(ic0) ic0.className='fas fa-volume-xmark'; }
      }catch(e){}
      var arrancar = function(){
        try{ if(aiHablandoId!==ident) return; }catch(e){ return; }
        try{ var vv0 = aiElegirVoz(); if(vv0) aiVozLista = vv0; }catch(e){}
        aiHablarSiguiente(ident, btn);
      };
      try{
        var tts0 = aiVozTTS();
        var hayV = false;
        try{ hayV = !!(tts0 && tts0.getVoices && tts0.getVoices().length); }catch(e){}
        if(hayV){ arrancar(); }
        else{
          var listo = false;
          var toV = setTimeout(function(){ if(!listo){ listo = true; arrancar(); } }, 900);
          try{
            tts0.onvoiceschanged = function(){
              aiVocesCargadas();
              if(!listo){ listo = true; clearTimeout(toV); arrancar(); }
            };
          }catch(e){ if(!listo){ listo = true; clearTimeout(toV); arrancar(); } }
        }
      }catch(e){ arrancar(); }
      return true;
    }catch(e){ return false; }
  }
  function aiHablarSiguiente(ident, btn){
    try{
      var tts = aiVozTTS();
      if(!tts || aiHablandoId!==ident) return;
      if(aiChunkVoz >= aiColaVoz.length){ try{ aiCallar(); }catch(e){} return; }
      var parte = aiColaVoz[aiChunkVoz++];
      var utt = new SpeechSynthesisUtterance(parte);
      try{ utt.lang = AI_TTS_LANG; }catch(e){}
      try{ var vv = aiVozLista || aiElegirVoz(); if(vv){ aiVozLista = vv; utt.voice = vv; } }catch(e){}
      try{ utt.rate = 0.97; utt.pitch = 1; }catch(e){}
      utt.onend = function(){
        try{
          if(aiHablandoId!==ident) return;
          setTimeout(function(){ aiHablarSiguiente(ident, btn); }, 180);
        }catch(e){}
      };
      utt.onerror = function(){ try{ if(aiHablandoId===ident) aiCallar(); }catch(e){} };
      try{ if(tts.paused) tts.resume(); }catch(e){}
      tts.speak(utt);
    }catch(e){ try{ aiCallar(); }catch(e2){} }
  }
  // --- Selector de voz (recorre voces en español con demo) ---
  const aiVozBtn = $('#ai-voz');
  function aiEtiquetaVoz(v){
    try{
      var s = String((v && (v.name || v.lang)) || '');
      s = s.replace(/^Microsoft\s+/i,'').replace(/\s*\(.*?\)\s*/g,' ').trim();
      return s.substring(0,26) || 'Voz';
    }catch(e){ return 'Voz'; }
  }
  function aiActualizarBotonVoz(){
    try{
      if(!aiVozBtn) return;
      var lista = aiVocesEs();
      if(lista.length < 2){ aiVozBtn.style.display='none'; return; }
      aiVozBtn.style.display='';
      var actual = aiVozLista || aiElegirVoz();
      aiVozBtn.title = actual ? ('Voz: ' + aiEtiquetaVoz(actual) + ' (toca para cambiar)') : 'Cambiar voz';
    }catch(e){}
  }
  aiVozBtn?.addEventListener('click', ()=>{
    try{
      var lista = aiVocesEs();
      if(lista.length < 2) return;
      var actual = aiVozLista || aiElegirVoz();
      var idx = 0, i;
      for(i=0;i<lista.length;i++){ try{ if(actual && lista[i].voiceURI===actual.voiceURI){ idx=i; break; } }catch(e){} }
      var sig = lista[(idx+1) % lista.length];
      aiVozLista = sig;
      try{ localStorage.setItem('balam-voz', sig.voiceURI || sig.name); }catch(e){}
      aiActualizarBotonVoz();
      try{
        var ttsD = aiVozTTS();
        if(ttsD){
          aiCallar();
          var demo = new SpeechSynthesisUtterance('Hola, soy Balam. Así suena esta voz.');
          try{ demo.lang = AI_TTS_LANG; }catch(e){}
          try{ demo.voice = sig; demo.rate = 0.97; }catch(e){}
          ttsD.speak(demo);
        }
      }catch(e){}
    }catch(e){}
  });
  // --- Dictado por voz ---
  let aiRec = null;
  let aiGrabando = false;
  const aiMic = $('#ai-mic');
  function aiSTT(){
    try{
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      return SR || null;
    }catch(e){ return null; }
  }
  let aiMicBloqueado = false;
  async function aiEstadoMicrofono(){
    try{
      if(navigator.permissions && navigator.permissions.query){
        var st = await navigator.permissions.query({name:'microphone'});
        return (st && st.state) || 'unknown';
      }
    }catch(e){}
    return 'unknown';
  }
  function aiRevisarMicrofono(){
    try{
      if(typeof aiSTT!=='function' || !aiSTT()) return;
      aiEstadoMicrofono().then(function(est){
        try{
          aiMicBloqueado = (est==='denied');
          if(aiMic){
            aiMic.classList.toggle('bloqueado', aiMicBloqueado);
            if(aiMicBloqueado) aiMic.title = 'Micrófono bloqueado: actívalo en los ajustes del sitio';
          }
        }catch(e){}
      }).catch(function(){});
    }catch(e){}
  }
  function aiMicEstado(grabando){
    aiGrabando = !!grabando;
    try{
      if(!aiMic) return;
      aiMic.classList.toggle('grabando', aiGrabando);
      aiMic.setAttribute('aria-pressed', aiGrabando ? 'true' : 'false');
      aiMic.title = aiGrabando ? 'Detener dictado' : 'Dictar por voz';
      var ic = aiMic.querySelector('i');
      if(ic) ic.className = aiGrabando ? 'fas fa-microphone-slash' : 'fas fa-microphone';
    }catch(e){}
  }
  function aiMicDetener(){
    try{
      if(aiRec){
        try{ aiRec.onend=null; aiRec.onerror=null; aiRec.onresult=null; }catch(e){}
        try{ aiRec.stop(); }catch(e){}
        try{ aiRec.abort(); }catch(e){}
      }
    }catch(e){}
    aiRec = null;
    aiMicEstado(false);
  }
  if(aiMic && !aiSTT()){ try{ aiMic.style.display='none'; }catch(e){} }
  aiMic?.addEventListener('click', ()=>{
    try{
      if(aiGrabando){ aiMicDetener(); return; }
      if(aiMicBloqueado){ alert('El micrófono está bloqueado para este sitio. Toca el candado (o ajustes del sitio) en la barra del navegador, permite el micrófono y recarga.'); return; }
      try{
        var avisoMic = null;
        try{ avisoMic = localStorage.getItem('balam-mic-aviso'); }catch(e){}
        if(!avisoMic){
          try{ localStorage.setItem('balam-mic-aviso','1'); }catch(e){}
          alert('Tu navegador pedirá permiso del micrófono una sola vez para este sitio. Elige "Permitir" y usa siempre la misma dirección HTTPS para que no vuelva a preguntar.');
        }
      }catch(e){}
      var SR = aiSTT();
      if(!SR){ alert('Tu navegador no soporta dictado por voz. Prueba con Chrome en Android o Safari.'); return; }
      aiCallar();
      var rec = new SR();
      aiRec = rec;
      try{ rec.lang = 'es-MX'; }catch(e){}
      try{ rec.interimResults = true; }catch(e){}
      try{ rec.maxAlternatives = 1; }catch(e){}
      var baseTxt = '';
      try{ baseTxt = aiInput ? aiInput.value : ''; }catch(e){}
      var finalTxt = '';
      rec.onresult = function(ev){
        try{
          var inter = '';
          for(var i=ev.resultIndex;i<ev.results.length;i++){
            var r = ev.results[i];
            if(r.isFinal) finalTxt += r[0].transcript + ' ';
            else inter += r[0].transcript;
          }
          if(aiInput){
            var space = (baseTxt && baseTxt.slice(-1)!==' ') ? ' ' : '';
            aiInput.value = (baseTxt + space + finalTxt + inter).substring(0,300);
          }
        }catch(e){}
      };
      rec.onerror = function(){ aiMicDetener(); };
      rec.onend = function(){ aiMicEstado(false); aiRec = null; try{ if(aiInput) aiInput.focus(); }catch(e){} };
      try{ rec.start(); }catch(e){ aiMicDetener(); return; }
      aiMicEstado(true);
    }catch(e){ aiMicDetener(); }
  });

  function hello(){
    addMsg('<b>¡Hola! Soy Balam <i class="fas fa-paw"></i></b> — soy <b>solo un asistente virtual</b> del Geovisor CONANP: respondo con datos del sistema, te muestro gráficas aquí mismo y te llevo a la sección que buscas (mapa, Dashboard, etc.). Para descargas oficiales te dirijo a <b>SIG</b> / <b>SIMEC</b>.<br>Prueba:<br>· “gráfica de superficie por categoría”<br>· “¿Qué es ADVC y su propiedad?”<br>· “¿Cómo imprimo el mapa?”', 'bot');
  }
  // Salud inicial cuando se abre por primera vez
  let greeted=false;
  const origToggle = toggleAi;
  window.toggleAi = toggleAi;
  aiToggle?.addEventListener('click', ()=>{ if(!greeted){ hello(); greeted=true; } }, {once:true});
  // abrir desde FAQ
  // exponer
  window.answerFor = answerFor;

  // --- Persistencia welcome ---
  // Si se marca "No volver a mostrar" en welcome, también puede reabrirse con botón header
  document.getElementById('welcome-skip')?.addEventListener('click', ()=>{});
})();
