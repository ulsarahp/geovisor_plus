import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"huracanes.js"
t = p.read_text(encoding="utf-8")

# Renombrar para evitar colisión con incendios.js
t = t.replace("const GIBS_BASE = ", "var GIBS_BASE = ")  # var allows hoisting check
t = t.replace("const GIBS_TMS = ", "var GIBS_TMS = ")

# Actually, better: use completely different names
t = t.replace("GIBS_BASE", "HUR_GIBS_BASE")
t = t.replace("GIBS_TMS", "HUR_GIBS_TMS")
# But then the reference in crearGibsTile also needs updating — it already does since we replaced all occurrences

# Actually the simplest: remove the const declarations entirely since incendios.js already defines them
# Just check if incendios.js is loaded BEFORE huracanes.js in index.html
# If so, huracanes.js can use the same variables without redeclaring them

# Simplest approach: wrap in a guard
old_gibs = "var HUR_GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/';"
old_tms = "var HUR_GIBS_TMS = 'GoogleMapsCompatible_Level9';"

# Just remove the declarations from huracanes.js entirely
# They're already defined in incendios.js which loads first
if old_gibs in t:
    t = t.replace(old_gibs + "\n", "")
    t = t.replace(old_tms + "\n", "")
    print("Removed GIBS declarations from huracanes.js (uses incendios.js)")
elif "var HUR_GIBS_BASE" in t:
    # They were renamed, now reference back to original names
    t = t.replace("HUR_GIBS_BASE", "GIBS_BASE")
    t = t.replace("HUR_GIBS_TMS", "GIBS_TMS")
    # Now remove declarations
    import re
    t = re.sub(r"const GIBS_BASE = '[^']+';\n", "", t)
    t = re.sub(r"const GIBS_TMS = '[^']+';\n", "", t)
    print("Removed GIBS const declarations, using incendios.js globals")
else:
    # Direct approach: remove const declarations
    import re
    t = re.sub(r"const GIBS_BASE = '[^']+';.*?\n", "", t, count=1)
    t = re.sub(r"const GIBS_TMS = '[^']+';.*?\n", "", t, count=1)
    print("Direct removal of GIBS const declarations")

p.write_text(t, encoding="utf-8")
print(f"huracanes.js: {len(t)}")

# Verify
print("GIBS_BASE decl:", t.count("const GIBS_BASE"))
print("GIBS_TMS decl:", t.count("const GIBS_TMS"))
print("GIBS_BASE usage:", t.count("GIBS_BASE"))
print("GIBS_TMS usage:", t.count("GIBS_TMS"))
