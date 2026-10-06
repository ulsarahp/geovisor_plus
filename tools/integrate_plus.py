import pathlib, re

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"index.html"
t = p.read_text(encoding="utf-8")
print(f"Original: {len(t)}")

# ================================================================
# 1. Añadir pestañas Incendios y Huracanes
# ================================================================
# Find the dashboard tab
dash_pat = re.compile(r'<button[^>]*data-tab="dashboard"[^>]*>.*?</button>')
m = dash_pat.search(t)
if m:
    new_tabs = m.group(0) + """
          <button class="tab tab-incendios" data-tab="incendios"><i class="fas fa-fire"></i> Incendios</button>
          <button class="tab tab-huracanes" data-tab="huracanes"><i class="fas fa-hurricane"></i> Huracanes</button>"""
    t = t[:m.start()] + new_tabs + t[m.end():]
    print("1. Tabs added")
else:
    print("1. WARNING: dashboard tab not found")

# ================================================================
# 2. Añadir paneles en el sidebar (después del panel de capas)
# ================================================================
# Find the closing of capa-list or the sidebar end
panel_marker = '<div id="grafico-anp-conteo"'
if panel_marker in t:
    new_panels = """<!-- INCENDIOS PANEL -->
    <div class="seccion-panel-incendios" id="seccion-incendios">
      <div class="seccion-titulo incendios"><i class="fas fa-fire"></i> Alerta Temprana Incendios</div>
      <div class="incendios-controls">
        <button id="btn-fires-24h" class="active" onclick="cambiarRangoIncendios(1)">24h</button>
        <button id="btn-fires-48h" onclick="cambiarRangoIncendios(2)">48h</button>
        <button id="btn-fires-7d" onclick="cambiarRangoIncendios(7)">7 días</button>
      </div>
      <div id="incendios-stats"></div>
      <div class="firms-legend">
        <span><span class="leg-dot" style="background:#FF0000;"></span> Alta confianza</span>
        <span><span class="leg-dot" style="background:#FF8C00;"></span> Nominal</span>
        <span><span class="leg-dot" style="background:#FFD700;"></span> Baja</span>
      </div>
    </div>

    <!-- HURACANES PANEL -->
    <div class="seccion-panel-huracanes" id="seccion-huracanes">
      <div class="seccion-titulo huracanes"><i class="fas fa-hurricane"></i> Monitor de Huracanes</div>
      <div class="incendios-controls">
        <button id="btn-viirs-today" class="active" onclick="actualizarVIIRSFecha(0)">Hoy</button>
        <button id="btn-viirs-1d" onclick="actualizarVIIRSFecha(1)">Ayer</button>
        <button id="btn-viirs-2d" onclick="actualizarVIIRSFecha(2)">2 días</button>
      </div>
      <div id="huracanes-info"></div>
    </div>

    """
    t = t.replace(panel_marker, new_panels + panel_marker, 1)
    print("2. Panels added")
else:
    print("2. WARNING: panel marker not found")

# ================================================================
# 3. Añadir CSS de las nuevas secciones
# ================================================================
css_link = '<link rel="stylesheet" href="assets/css/app.css'
plus_css = '<link rel="stylesheet" href="assets/css/plus_sections.css" />'
if plus_css not in t:
    t = t.replace(css_link, plus_css + '\n  ' + css_link, 1)
    print("3. CSS added")

# ================================================================
# 4. Añadir scripts de incendios y huracanes
# ================================================================
# Find where metadata.js is loaded
meta_script = '<script src="assets/js/metadata.js'
plus_scripts = """<script src="assets/js/incendios.js"></script>
<script src="assets/js/huracanes.js"></script>
  """
if 'incendios.js' not in t:
    t = t.replace(meta_script, plus_scripts + meta_script, 1)
    print("4. Scripts added")

# ================================================================
# 5. Actualizar title
# ================================================================
t = t.replace("GeoTlacuilo CONANP", "Geovisor Plus CONANP")
t = t.replace("GeoTlacuilo", "Geovisor Plus")

p.write_text(t, encoding="utf-8")
print(f"Final: {len(t)}")
