import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"app.js"
t = p.read_text(encoding="utf-8")

# Encontrar el switchTab y añadir manejo de incendios/huracanes
# Buscar la sección "else if(tabId==='dashboard')"
old_dashboard = "else if(tabId==='dashboard'){dashboardContainer.style.display='block';if(!mapDashboardContainer.contains(mapEl)){mapDas"

if old_dashboard in t:
    # Encontrar el cierre de esa sección (buscar el siguiente "map.setView" o similar)
    idx = t.find(old_dashboard)
    # Buscar el cierre - el siguiente "if(tabId!=='dashboard')"
    end_marker = "if(tabId!=='dashboard')"
    end_idx = t.find(end_marker, idx)
    if end_idx > 0:
        # Insertar nuevas secciones antes del cierre
        new_sections = """else if(tabId==='incendios'){
    // Activar sección incendios
    var incPanel=document.getElementById('seccion-incendios');
    if(incPanel) incPanel.classList.add('visible');
    var hurPanel=document.getElementById('seccion-huracanes');
    if(hurPanel) hurPanel.classList.remove('visible');
    if(typeof initIncendios==='function') initIncendios();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }
  else if(tabId==='huracanes'){
    // Activar sección huracanes
    var hurPanel2=document.getElementById('seccion-huracanes');
    if(hurPanel2) hurPanel2.classList.add('visible');
    var incPanel2=document.getElementById('seccion-incendios');
    if(incPanel2) incPanel2.classList.remove('visible');
    if(typeof initHuracanes==='function') initHuracanes();
    gCount.style.display='none'; gArea.style.display='none'; gAdvc.style.display='none';
  }
  """
        # Insert before the "if(tabId!=='dashboard')" line
        t = t[:end_idx] + new_sections + t[end_idx:]
        print("switchTab: incendios + huracanes added")
    else:
        print("switchTab: end marker not found")
else:
    print("switchTab: dashboard pattern not found")

# También ocultar los paneles cuando se cambia a otra pestaña
old_hide = "gCount.style.display='none';gArea.style.display='none';gAdvc.style.display='none';dashboardContainer.style.display='none';"
new_hide = "gCount.style.display='none';gArea.style.display='none';gAdvc.style.display='none';dashboardContainer.style.display='none';try{var _ip=document.getElementById('seccion-incendios');if(_ip)_ip.classList.remove('visible');var _hp=document.getElementById('seccion-huracanes');if(_hp)_hp.classList.remove('visible');if(typeof limpiarIncendios==='function')limpiarIncendios();if(typeof limpiarHuracanes==='function')limpiarHuracanes();}catch(e){}"

t = t.replace(old_hide, new_hide, 1)
print("switchTab: cleanup on tab change")

p.write_text(t, encoding="utf-8")
print(f"app.js: {len(t)}")
