import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"app.js"
t = p.read_text(encoding="utf-8")

old = "if(typeof limpiarIncendios==='function')limpiarIncendios();if(typeof limpiarHuracanes==='function')limpiarHuracanes();"
new = "if(tabId!=='incendios'&&typeof limpiarIncendios==='function')limpiarIncendios();if(tabId!=='huracanes'&&typeof limpiarHuracanes==='function')limpiarHuracanes();"

assert old in t, "pattern not found"
t = t.replace(old, new, 1)
p.write_text(t, encoding="utf-8")
print("cleanup fixed")
print(f"app.js: {len(t)}")
