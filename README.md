# Geovisor CONANP

El Geovisor CONANP es el visor institucional de CONANP para consultar las Áreas
Naturales Protegidas (ANP), las Áreas Destinadas Voluntariamente a la
Conservación (ADVC) y capas geográficas de contexto de México. `index.html`
contiene la vista y todos los recursos de ejecución se encuentran en `assets/`.

La aplicación integra consulta WFS, búsqueda, filtros, análisis espacial,
dashboard de indicadores, impresión institucional con captura exacta del mapa,
etiquetas, metadatos ISO 19115 con ficha PDF, carga de archivos geográficos,
FAQ, recorrido guiado y el asistente Balam (texto y voz, con navegación por
el geovisor).

## Inicio rápido

La aplicación debe servirse por HTTP o HTTPS. No se recomienda abrir
`index.html` directamente con `file://`, porque el navegador bloqueará las
solicitudes WFS y la carga de datos por CORS.

El visor consume exclusivamente el servicio institucional:

```text
https://geoserver.conanp.gob.mx/geoserver/SIG-DES/wfs?
```

## Estructura publicada

```text
index.html
assets/
├── css/              # Estilos de la aplicación
├── js/               # Lógica de la aplicación
└── data/             # Catálogos, descargas y metadatos ISO 19115
```

La ejecución utiliza `assets/css/`, `assets/js/` y `assets/data/`.

## `index.html`

Es el único punto de entrada publicado. Define la estructura
visual del visor: encabezado, mapa, panel lateral, selector de capas,
controles, dashboard, modales, panel de análisis espacial, carga de archivos,
metadatos, FAQ, tour y asistente Balam.

Carga desde CDN Leaflet, Leaflet Draw, Chart.js, html2canvas, jsPDF, shpjs,
Leaflet Browser Print, Turf.js y dom-to-image-more. Después carga los estilos
de `assets/css/` y los scripts clásicos de `assets/js/` (con parámetro
anti-caché `?v=`); finalmente carga `assets/js/main.js` como módulo ES.

## JavaScript activo (`assets/js/`)

| Archivo | Función |
|---|---|
| `anti_fouc.js` | Aplica el tema guardado antes de pintar la interfaz para evitar el destello de estilos durante la carga. |
| `app.js` | Inicializa la aplicación, conecta los controles principales y coordina el mapa, panel, capas, dashboard y estado general. |
| `clipboard.js` | Copia texto y resultados al portapapeles, con retroalimentación visual para el usuario. |
| `config.js` | Única fuente de configuración: GeoServer, workspace `SIG-DES`, las 12 capas conocidas, nombres especiales y URLs nacionales de descarga. |
| `dashboard.js` | Calcula y actualiza KPIs, tablas, gráficas, periodos, áreas y conteos; ajusta el contenido al espacio disponible. |
| `disclaimer.js` | Gestiona el aviso inicial y la información de uso responsable del geovisor y del asistente. |
| `globals.js` | Mantiene el estado compartido: capas activas, features cargadas, filtros, tema, gráficas, paginación y filtros del dashboard. |
| `helpers.js` | Reúne utilidades comunes para nombres, valores, fechas, superficies, colores, HTML seguro y actualización de controles. |
| `init_tema.js` | Inicializa comportamiento responsivo, ayudas de scroll, tema y flujo de impresión institucional. |
| `labels.js` | Crea etiquetas avanzadas por capa usando de uno a tres atributos, con tipografía, color, tamaño, desplazamiento y recuadro. |
| `legend.js` | Construye y actualiza la leyenda, símbolos, colores, visibilidad y controles de cada capa activa. |
| `main.js` | Punto de entrada modular. Importa `config.js`, verifica el entorno y publica el reporte de aplicación, servidor, capas y protocolo. |
| `main_load.js` | Carga capas WFS, arma filtros por atributo y valores únicos, ejecuta búsquedas, análisis de intersecciones y reportes CSV sobre el mapa. |
| `map.js` | Crea el mapa Leaflet, mapas base Esri, OSM Humanitario y OpenTopoMap, sombreado territorial, controles de impresión, exportación de vista y generación de PDF. |
| `mapeo_propietario.js` | Traduce y normaliza atributos de propiedad, categorías y campos usados en las fichas y consultas del visor. |
| `metadata.js` | Lee los JSON/XML de `assets/data/metadata/`, muestra fichas ISO 19115 con minimapa del extent y genera el PDF de la ficha (imagen real del extent, sin botones). |
| `modal.js` | Abre, cierra y coordina modales, overlays, confirmaciones y contenido ampliado de la interfaz. |
| `panel_mobile.js` | Controla apertura, cierre, overlay y redimensionamiento del panel lateral en teléfonos y pantallas estrechas. |
| `popup.js` | Genera popups de elementos WFS con atributos ordenados para ANP, ADVC y capas genéricas. |
| `tabs.js` | Gestiona las pestañas y vistas del panel, incluyendo capas, dashboard, análisis, información y herramientas. |
| `user_upload.js` | Importa GeoJSON, KML y SHP comprimidos en ZIP como capas temporales para visualización y análisis. |
| `features.js` | Implementa bienvenida, tour guiado, FAQ y asistente Balam: consultas y zoom a ANP, gráficas en el chat, navegación por secciones, apertura de decretos/fichas/SHP y voz (dictado + lectura). |
| `wfs.js` | Construye solicitudes WFS, obtiene GeoJSON, consulta atributos, maneja paginación y normaliza respuestas del GeoServer. |

### Flujo de carga

1. `index.html` carga `config.js` como script clásico para que las
   constantes estén disponibles en `window`.
2. Se cargan los módulos clásicos de mapa, panel, capas, dashboard y
   herramientas.
3. `main.js` importa la configuración como módulo ES, publica el estado y
   confirma el entorno de ejecución.
4. `main_load.js` solicita las capas WFS cuando el usuario las activa.
5. `metadata.js` consulta los archivos locales de `assets/data/metadata/`
   cuando se solicitan los metadatos de una capa.

## CSS activo (`assets/css/`)

| Archivo | Función |
|---|---|
| `app.css` | Hoja principal que integra estilos base, componentes y reglas generales de la aplicación. |
| `design_tokens.css` | Variables de diseño: colores institucionales, tipografías, espaciados, bordes, sombras y estados. |
| `layout.css` | Distribución general de encabezado, mapa, panel, áreas de trabajo y zonas responsivas. |
| `header.css` | Encabezado, identidad visual, navegación, botones superiores y estado del sistema. |
| `panel.css` | Panel lateral, secciones, controles de capas, formularios y contenido de herramientas. |
| `panel_overlay_responsive.css` | Overlay, transiciones y comportamiento del panel en dispositivos móviles. |
| `map.css` | Contenedor del mapa, controles, estados de carga y elementos superpuestos. |
| `map_controls_leaflet_overrides.css` | Ajustes visuales para controles, zoom, capas y componentes Leaflet. |
| `buttons.css` | Botones, variantes, iconos, estados activos, hover y acciones de descarga. |
| `coordinates.css` | Indicador y controles de coordenadas del cursor y de la vista. |
| `dashboard.css` | KPIs, tarjetas, gráficas, tablas, filtros y vista ampliada del dashboard. |
| `legend.css` | Leyenda de capas, símbolos, grupos, opacidad y estados de visibilidad. |
| `labels.css` | Editor y presentación de etiquetas cartográficas. |
| `popups.css` | Encabezados, atributos, valores y acciones de los popups de elementos. |
| `modal.css` | Diálogos, overlays, ventanas de información y contenidos descargables. |
| `metadata.css` | Fichas de metadatos, tarjetas ISO 19115, minimapa y acciones de exportación. |
| `an_lisis_espacial_selector_en_panel.css` | Selector, formulario, resultados y tabla del análisis espacial. |
| `filtros_en_cascada_junto_a_imprimir_dashboard.css` | Filtros en cascada, controles de impresión y ajustes específicos del dashboard. |
| `cerrar_graficas_barra_lateral_restaurar.css` | Cierre, restauración y estados compactos de gráficas en la barra lateral. |
| `mejoras_m_vil_scroll_hint_y_dashboard_optimizado_agregado_m.css` | Mejoras para scroll, lectura y distribución del dashboard en móvil. |
| `tema_claro_override_de_tokens_v_a_html_data_theme_light_el_m.css` | Sobrescrituras de los tokens para el tema claro. |

## Datos (`assets/data/`)

### Catálogos y descargas

| Archivo | Función |
|---|---|
| `sig_map.json` | Catálogo de enlaces y recursos del SIG CONANP. |
| `simec_map.json` | Catálogo de enlaces y recursos del SIMEC, fichas y documentos relacionados. |
| `descargas_232_anp_sig.csv` | Registro de descargas nacionales de las 232 ANP. |
| `descargas_simec_fichas.csv` | Registro de fichas y enlaces de descarga asociados al SIMEC. |

### Metadatos ISO 19115

Cada capa tiene un par JSON/XML. El JSON se usa para mostrar la ficha
estructurada y el XML para la descarga interoperable:

| Capa | Archivos |
|---|---|
| Límites estatales | `shp_00ent.json`, `shp_00ent.xml` |
| Límites municipales | `shp_00mun.json`, `shp_00mun.xml` |
| ADVC | `shp_advc.json`, `shp_advc.xml` |
| ANP | `shp_anp.json`, `shp_anp.xml` |
| KBA México | `shp_kba_mex.json`, `shp_kba_mex.xml` |
| Sitios Ramsar | `shp_ramsar.json`, `shp_ramsar.xml` |
| Sitios Ramsar de México | `shp_ramsar_mex.json`, `shp_ramsar_mex.xml` |
| Regiones CONANP | `shp_reg_conanp.json`, `shp_reg_conanp.xml` |
| Regiones CONANP de México | `shp_reg_conanp_mex.json`, `shp_reg_conanp_mex.xml` |
| UNESCO MaB | `shp_unescomab_mex.json`, `shp_unescomab_mex.xml` |
| UNESCO Patrimonio | `shp_unescopatrimonio_mex.json`, `shp_unescopatrimonio_mex.xml` |
| Zonas de protección de ANP | `shp_zp_anp_mex.json`, `shp_zp_anp_mex.xml` |

## Capas WFS disponibles

La configuración activa conoce estas 12 capas del workspace `SIG-DES`:

`shp_anp`, `shp_advc`, `shp_kba_mex`, `shp_ramsar`, `shp_ramsar_mex`,
`shp_reg_conanp`, `shp_reg_conanp_mex`, `shp_unescomab_mex`,
`shp_unescopatrimonio_mex`, `shp_zp_anp_mex`, `shp_00ent` y `shp_00mun`.

El visor permite elegir mapa base, activar capas, consultar elementos,
buscar por nombre, filtrar atributos y ajustar opacidad. Los elementos
seleccionados muestran información contextual, superficies, fechas,
categorías y enlaces institucionales cuando esos atributos están disponibles.

## Funciones incluidas

- **Mapa interactivo:** navegación, zoom, coordenadas, mapas base Esri, OSM
  Humanitario y OpenTopoMap, sombreado territorial y selección de elementos.
- **Capas WFS:** consulta remota de las 12 capas institucionales, conversión
  de respuestas a GeoJSON, estilos por capa y actualización de leyenda.
- **Búsqueda:** localización por nombre o atributo y zoom automático a la
  geometría encontrada.
- **Filtros por capa:** selección de atributos y valores únicos sin ocultar
  las demás herramientas del visor.
- **Carga local:** incorporación temporal de GeoJSON, KML y SHP en ZIP para
  comparar información propia con las capas institucionales.
- **Análisis espacial:** intersección entre capas, traslapes ANP/ADVC/regiones,
  superficies resultantes, desglose de resultados y exportación CSV.
- **Dashboard:** indicadores, conteos, superficies, gráficas por categoría,
  estado, propiedad y periodo, además de tablas paginadas y filtros cruzados.
- **Etiquetas:** composición de textos con atributos, configuración visual y
  control de anti-traslape para las capas activas.
- **Impresión:** selección de área, composición institucional, escala, norte,
  fuentes, leyenda y generación de PDF o imagen. El mapa se recompone píxel
  por píxel desde el estado real (captura nativa a doble resolución) y las
  gráficas conservan su aspecto.
- **Metadatos:** ficha por capa, extensión geográfica, referencia ISO 19115 y
  descarga de JSON/XML/PDF. El PDF incluye la imagen real del extent
  (OSM Humanitario en extensiones grandes, gris institucional en detalle).
- **Simbología minimizable:** la leyenda del mapa y la tarjeta de simbología
  del dashboard se pueden colapsar y mostrar a demanda.
- **Interfaz responsiva:** panel móvil, tema claro/oscuro, adaptación de KPIs,
  scroll guiado y restauración de gráficas.
- **Bienvenida y ayuda:** bienvenida, recorrido de siete pasos, preguntas frecuentes y
  asistente Balam (solo asistente virtual): responde con datos del sistema,
  muestra gráficas en el chat, lleva a secciones (mapa, Dashboard), abre
  decretos PDF, fichas SIMEC, SHP/KML y subzonificación, y opera por voz
  (dictado por micrófono y lectura con selector de voz en español).

## Dependencias externas

Las dependencias de terceros no están almacenadas en el repositorio. Se
cargan desde CDN en `index.html`:

- Leaflet 1.9.4 y Leaflet Draw 1.0.4.
- Chart.js 4.4.0.
- html2canvas 1.4.1 y dom-to-image-more 3.1.0.
- jsPDF 2.5.1.
- shpjs 4.0.0.
- Leaflet Browser Print 2.0.2.
- Turf.js 6.
- Font Awesome 6.5.0 y fuentes Google Fonts.

Para producción se necesita conectividad hacia estos CDN, hacia los mapas base
y hacia el GeoServer configurado.

## Publicación

Publicar la raíz manteniendo exactamente:

```text
index.html
assets/
```

No se requiere una herramienta de compilación para ejecutar la aplicación
publicada. El servidor debe entregar los archivos estáticos y permitir las
solicitudes HTTPS al GeoServer. Se recomienda habilitar compresión HTTP y
mantener sensibles a mayúsculas/minúsculas las rutas de `assets/`.
Los scripts locales llevan parámetro anti-caché (`?v=`); tras publicar
cambios, recargar con Ctrl+F5. La voz del asistente (micrófono y lectura)
requiere HTTPS y permiso del navegador.

