import pathlib
W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
t = (W/"assets"/"js"/"app.js").read_text(encoding="utf-8")
needle = "tabId==='huracanes'"
i = t.find(needle)
if i >= 0:
    print(t[max(0,i-100):i+500])
else:
    print("NOT FOUND")
