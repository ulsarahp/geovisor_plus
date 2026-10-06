import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
t = (W/"assets"/"js"/"app.js").read_text(encoding="utf-8")

# 1. switchTab incendios
i = t.find("tabId==='incendios'")
if i >= 0:
    print("switchTab incendios: FOUND")
    seg = t[max(0,i-50):i+300]
    print("  context:", seg[:200])
else:
    print("switchTab incendios: NOT FOUND")

# 2. Count occurrences
for name in ["initIncendios", "limpiarIncendios", "initHuracanes", "limpiarHuracanes",
              "seccion-incendios", "seccion-huracanes", "tab-incendios", "tab-huracanes"]:
    print(f"  {name}: {t.count(name)}")

# 3. Check the cleanup code - it might be too aggressive
i2 = t.find("limpiarIncendios")
contexts = []
while i2 >= 0:
    seg = t[max(0,i2-60):i2+60]
    contexts.append(seg[:120])
    i2 = t.find("limpiarIncendios", i2+1)
for c in contexts:
    print("  ctx:", c[:100])
