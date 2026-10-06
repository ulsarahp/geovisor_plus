import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"huracanes.js"
t = p.read_text(encoding="utf-8")

# 1. zIndex + maxNativeZoom
old1 = "maxZoom: 9, bounds: [[-85.0511, -180], [85.0511, 180]],"
new1 = "maxZoom: 9, maxNativeZoom: 9, bounds: [[-85.0511, -180], [85.0511, 180]], zIndex: 450,"
if old1 in t:
    t = t.replace(old1, new1, 1)
    print("zIndex added")

# 2. Default date: 2 days ago (more likely to have processed data)
old2 = "crearCapaVIIRS(1);"
new2 = "crearCapaVIIRS(2);"
if old2 in t:
    t = t.replace(old2, new2, 1)
    print("default date -> 2 days ago")

# 3. Use dedicated pane for GIBS layer (above base tiles, below vectors)
old3 = "huracanesLayerVIIRS.addTo(map);"
new3 = 'try{ if(!map.getPane("gibsPane")){ map.createPane("gibsPane"); map.getPane("gibsPane").style.zIndex = 450; map.getPane("gibsPane").style.pointerEvents = "none"; } }catch(e){} huracanesLayerVIIRS.addTo(map);'
if old3 in t:
    t = t.replace(old3, new3, 1)
    print("gibsPane created")

# 4. Add pane option to tile layer
old4 = 'className: \'gibs-viirs-huracan\''
new4 = 'className: \'gibs-viirs-huracan\', pane: \'gibsPane\''
if old4 in t:
    t = t.replace(old4, new4, 1)
    print("pane option added to tile layer")

p.write_text(t, encoding="utf-8")
print(f"huracanes.js: {len(t)}")
