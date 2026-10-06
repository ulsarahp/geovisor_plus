import pathlib, re

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"huracanes.js"
t = p.read_text(encoding="utf-8")

# Use regex to replace the tile options more flexibly
old_pat = r"maxZoom: 9, bounds: \[\[-85\.0511,-180\],\[85\.0511,180\]\],\s*crossOrigin: true, opacity: 0\.92, className: 'gibs-viirs-huracan', pane: 'gibsPane'"
new_opts = "maxNativeZoom: 9, maxZoom: (map ? map.getMaxZoom() : 19), zIndex: 500, crossOrigin: true, opacity: 0.92, className: 'gibs-viirs-huracan'"

m = re.search(old_pat, t)
if m:
    t = re.sub(old_pat, new_opts, t, count=1)
    print("Tile options fixed: no pane, no bounds, zIndex 500, maxNativeZoom 9")
else:
    # More aggressive: find everything between attribution and closing brace
    pat2 = re.compile(r"(attribution: 'NASA GIBS.*?')(\s*,\s*)(maxZoom.*?)(\})", re.DOTALL)
    m2 = pat2.search(t)
    if m2:
        t = re.sub(pat2, r"\1\2maxNativeZoom: 9, maxZoom: (map ? map.getMaxZoom() : 19), zIndex: 500, crossOrigin: true, opacity: 0.92, className: 'gibs-viirs-huracan'\4", t, count=1)
        print("Tile options fixed via regex")
    else:
        print("Could not find tile options pattern")

# Also add the debug URL log if not there
if "Tile URL:" not in t:
    # Add after the URL construction line
    url_line = t.find("GIBS_TMS + '/{z}/{y}/{x}.jpg'")
    if url_line >= 0:
        line_end = t.find('\n', url_line)
        t = t[:line_end+1] + "  console.log('[Huracanes] Tile URL:', url.replace('{z}','3').replace('{y}','4').replace('{x}','5'));\n" + t[line_end+1:]
        print("Debug URL log added")

p.write_text(t, encoding="utf-8")
print(f"huracanes.js: {len(t)}")
