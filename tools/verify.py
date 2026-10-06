import pathlib
W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
t = (W/"index.html").read_text(encoding="utf-8")
checks = [
    ("tab incendios", "tab-incendios" in t and 'data-tab="incendios"' in t),
    ("tab huracanes", "tab-huracanes" in t and 'data-tab="huracanes"' in t),
    ("panel incendios", "seccion-incendios" in t),
    ("panel huracanes", "seccion-huracanes" in t),
    ("script incendios", "incendios.js" in t),
    ("script huracanes", "huracanes.js" in t),
    ("css plus", "plus_sections.css" in t),
    ("title Plus", "Geovisor Plus" in t),
]
for name, ok in checks:
    print("OK" if ok else "FAIL", name)
