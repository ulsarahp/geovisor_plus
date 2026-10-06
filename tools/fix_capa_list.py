import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"app.js"
t = p.read_text(encoding="utf-8")

# Fix: cuando se activa incendios/huracanes, ocultar capa-list para que el panel tenga espacio
# Y restaurarlo al cambiar a otra pestaña

# 1. Buscar el bloque de incendios
old_inc = """else if(tabId==='incendios'){
    // Activar sección incendios
    var incPanel=document.getElementById('seccion-incendios');
    if(incPanel) incPanel.classList.add('visible');
    var hurPanel=document.getElementById('seccion-huracanes');
    if(hurPanel) hurPanel.classList.remove('visible');
    if(typeof initIncendios==='function') initIncendios();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }"""

new_inc = """else if(tabId==='incendios'){
    var incPanel=document.getElementById('seccion-incendios');
    if(incPanel) incPanel.classList.add('visible');
    var hurPanel=document.getElementById('seccion-huracanes');
    if(hurPanel) hurPanel.classList.remove('visible');
    var cl1=document.getElementById('capa-list');
    if(cl1){ cl1.style.display='none'; cl1.style.flex='0 0 auto'; }
    if(typeof initIncendios==='function') initIncendios();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }"""

if old_inc in t:
    t = t.replace(old_inc, new_inc, 1)
    print("incendios: capa-list hidden")
else:
    print("incendios: pattern not found")

# 2. Buscar el bloque de huracanes
old_hur = """else if(tabId==='huracanes'){
    // Activar sección huracanes
    var hurPanel2=document.getElementById('seccion-huracanes');
    if(hurPanel2) hurPanel2.classList.add('visible');
    var incPanel2=document.getElementById('seccion-incendios');
    if(incPanel2) incPanel2.classList.remove('visible');
    if(typeof initHuracanes==='function') initHuracanes();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }"""

new_hur = """else if(tabId==='huracanes'){
    var hurPanel2=document.getElementById('seccion-huracanes');
    if(hurPanel2) hurPanel2.classList.add('visible');
    var incPanel2=document.getElementById('seccion-incendios');
    if(incPanel2) incPanel2.classList.remove('visible');
    var cl2=document.getElementById('capa-list');
    if(cl2){ cl2.style.display='none'; cl2.style.flex='0 0 auto'; }
    if(typeof initHuracanes==='function') initHuracanes();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }"""

if old_hur in t:
    t = t.replace(old_hur, new_hur, 1)
    print("huracanes: capa-list hidden")
else:
    print("huracanes: pattern not found")

# 3. Restaurar capa-list cuando se cambia a general/advc/dashboard
old_restore = "if(tabId!=='dashboard')map.fitBounds("
new_restore = """var _cl=document.getElementById('capa-list');
  if(_cl && tabId!=='incendios' && tabId!=='huracanes'){ _cl.style.display=''; _cl.style.flex=''; }
  if(tabId!=='dashboard')map.fitBounds("""

if old_restore in t and "_cl.style.flex" not in t:
    t = t.replace(old_restore, new_restore, 1)
    print("capa-list restore added")

p.write_text(t, encoding="utf-8")
print(f"app.js: {len(t)}")
