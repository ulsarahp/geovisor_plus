import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"huracanes.js"
t = p.read_text(encoding="utf-8")

# ================================================================
# Simplificar: quitar pane personalizado, usar tilePane default + zIndex
# ================================================================

# 1. Simplificar crearGibsTile: sin pane, sin bounds, solo zIndex
old_tile = """function crearGibsTile(layer, dias) {
  return L.tileLayer(GIBS_BASE + layer + '/default/' + gibsFecha(dias) + '/' + GIBS_TMS + '/{z}/{y}/{x}.jpg', {
    attribution: 'NASA GIBS / EOSDIS · ' + layer,
    maxZoom: 9, bounds: [[-85.0511, -180], [85.0511, 180]],
    crossOrigin: true, opacity: 0.92, className: 'gibs-viirs-huracan', pane: 'gibsPane'
  });
}"""

new_tile = """function crearGibsTile(layer, dias) {
  var fecha = gibsFecha(dias);
  var url = GIBS_BASE + layer + '/default/' + fecha + '/' + GIBS_TMS + '/{z}/{y}/{x}.jpg';
  console.log('[Huracanes] Tile URL:', url.replace('{z}','3').replace('{y}','4').replace('{x}','5'));
  return L.tileLayer(url, {
    attribution: 'NASA GIBS / EOSDIS · ' + layer,
    maxNativeZoom: 9,
    maxZoom: map ? map.getMaxZoom() : 19,
    zIndex: 500,
    crossOrigin: true,
    opacity: 0.92,
    className: 'gibs-viirs-huracan'
  });
}"""

if old_tile in t:
    t = t.replace(old_tile, new_tile, 1)
    print("crearGibsTile simplified (no pane, no bounds, zIndex 500)")
else:
    print("crearGibsTile: pattern not found, showing actual:")
    i = t.find("function crearGibsTile")
    if i >= 0:
        print(t[i:i+400])

# 2. Simplificar initHuracanes: sin createPane
old_init = """  if (!huracanesLayerVIIRS) {
    huracanesLayerVIIRS = crearCapaVIIRS(2);
    try{ if(!map.getPane("gibsPane")){ map.createPane("gibsPane"); map.getPane("gibsPane").style.zIndex = 450; map.getPane("gibsPane").style.pointerEvents = "none"; } }catch(e){} huracanesLayerVIIRS.addTo(map);
  }"""

new_init = """  if (!huracanesLayerVIIRS) {
    huracanesLayerVIIRS = crearCapaVIIRS(2);
    huracanesLayerVIIRS.on('tileload', function(ev) {
      console.log('[Huracanes] Tile cargado:', ev.coords.z + '/' + ev.coords.y + '/' + ev.coords.x);
    });
    huracanesLayerVIIRS.on('tileerror', function(ev) {
      console.warn('[Huracanes] Tile ERROR:', ev.coords ? (ev.coords.z + '/' + ev.coords.y + '/' + ev.coords.x) : 'unknown', ev.error || '');
    });
    huracanesLayerVIIRS.addTo(map);
    console.log('[Huracanes] Layer añadido al mapa');
  }"""

if old_init in t:
    t = t.replace(old_init, new_init, 1)
    print("initHuracanes simplified (no pane, with debug logs)")
else:
    print("initHuracanes: pattern not found")

p.write_text(t, encoding="utf-8")
print(f"huracanes.js: {len(t)}")
