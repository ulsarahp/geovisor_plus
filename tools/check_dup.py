import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
for f in ["assets/js/incendios.js", "assets/js/huracanes.js"]:
    t = (W/f).read_text(encoding="utf-8")
    print(f, "const GIBS_BASE:", t.count("const GIBS_BASE"), "const GIBS_TMS:", t.count("const GIBS_TMS"))
