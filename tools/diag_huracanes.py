import pathlib
W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")

html = (W/"index.html").read_text(encoding="utf-8")
css = (W/"assets"/"css"/"plus_sections.css").read_text(encoding="utf-8")
app = (W/"assets"/"js"/"app.js").read_text(encoding="utf-8")
hur = (W/"assets"/"js"/"huracanes.js").read_text(encoding="utf-8")

checks = [
    ("HTML: huracanes-info div", "huracanes-info" in html),
    ("HTML: seccion-huracanes div", "seccion-huracanes" in html),
    ("HTML: tab data-tab=huracanes", 'data-tab="huracanes"' in html),
    ("HTML: script huracanes.js", "huracanes.js" in html),
    ("CSS: seccion-panel-huracanes", "seccion-panel-huracanes" in css),
    ("CSS: .visible", ".visible" in css),
    ("JS app: initHuracanes called", "initHuracanes" in app),
    ("JS app: seccion-huracanes refs", app.count("seccion-huracanes")),
    ("JS hur: initHuracanes defined", "function initHuracanes" in hur),
    ("JS hur: window.initHuracanes", "window.initHuracanes" in hur),
    ("JS hur: actualizarPanelHuracanes", "function actualizarPanelHuracanes" in hur),
    ("JS hur: getElementById huracanes-info", "huracanes-info" in hur),
]
for name, ok in checks:
    print("OK" if ok else "FAIL", name)

# Check the exact HTML structure around the hurricane panel
i = html.find("seccion-huracanes")
if i >= 0:
    print("\nHTML context:")
    print(html[max(0,i-100):i+300])
else:
    print("\nWARNING: seccion-huracanes NOT in HTML!")
