import pathlib, re

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
html = (W/"index.html").read_text(encoding="utf-8")

css_app = (W/"assets"/"css"/"app.css").read_text(encoding="utf-8")
css_plus = (W/"assets"/"css"/"plus_sections.css").read_text(encoding="utf-8")
html = re.sub(
    r'<link rel="stylesheet" href="assets/css/app\.css[^"]*" />',
    lambda m: "<style>\n" + css_app + "\n</style>",
    html
)
html = re.sub(
    r'<link rel="stylesheet" href="assets/css/plus_sections\.css[^"]*" />',
    lambda m: "<style>\n" + css_plus + "\n</style>",
    html
)

for js_name in ["anti_fouc.js","config.js","incendios.js","huracanes.js","app.js","features.js","metadata.js","disclaimer.js"]:
    p = W/"assets"/"js"/js_name
    if not p.exists():
        continue
    code = p.read_text(encoding="utf-8")
    pat_str = '<script src="assets/js/' + js_name
    html = re.sub(
        re.escape(pat_str) + r'[^"]*"></script>',
        lambda m, c=code: "<script>\n" + c + "\n</script>",
        html
    )

main = (W/"assets"/"js"/"main.js").read_text(encoding="utf-8").replace("\r\n", "\n")
main_stripped = re.sub(r"^import\s.*?;\s*$", "", main, flags=re.MULTILINE | re.DOTALL)
main_stripped = re.sub(r"^export\s.*$", "", main_stripped, flags=re.MULTILINE).strip()
html = re.sub(
    r'<script type="module" src="assets/js/main\.js[^"]*"></script>',
    lambda m: "<script>\n" + main_stripped + "\n</script>",
    html
)

(W/"geovisor_plus_single.html").write_text(html, encoding="utf-8")
print(f"Single: {len(html)} chars, {len(html.splitlines())} lines")
