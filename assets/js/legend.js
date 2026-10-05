// ================================================================
// LEGEND
// ================================================================
function actualizarLeyenda(){const leyendaDiv=document.getElementById('leyenda');const keys=Object.keys(activeLayers);if(!keys.length){leyendaDiv.style.display='none';return;}const bounds=map.getBounds();let html=`<div class="leyenda-titulo">Capas visibles</div><div class="leyenda-cols">`;let tieneItems=false;keys.forEach(key=>{const entry=activeLayers[key];const features=entry.featuresData||[];let visible=false,categorias=null;if(esCapaAnpPrincipal(key)&&entry.categoriaCol){const catMap=new Map();features.forEach(f=>{try{if(bounds.intersects(L.geoJSON(f).getBounds())){const v=f.properties[entry.categoriaCol];if(v&&v!=='null'){catMap.set(getNombreCompleto(v),getColorPorCategoria(v));visible=true;}}}catch(e){}});if(catMap.size>0)categorias=catMap;}else{features.forEach(f=>{try{if(bounds.intersects(L.geoJSON(f).getBounds()))visible=true;}catch(e){}});}if(!visible&&!categorias)return;tieneItems=true;const nombre=entry.userName||getNombreAmigable(key);const color=entry.userColor||entry.color||'#ccc';if(categorias){html+=`<div class="leyenda-item" style="font-weight:600;font-size:0.6rem;color:var(--text-secondary);margin-top:0.28rem">${nombre}</div>`;Array.from(categorias.entries()).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([n,c])=>{html+=`<div class="leyenda-item leyenda-sub"><span class="leyenda-color" style="background:${c}"></span><span class="leyenda-label">${n}</span></div>`;});}else{
   let swatch='';
   if(entry.symbology){
    const s=entry.symbology; const gt=entry.geomType||'';
    if(gt.includes('Point')){
     const c=s.pointColor, r=Math.min(12,Math.max(6,s.pointRadius||6)), o=s.pointOpacity, sh=s.pointShape;
     if(sh==='circle') swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;border-radius:50%;opacity:${o}"></span>`;
     else if(sh==='square') swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;opacity:${o}"></span>`;
     else if(sh==='diamond') swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;opacity:${o};transform:rotate(45deg)"></span>`;
     else if(sh==='triangle') swatch=`<span style="width:0;height:0;border-left:${r/2}px solid transparent;border-right:${r/2}px solid transparent;border-bottom:${r}px solid ${c};opacity:${o};display:inline-block;flex-shrink:0"></span>`;
     else swatch=`<span class="leyenda-color" style="background:${c};width:${r}px;height:${r}px;border-radius:50%;opacity:${o}"></span>`;
    } else if(gt.includes('Line')){
     const c=s.lineColor, w=s.lineWeight, o=s.lineOpacity, d=s.lineDash;
     let bg=c; if(d==='6,4') bg=`repeating-linear-gradient(90deg,${c} 0 4px, transparent 4px 8px)`;
     else if(d==='2,6') bg=`repeating-linear-gradient(90deg,${c} 0 2px, transparent 2px 6px)`;
     else if(d==='8,4,2,4') bg=`repeating-linear-gradient(90deg,${c} 0 6px, transparent 6px 10px)`;
     swatch=`<span class="leyenda-color" style="background:${bg};background-color:${c};height:${Math.min(w,6)}px;opacity:${o};min-width:16px"></span>`;
    } else {
     const c=s.polyFillColor, bc=s.polyColor, ft=s.polyFillType, fo=s.polyFillOpacity;
     let bg=c;
     if(ft==='hashed') bg=`repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 6px)`;
     else if(ft==='line') bg=`repeating-linear-gradient(0deg, ${c} 0 2px, transparent 2px 6px)`;
     else if(ft==='grid') bg=`repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, ${c} 0 1px, transparent 1px 6px)`;
     swatch=`<span class="leyenda-color" style="background:${bg};background-color:${c};opacity:${fo};border:1.5px solid ${bc};width:16px;height:12px"></span>`;
    }
   } else swatch=`<span class="leyenda-color" style="background:${color}"></span>`;
   html+=`<div class="leyenda-item">${swatch}<span class="leyenda-label">${nombre}</span></div>`;
  }});if(!tieneItems){leyendaDiv.style.display='none';return;}leyendaDiv.innerHTML=html+'</div>';leyendaDiv.classList.toggle('dos-col',leyendaDiv.querySelectorAll('.leyenda-item').length>8);leyendaDiv.style.display='block';}