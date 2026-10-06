import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"app.js"
t = p.read_text(encoding="utf-8")

# ================================================================
# FIX 1: Capturar solo el área del rectángulo (no todo el mapa)
# ================================================================
# Añadir función que recorta la captura a los bounds del rectángulo

crop_func = """
// Capturar mapa recortado a un área geográfica específica (ej. rectángulo ANP)
async function capturarMapaRecortado(bounds) {
  if (!bounds || !bounds.isValid) return null;
  try {
    // Capturar el mapa completo
    const target = map.getContainer();
    const timeout = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

    var canvas = null;
    // html2canvas (prioridad)
    try {
      canvas = await Promise.race([
        html2canvas(target, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2, logging: false, imageTimeout: 0 }),
        timeout(5000, 'html2canvas timeout')
      ]);
    } catch (e) { console.warn('capturarMapaRecortado html2canvas fallo', e); }

    if (!canvas) {
      try {
        canvas = await Promise.race([
          domtoimage.toCanvas(target, { bgcolor: null }),
          timeout(4000, 'domtoimage timeout')
        ]);
      } catch (e) { console.warn('capturarMapaRecortado domtoimage fallo', e); }
    }

    if (!canvas) return placeholderDataURLSquare('Error captura');

    // Calcular pixel bounds del área geográfica
    var nw = bounds.getNorthWest();
    var se = bounds.getSouthEast();
    var topLeft = map.latLngToContainerPoint(nw);
    var bottomRight = map.latLngToContainerPoint(se);

    // Escala de captura (html2canvas scale:2 = factor 2)
    var scaleFactor = 2;
    var px = Math.max(0, Math.round(topLeft.x * scaleFactor));
    var py = Math.max(0, Math.round(topLeft.y * scaleFactor));
    var pw = Math.min(canvas.width - px, Math.round((bottomRight.x - topLeft.x) * scaleFactor));
    var ph = Math.min(canvas.height - py, Math.round((bottomRight.y - topLeft.y) * scaleFactor));

    if (pw < 10 || ph < 10) {
      console.warn('capturarMapaRecortado: area demasiado pequena', px, py, pw, ph);
      return canvas.toDataURL('image/png');
    }

    // Añadir margen (10%)
    var margin = Math.round(Math.min(pw, ph) * 0.10);
    px = Math.max(0, px - margin);
    py = Math.max(0, py - margin);
    pw = Math.min(canvas.width - px, pw + margin * 2);
    ph = Math.min(canvas.height - py, ph + margin * 2);

    // Recortar al área del rectángulo
    var cropped = document.createElement('canvas');
    cropped.width = pw;
    cropped.height = ph;
    var cctx = cropped.getContext('2d');
    cctx.drawImage(canvas, px, py, pw, ph, 0, 0, pw, ph);

    // Aplicar letterbox cuadrado al recorte
    return canvasToSquareDataURL(cropped);
  } catch (e) {
    console.warn('capturarMapaRecortado error', e);
    return null;
  }
}
window.capturarMapaRecortado = capturarMapaRecortado;
"""

# Insertar después de capturarMapa
marker = "function placeholderDataURLSquare"
idx = t.find(marker)
if idx >= 0:
    t = t[:idx] + crop_func + "\n" + t[idx:]
    print("capturarMapaRecortado added")

# ================================================================
# FIX 2: En imprimirGeneralADVC, usar capturarMapaRecortado si hay rectBounds
# ================================================================
old_capture = "let mapImg=null;\n  try{ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }\n  catch(e){ mapImg=placeholderDataURLSquare('Error capturando mapa'); }"
new_capture = """let mapImg=null;
  if(rectBounds){
    // Recortar la captura al área del rectángulo dibujado
    try{ mapImg=await capturarMapaRecortado(rectBounds); }catch(e){}
  }
  if(!mapImg){
    try{ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }
    catch(e){ mapImg=placeholderDataURLSquare('Error capturando mapa'); }
  }"""

if old_capture in t:
    t = t.replace(old_capture, new_capture, 1)
    print("imprimirGeneralADVC: usa capturarMapaRecortado con rectBounds")
else:
    print("imprimirGeneralADVC: capture pattern not found, trying flexible...")
    # Try finding it with different whitespace
    import re
    pat = re.compile(r"let mapImg=null;\s*try\{ mapImg=await capturarMapa\(map\.getContainer\(\)\);", re.DOTALL)
    m = pat.search(t)
    if m:
        replacement = """let mapImg=null;
  if(rectBounds){ try{ mapImg=await capturarMapaRecortado(rectBounds); }catch(e){} }
  if(!mapImg){ try{ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }"""
        end_of_match = m.end()
        t = t[:m.start()] + replacement + t[end_of_match - len("try{ mapImg=await capturarMapa(map.getContainer());") + len("catch(e){ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }"):]  # This is complex, let me use a simpler approach
        # Actually let me just use re.sub
        t = pat.sub(lambda m: "let mapImg=null;\n  if(rectBounds){ try{ mapImg=await capturarMapaRecortado(rectBounds); }catch(e){} }\n  if(!mapImg){ try{ mapImg=await capturarMapa(map.getContainer()); if(!mapImg) throw new Error('null'); }", t, count=1)
        print("imprimirGeneralADVC: flexible replacement done")

p.write_text(t, encoding="utf-8")
print(f"app.js: {len(t)}")
