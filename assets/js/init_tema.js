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
async function captureDashboardMap() {
  const mapEl = document.getElementById('map-dashboard');
  if (!mapEl || !validateElementVisible(mapEl)) {
    return placeholderDataURLSquare('Mapa no visible');
  }
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
 try{ map.fitBounds(bounds,{padding:[20,20],animate:false}); }catch(e){ return false; }
 await esperarVistaEstable(4500);
 try{
  const vb=map.getBounds();
  if(vb.contains(bounds.pad(-0.05))) return true;
 }catch(e){ return true; }
 try{
  const vb2=map.getBounds();
  if(!vb2.contains(bounds.pad(-0.05))){
   const z=map.getBoundsZoom(bounds,false,[20,20]);
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
  try{ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }
  catch(e){ mapImg=placeholderDataURLSquare('Error capturando mapa'); }
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
   {lbl:'SUPERFICIE VISIBLE',val:totalHa?fmtHa(totalHa*1e4):'—',sub:isAdvc?'ADVC en vista':'capas en vista',col:[26,92,78]},
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
    let chartY = y;
    for (let i = 0; i < chartIds.length; i++) {
      try {
        const cEl = document.getElementById(chartIds[i]);
        if (cEl && validateElementVisible(cEl)) {
          const cImg = await captureWithTimeout(() => html2canvas(cEl, { backgroundColor: '#ffffff', scale: 2, useCORS: true }), 3500, null);
          if (cImg) {
            const u = cImg.toDataURL('image/png');
            const col = i % 2 === 0 ? 10 : 110;
            const row = Math.floor(i / 2);
            const yy = chartY + row * 55;
            if (yy + 40 < 280) doc.addImage(u, 'PNG', col, yy, 85, 40);
          }
        }
      } catch (e) { console.warn('Error capturando gráfico', e); }
    }
    y = chartY + 120;
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