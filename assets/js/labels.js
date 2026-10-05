
// Etiquetas avanzadas por capa: 1-3 campos secuenciales, tipografía, color, offset auto
function getLabelFields(table){
  try{
    var e = (typeof activeLayers!=='undefined') ? activeLayers[table] : null;
    if(!e || !e.featuresData || !e.featuresData.length) return [];
    var props = e.featuresData[0].properties || {};
    var excl = ['gid','geom','geometry','shape_leng','shape_area','objectid','fid'];
    return Object.keys(props).filter(function(k){ var lo=k.toLowerCase(); for(var i=0;i<excl.length;i++){ if(lo.indexOf(excl[i])!==-1) return false; } return true; }).slice(0,30);
  }catch(err){ return []; }
}
function getLabelConfig(table){
  try{
    var e = activeLayers[table];
    if(e && e.labelConfig) return e.labelConfig;
  }catch(e){}
  return {fields:[], fontFamily:'Inter, sans-serif', fontSize:11, bold:true, italic:false, color:'#1a2b26', offsetX:0, offsetY:0, auto:true};
}
function buildLabelText(props, fields){
  var parts = [];
  (fields||[]).forEach(function(f){
    if(!f) return;
    var v = props ? props[f] : null;
    if(v===null||v===undefined||v==='') return;
    var s = String(v);
    if(s.length>32) s = s.substring(0,31)+'\u2026';
    parts.push(s);
  });
  return parts.join('\n');
}
function centroidOf(sub){
  try{
    if(sub.getLatLng) return sub.getLatLng();
    if(sub.getBounds){ return sub.getBounds().getCenter(); }
    if(sub.feature){
      var gj = {type:'Feature', properties:{}, geometry:sub.feature.geometry};
      try{
        if(typeof turf!=='undefined' && turf.centroid){
          var c = turf.centroid({type:'FeatureCollection', features:[sub.feature]});
          if(c && c.geometry && c.geometry.coordinates) return L.latLng(c.geometry.coordinates[1], c.geometry.coordinates[0]);
        }
      }catch(e){}
      try{ return L.geoJSON(gj).getBounds().getCenter(); }catch(e){}
    }
  }catch(e){}
  return null;
}
function setLayerLabelsAdvanced(table, cfg){
  try{
    var entry = activeLayers[table];
    if(!entry || !entry.layer) return;
    entry.labelConfig = cfg;
    // limpiar
    entry.layer.eachLayer(function(sub){ try{ sub.unbindTooltip(); }catch(e){} });
    if(!cfg || !cfg.fields || !cfg.fields.filter(function(f){return !!f;}).length){
      entry.labelField = null;
      try{ var b0=document.querySelector('.btn-label[data-table="'+table+'"]'); if(b0) b0.classList.remove('active'); }catch(e){}
      return;
    }
    var fields = cfg.fields.filter(function(f){return !!f;});
    // Recolectar candidatos con su punto
    var items = [];
    entry.layer.eachLayer(function(sub){
      try{
        var p = sub.feature ? sub.feature.properties : {};
        var txt = buildLabelText(p, fields);
        if(!txt) return;
        var ll = centroidOf(sub);
        if(!ll) return;
        items.push({sub:sub, txt:txt, ll:ll});
      }catch(e){}
    });
    // Ordenar por tamaño (mayor primero) para dar prioridad anti-traslape
    items.sort(function(a,b){ return b.txt.length - a.txt.length; });
    var placed = [];
    function overlaps(x,y,w,h){
      for(var i=0;i<placed.length;i++){
        var r=placed[i];
        if(!(x+w<r.x || r.x+r.w<x || y+h<r.y || r.y+r.h<y)) return true;
      }
      return false;
    }
    var candidates = [[0,0],[0,-22],[0,22],[-22,0],[22,0],[-16,-16],[16,-16],[-16,16],[16,16],[0,-34],[0,34]];
    items.forEach(function(it){
      try{
        var base = map.latLngToContainerPoint(it.ll);
        var estW = Math.min(220, 8 + it.txt.split('\n').reduce(function(m,l){return Math.max(m,l.length);},0) * (cfg.fontSize*0.62));
        var lines = it.txt.split('\n').length;
        var estH = lines * (cfg.fontSize*1.35) + 8;
        var ox = Number(cfg.offsetX)||0, oy = Number(cfg.offsetY)||0;
        var chosen = {x:base.x+ox, y:base.y+oy, dx:ox, dy:oy};
        if(cfg.auto){
          var found=false;
          for(var i=0;i<candidates.length;i++){
            var cx = base.x + ox + candidates[i][0];
            var cy = base.y + oy + candidates[i][1];
            if(!overlaps(cx-estW/2, cy-estH/2, estW, estH)){ chosen={x:cx,y:cy,dx:ox+candidates[i][0],dy:oy+candidates[i][1]}; found=true; break; }
          }
          if(!found){ chosen={x:base.x+ox, y:base.y+oy, dx:ox, dy:oy}; }
        }
        placed.push({x:chosen.x-estW/2, y:chosen.y-estH/2, w:estW, h:estH});
        var off = map.containerPointToLatLng([chosen.x, chosen.y]);
        // offset de Leaflet respecto al ancla: diferencia entre punto elegido y centroide
        var anchor = map.latLngToContainerPoint(it.ll);
        var dOff = L.point(chosen.x-anchor.x, chosen.y-anchor.y);
        var style = 'font-family:'+cfg.fontFamily+';font-size:'+cfg.fontSize+'px;'+(cfg.bold?'font-weight:800;':'font-weight:400;')+(cfg.italic?'font-style:italic;':'')+'color:'+cfg.color+';';
        it.sub.bindTooltip('<span style="'+style+'">'+it.txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>', {permanent:true, direction:'center', offset:dOff, className:'layer-label-adv', opacity:0.96});
      }catch(e){}
    });
    entry.labelField = fields[0] || null;
    try{ var b1=document.querySelector('.btn-label[data-table="'+table+'"]'); if(b1){ b1.classList.add('active'); b1.title='Etiquetas: '+fields.join(' + '); } }catch(e){}
    // re-evaluar en movimiento (debounce) para mantener anti-traslape
    try{
      if(entry._labMoveH) map.off('moveend', entry._labMoveH);
      var h = function(){ try{ if(entry.labelConfig && entry.labelConfig.fields && entry.labelConfig.fields.length) setLayerLabelsAdvanced(table, entry.labelConfig); }catch(e){} };
      var deb=null;
      entry._labMoveH = function(){ clearTimeout(deb); deb=setTimeout(h, 350); };
      map.on('moveend', entry._labMoveH);
    }catch(e){}
  }catch(e){ console.warn('labelsAdv', e); }
}
// Compat: llamada simple de 1 campo
function setLayerLabels(table, field){
  try{
    if(!field){ setLayerLabelsAdvanced(table, {fields:[], fontFamily:'Inter, sans-serif', fontSize:11, bold:true, italic:false, color:'#1a2b26', offsetX:0, offsetY:0, auto:true}); return; }
    var cur = getLabelConfig(table);
    cur.fields = [field];
    setLayerLabelsAdvanced(table, cur);
  }catch(e){}
}
function openLabelEditor(btn){
  try{
    var table = btn.dataset.table;
    var fields = getLabelFields(table);
    var cfg = getLabelConfig(table);
    document.querySelectorAll('.btn-label .label-editor.show').forEach(function(m){ if(m.parentElement!==btn) m.classList.remove('show'); });
    var ed = btn.querySelector('.label-editor');
    if(!ed){ ed=document.createElement('div'); ed.className='label-editor'; btn.appendChild(ed); }
    if(ed.classList.contains('show')){ ed.classList.remove('show'); return; }
    function optList(sel){
      var h='<option value="">— campo —</option>';
      fields.forEach(function(f){ h+='<option value="'+f+'"'+(sel===f?' selected':'')+'>'+f+'</option>'; });
      return h;
    }
    var n = Math.max(1, Math.min(3, (cfg.fields&&cfg.fields.length)||1));
    var html='<h5>Etiqueta · '+table+'</h5>';
    html+='<div class="lab-row"><select data-lf="0">'+optList(cfg.fields[0]||'')+'</select><button class="mini-btn" data-add="1" title="Añadir campo 2">+</button></div>';
    if(n>=2) html+='<div class="lab-row"><select data-lf="1">'+optList(cfg.fields[1]||'')+'</select><button class="mini-btn" data-add="2" title="Añadir campo 3">+</button><button class="mini-btn" data-del="1" title="Quitar">×</button></div>';
    if(n>=3) html+='<div class="lab-row"><select data-lf="2">'+optList(cfg.fields[2]||'')+'</select><button class="mini-btn" data-del="2" title="Quitar">×</button></div>';
    html+='<h5>Tipografía</h5><div class="lab-row"><select data-ff><option>Inter, sans-serif</option><option>Space Grotesk, sans-serif</option><option>Arial, sans-serif</option><option>Georgia, serif</option></select></div>';
    html+='<div class="lab-row"><label style="font-size:0.66rem;">Tamaño</label><input type="number" data-fs min="8" max="20" value="'+(cfg.fontSize||11)+'" style="max-width:64px"><button class="style-btn'+(cfg.bold?' on':'')+'" data-bold>B</button><button class="style-btn'+(cfg.italic?' on':'')+'" data-italic><i>I</i></button><input type="color" data-color value="'+(cfg.color||'#1a2b26')+'" style="width:32px;height:26px;border:none;background:none"></div>';
    html+='<h5>Posición</h5><div class="lab-row"><label style="font-size:0.66rem;">X</label><input type="number" data-ox min="-40" max="40" value="'+(cfg.offsetX||0)+'" style="max-width:56px"><label style="font-size:0.66rem;">Y</label><input type="number" data-oy min="-40" max="40" value="'+(cfg.offsetY||0)+'" style="max-width:56px"><label style="font-size:0.66rem;"><input type="checkbox" data-auto'+(cfg.auto?' checked':'')+'> auto</label></div>';
    html+='<div class="lab-row"><button class="mini-btn" data-apply style="width:auto;padding:0 0.7rem;border-radius:999px;background:#1a5c4e;color:#fff;">Aplicar</button><button class="mini-btn" data-clear style="width:auto;padding:0 0.7rem;border-radius:999px;">Quitar</button></div>';
    if(!fields.length) html+='<div style="font-size:0.64rem;color:var(--text-muted);">Carga la capa para listar atributos.</div>';
    ed.innerHTML=html;
    // fijar fuente actual
    try{ var sel=ed.querySelector('[data-ff]'); if(sel) sel.value=cfg.fontFamily||'Inter, sans-serif'; }catch(e){}
    ed.classList.add('show');
  }catch(e){}
}
document.addEventListener('click', function(e){
  try{
    var act = e.target.closest ? e.target.closest('.label-editor [data-add],.label-editor [data-del],.label-editor [data-apply],.label-editor [data-clear],.label-editor [data-bold],.label-editor [data-italic]') : null;
    if(act){
      e.preventDefault(); e.stopPropagation();
      var ed = act.closest('.label-editor'); var btn = ed ? ed.parentElement : null;
      var table = btn ? btn.dataset.table : null;
      if(!table) return;
      var cfg = getLabelConfig(table);
      // leer selects actuales
      ed.querySelectorAll('select[data-lf]').forEach(function(s){ cfg.fields[Number(s.dataset.lf)] = s.value||null; });
      try{ cfg.fontFamily = ed.querySelector('[data-ff]').value; }catch(e){}
      try{ cfg.fontSize = Number(ed.querySelector('[data-fs]').value)||11; }catch(e){}
      try{ cfg.color = ed.querySelector('[data-color]').value; }catch(e){}
      try{ cfg.offsetX = Number(ed.querySelector('[data-ox]').value)||0; cfg.offsetY = Number(ed.querySelector('[data-oy]').value)||0; }catch(e){}
      try{ cfg.auto = ed.querySelector('[data-auto]').checked; }catch(e){}
      if(act.hasAttribute('data-add')){ var n=(cfg.fields.filter(function(f){return !!f;}).length); if(n>=3) return; cfg.fields.push(null); openLabelEditorRefresh(btn, cfg); return; }
      if(act.hasAttribute('data-del')){ var idx=Number(act.dataset.del); cfg.fields.splice(idx,1); if(!cfg.fields.length) cfg.fields=[null]; openLabelEditorRefresh(btn, cfg); return; }
      if(act.hasAttribute('data-bold')){ cfg.bold=!cfg.bold; setLayerLabelsAdvanced(table, cfg); openLabelEditorRefresh(btn, cfg); return; }
      if(act.hasAttribute('data-italic')){ cfg.italic=!cfg.italic; setLayerLabelsAdvanced(table, cfg); openLabelEditorRefresh(btn, cfg); return; }
      if(act.hasAttribute('data-apply')){ setLayerLabelsAdvanced(table, cfg); ed.classList.remove('show'); return; }
      if(act.hasAttribute('data-clear')){ setLayerLabelsAdvanced(table, {fields:[], fontFamily:cfg.fontFamily, fontSize:cfg.fontSize, bold:cfg.bold, italic:cfg.italic, color:cfg.color, offsetX:0, offsetY:0, auto:true}); ed.classList.remove('show'); return; }
      return;
    }
    var chg = e.target.closest ? e.target.closest('.label-editor select, .label-editor input') : null;
    if(chg){ e.stopPropagation(); return; }
    var lbl = e.target.closest ? e.target.closest('.btn-label') : null;
    if(lbl){ if(e.target.closest('.label-editor')) return; e.preventDefault(); e.stopPropagation(); openLabelEditor(lbl); return; }
    document.querySelectorAll('.btn-label .label-editor.show').forEach(function(m){ m.classList.remove('show'); });
  }catch(e){}
});
function openLabelEditorRefresh(btn, cfg){
  try{
    var table=btn.dataset.table;
    try{ var e=activeLayers[table]; if(e) e.labelConfig=cfg; }catch(e2){}
    // reabrir para mostrar nuevo campo
    var ed=btn.querySelector('.label-editor');
    if(ed) ed.classList.remove('show');
    openLabelEditor(btn);
    // restaurar valores
    try{
      var eds=btn.querySelector('.label-editor');
      if(eds){
        eds.querySelectorAll('select[data-lf]').forEach(function(s){ var i=Number(s.dataset.lf); if(cfg.fields[i]) s.value=cfg.fields[i]; });
      }
    }catch(e){}
  }catch(e){}
}
window.setLayerLabels=setLayerLabels; window.setLayerLabelsAdvanced=setLayerLabelsAdvanced; window.getLabelFields=getLabelFields;

