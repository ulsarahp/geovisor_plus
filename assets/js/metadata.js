let metadataMinimap = null;

function initMetadataMinimap(bbox, table){

  try{

    const container = document.getElementById('metadata-minimap');

    if(!container) return;

    const w0=Number(bbox[0]), s0=Number(bbox[1]), e0=Number(bbox[2]), n0=Number(bbox[3]);
    const west=isFinite(w0)?w0:-118.37, south=isFinite(s0)?s0:14.53, east=isFinite(e0)?e0:-86.71, north=isFinite(n0)?n0:32.72;

    const bounds = L.latLngBounds([south, west],[north, east]);

    if(metadataMinimap){ try{metadataMinimap.remove();}catch(e){} metadataMinimap=null; container.innerHTML=''; }

    metadataMinimap = L.map('metadata-minimap',{zoomControl:false,attributionControl:false,dragging:true,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,maxZoom:16}).fitBounds(bounds,{padding:[10,10]});

    // Fondo según escala del extent: country's (muy pequeña escala) -> OSM con referencias;
    // detalle (escala grande) -> gris institucional con el bbox de la capa.
    var spanLon = Math.abs(east-west), spanLat = Math.abs(north-south);
    if(Math.max(spanLon,spanLat) > 12){
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{maxZoom:19,subdomains:'abc',attribution:'© OSM Humanitario (HOT)',crossOrigin:true}).addTo(metadataMinimap);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,attribution:'© Esri, HERE, Garmin, OpenStreetMap',crossOrigin:true}).addTo(metadataMinimap);
    }

    try{

      let added=false;

      if(table && typeof activeLayers!=='undefined' && activeLayers[table] && activeLayers[table].layer){

        try{

          const gj = activeLayers[table].layer.toGeoJSON();

          const feats=(gj.features||[]).slice(0,400);

          if(feats.length){ L.geoJSON({type:'FeatureCollection',features:feats},{style:{color:'#1a5c4e',weight:1.5,fillColor:'#1a5c4e',fillOpacity:0.35}}).addTo(metadataMinimap); added=true; }

        }catch(e){}

      }

      if(!added){ L.rectangle(bounds,{color:'#1a5c4e',weight:2,fillOpacity:0.12}).addTo(metadataMinimap); }

    }catch(e){ L.rectangle(bounds,{color:'#1a5c4e',weight:2}).addTo(metadataMinimap); }

    try{

      const cap=document.getElementById('metadata-bbox-mini');

      if(cap) cap.textContent=`W ${Number(west).toFixed(2)} E ${Number(east).toFixed(2)} · S ${Number(south).toFixed(2)} N ${Number(north).toFixed(2)}`;

    }catch(e){}

    setTimeout(()=>{try{metadataMinimap.invalidateSize();metadataMinimap.fitBounds(bounds,{padding:[10,10]});}catch(e){}},200);

  }catch(e){ console.warn('minimap',e); }

}

let currentMetadataTable=null;

let currentMetadataData=null;

const metadataOverlay=document.getElementById('metadata-overlay');

const metadataClose=document.getElementById('metadata-close');

const metadataTitle=document.getElementById('metadata-title');

const metadataSubtitle=document.getElementById('metadata-subtitle');

const metadataContent=document.getElementById('metadata-content');

const metadataDownloadJson=document.getElementById('metadata-download-json');

const metadataDownloadXml=document.getElementById('metadata-download-xml');

const EMBEDDED_METADATA = {"shp_anp": {"fileIdentifier": "CONANP-SIG-DES-shp_anp-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "Geógrafo Christian Lomelín Molina", "org": "Comisión Nacional de Áreas Naturales Protegidas", "organisationName": "Comisión Nacional de Áreas Naturales Protegidas", "email": "sig@conanp.gob.mx", "contactInfo": {"email": "sig@conanp.gob.mx", "role": "pointOfContact"}, "address": "Ejército Nacional No. 223 Piso 12, Col Anáhuac I Secc., Miguel Hidalgo, CDMX 11320"}, "dateStamp": "2025-12-17", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08 época 2010.0, elipsoide GRS80 (6378137.0, 298.25723)"}, "identificationInfo": {"citation": {"title": "Información Geoespacial de las Áreas Naturales Protegidas", "alternateTitle": "ANP Federales — CONANP 2023 (232 ANP, ITRF08)", "date": "2023-12-29", "dateType": "publication", "edition": "2026", "identifier": "shp_anp"}, "abstract": "Polígonos generales de la descripción limítrofe del Artículo Primero de cada decreto de creación de las ANP federales (185 en metadato base, 232 vigentes a 2024: RB, PN, MN, APRN, APFF, SANT según Art. 46 LGEEPA). Atributos: NOMBRE, CAT_DEC, CAT_MAN, ESTADOS, MUNICIPIOS, REGION, SUPERFICIE, S_TERRES, S_MARINA, PRIM_DEC, ULT_DOF, PCM1, SINAP. Archivo SHAPE_ANPS.zip.", "purpose": "Dar a conocer a Unidades de Estado, Poder Judicial, Gobiernos (3 niveles), investigación, educación y público la ubicación y delimitación de ANP federales para material educativo, investigación, restauración y planeación territorial y urbana.", "credit": "Comisión Nacional de Áreas Naturales Protegidas", "status": "onGoing", "pointOfContact": "Geógrafo Christian Lomelín Molina", "keywords": ["Áreas Naturales Protegidas", "ANP", "CONANP", "RB", "PN", "MN", "APRN", "APFF", "SANT", "LGEEPA", "1917-2024", "SINAP"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.634376, "eastBoundLongitude": -85.397232, "southBoundLatitude": 11.968599, "northBoundLatitude": 32.483333}, "west": -118.634376, "east": -85.397232, "south": 11.968599, "north": 32.483333, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:250000.", "scale": "1:250000", "format": "ESRI Shapefile (SHP) + KML", "access": "Público", "use": "CC BY 4.0 — Citar CONANP. Uso informativo, no dictamen.", "url": "http://sig.conanp.gob.mx/website/pagsig/", "download": "https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Vértices de cuadros de construcción del Artículo Primero (DOF) capturados en Excel y ArcGIS/QGIS desde 2000. Validación geométrica posicional y topológica ISO 19157:2013 por Cartografía Digital (sept. 2022). Fuentes: cartas 1:250000 y 1:50000 INEGI, MDE 1.5 m, núcleos agrarios RAN."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile (SHP) + KML", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "http://sig.conanp.gob.mx/website/pagsig/", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://sig.conanp.gob.mx/container/descargas/files/shape/232-ANP_ITRF08_19162026.zip", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "CC BY 4.0 — Citar CONANP. Uso informativo, no dictamen.", "accessConstraints": "Público", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Anualmente"}, "bbox": [-118.634376, 11.968599, -85.397232, 32.483333]}, "shp_advc": {"fileIdentifier": "CONANP-SIG-DES-shp_advc-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "Dirección de Áreas Voluntarias", "org": "Comisión Nacional de Áreas Naturales Protegidas", "organisationName": "Comisión Nacional de Áreas Naturales Protegidas", "email": "advc@conanp.gob.mx", "contactInfo": {"email": "advc@conanp.gob.mx", "role": "pointOfContact"}, "address": "Ejército Nacional 223, CDMX"}, "dateStamp": "2026-06-15", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08, GRS80"}, "identificationInfo": {"citation": {"title": "Áreas Destinadas Voluntariamente a la Conservación Vigentes", "alternateTitle": "ADVC Vigentes — CONANP Junio 2026 (623)", "date": "2026-06-15", "dateType": "publication", "edition": "2026", "identifier": "shp_advc"}, "abstract": "623 ADVC certificadas vigentes a junio 2026. Conservación voluntaria de ejidos, comunidades, privados y gobiernos. Atributos: superficie certificada, tipo propiedad (Social/Privada/Pública), superficie sin traslape con ANP. Escala 1:50000–1:250000.", "purpose": "Difundir esfuerzo voluntario y evaluar conectividad y superficie bajo conservación voluntaria.", "credit": "Comisión Nacional de Áreas Naturales Protegidas", "status": "onGoing", "pointOfContact": "Dirección de Áreas Voluntarias", "keywords": ["ADVC", "Conservación Voluntaria", "Propiedad Social", "Propiedad Privada", "CONANP"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.5, "eastBoundLongitude": -86.0, "southBoundLatitude": 14.3, "northBoundLatitude": 32.5}, "west": -118.5, "east": -86.0, "south": 14.3, "north": 32.5, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:50000.", "scale": "1:50000", "format": "ESRI Shapefile + KML", "access": "Público", "use": "CC BY 4.0 — Citar CONANP y propietario.", "url": "https://sig.conanp.gob.mx/", "download": "https://sig.conanp.gob.mx/container/descargas/files/shape/623_ADVC_VIGENTES_JUNIO_2026.zip"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Certificación a solicitud, validación CONANP, cálculo supCertSinTraslape para evitar doble conteo con ANP."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile + KML", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "https://sig.conanp.gob.mx/", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://sig.conanp.gob.mx/container/descargas/files/shape/623_ADVC_VIGENTES_JUNIO_2026.zip", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "CC BY 4.0 — Citar CONANP y propietario.", "accessConstraints": "Público", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Anualmente"}, "bbox": [-118.5, 14.3, -86.0, 32.5]}, "shp_reg_conanp": {"fileIdentifier": "CONANP-SIG-DES-shp_reg_conanp-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "CONANP — SIG-DES", "org": "Comisión Nacional de Áreas Naturales Protegidas", "organisationName": "Comisión Nacional de Áreas Naturales Protegidas", "email": "sig@conanp.gob.mx", "contactInfo": {"email": "sig@conanp.gob.mx", "role": "pointOfContact"}, "address": "Ejército Nacional 223, CDMX"}, "dateStamp": "2026-06-15", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08, GRS80"}, "identificationInfo": {"citation": {"title": "Regionalización CONANP — Límites de Regiones", "alternateTitle": "Regiones CONANP 2017 (9 regiones)", "date": "2017-05-22", "dateType": "publication", "edition": "2026", "identifier": "shp_reg_conanp"}, "abstract": "Líneas que delimitan las 9 Direcciones Regionales CONANP para gestión de ANP (Acuerdo DOF 20-jul-2007, mod. 22-may-2017). Escala 1:1000000.", "purpose": "Gestión administrativa.", "credit": "Comisión Nacional de Áreas Naturales Protegidas", "status": "completed", "pointOfContact": "CONANP — SIG-DES", "keywords": ["Regionalización", "CONANP", "Regiones", "Direcciones Regionales"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.5, "eastBoundLongitude": -86.0, "southBoundLatitude": 14.5, "northBoundLatitude": 32.7}, "west": -118.5, "east": -86.0, "south": 14.5, "north": 32.7, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:1000000.", "scale": "1:1000000", "format": "ESRI Shapefile (líneas)", "access": "Público", "use": "Oficial CONANP.", "url": "https://sig.conanp.gob.mx/", "download": "https://sig.conanp.gob.mx/container/descargas/files/shape/Regionalizacion_22052017.zip"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Acuerdo de regionalización DOF 2007 y modificación 2017."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile (líneas)", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "https://sig.conanp.gob.mx/", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://sig.conanp.gob.mx/container/descargas/files/shape/Regionalizacion_22052017.zip", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "Oficial CONANP.", "accessConstraints": "Público", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Según acuerdo"}, "bbox": [-118.5, 14.5, -86.0, 32.7]}, "shp_reg_conanp_mex": {"fileIdentifier": "CONANP-SIG-DES-shp_reg_conanp_mex-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "CONANP", "org": "Comisión Nacional de Áreas Naturales Protegidas", "organisationName": "Comisión Nacional de Áreas Naturales Protegidas", "email": "sig@conanp.gob.mx", "contactInfo": {"email": "sig@conanp.gob.mx", "role": "pointOfContact"}, "address": "Ejército Nacional 223, CDMX"}, "dateStamp": "2026-06-15", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08"}, "identificationInfo": {"citation": {"title": "Regionalización CONANP Nacional", "alternateTitle": "Regiones CONANP Nacional", "date": "2017-05-22", "dateType": "publication", "edition": "2026", "identifier": "shp_reg_conanp_mex"}, "abstract": "Versión nacional de regionalización CONANP para referencia.", "purpose": "Referencia administrativa.", "credit": "Comisión Nacional de Áreas Naturales Protegidas", "status": "completed", "pointOfContact": "CONANP", "keywords": ["Regionalización", "CONANP"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.5, "eastBoundLongitude": -86.0, "southBoundLatitude": 14.5, "northBoundLatitude": 32.7}, "west": -118.5, "east": -86.0, "south": 14.5, "north": 32.7, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:1000000.", "scale": "1:1000000", "format": "ESRI Shapefile", "access": "Público", "use": "Oficial.", "url": "https://sig.conanp.gob.mx/", "download": "https://sig.conanp.gob.mx/container/descargas/files/shape/Regionalizacion_22052017.zip"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Derivado de regionalización oficial."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "https://sig.conanp.gob.mx/", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://sig.conanp.gob.mx/container/descargas/files/shape/Regionalizacion_22052017.zip", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "Oficial.", "accessConstraints": "Público", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Según acuerdo"}, "bbox": [-118.5, 14.5, -86.0, 32.7]}, "shp_zp_anp_mex": {"fileIdentifier": "CONANP-SIG-DES-shp_zp_anp_mex-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "CONANP", "org": "Comisión Nacional de Áreas Naturales Protegidas", "organisationName": "Comisión Nacional de Áreas Naturales Protegidas", "email": "sig@conanp.gob.mx", "contactInfo": {"email": "sig@conanp.gob.mx", "role": "pointOfContact"}, "address": "Ejército Nacional 223, CDMX"}, "dateStamp": "2026-06-15", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08"}, "identificationInfo": {"citation": {"title": "Zonificación Primaria de ANP — Zonas Núcleo", "alternateTitle": "Zonas Núcleo ANP 2025", "date": "2025-10-15", "dateType": "publication", "edition": "2026", "identifier": "shp_zp_anp_mex"}, "abstract": "Zonificación primaria de ANP con énfasis en Zonas Núcleo. Octubre 2025. Subconjuntos Sub_<ANP>.zip por ANP con programa de manejo.", "purpose": "Manejo interno y zonificación.", "credit": "Comisión Nacional de Áreas Naturales Protegidas", "status": "onGoing", "pointOfContact": "CONANP", "keywords": ["Zonificación", "Zonas Núcleo", "ANP"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.5, "eastBoundLongitude": -86.0, "southBoundLatitude": 14.5, "northBoundLatitude": 32.5}, "west": -118.5, "east": -86.0, "south": 14.5, "north": 32.5, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:50000.", "scale": "1:50000", "format": "ESRI Shapefile", "access": "Público", "use": "Oficial CONANP.", "url": "https://sig.conanp.gob.mx/", "download": "https://sig.conanp.gob.mx/container/descargas/files/shape/SHAPE_ANPS_ZN.zip"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Derivado de programas de manejo y decretos."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "https://sig.conanp.gob.mx/", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://sig.conanp.gob.mx/container/descargas/files/shape/SHAPE_ANPS_ZN.zip", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "Oficial CONANP.", "accessConstraints": "Público", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Según programa de manejo"}, "bbox": [-118.5, 14.5, -86.0, 32.5]}, "shp_00ent": {"fileIdentifier": "CONANP-SIG-DES-shp_00ent-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "Mtro. J. Armando Aguiar Rodríguez", "org": "Instituto Nacional de Estadística y Geografía — INEGI", "organisationName": "Instituto Nacional de Estadística y Geografía — INEGI", "email": "atencion.usuarios@inegi.org.mx", "contactInfo": {"email": "atencion.usuarios@inegi.org.mx", "role": "pointOfContact"}, "address": "Av. Héroe de Nacozari Sur 2301, Aguascalientes, 20276"}, "dateStamp": "2025-10-21", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08 época 2010.0, Cónica Conforme de Lambert (par. 17.5/29.5, m.c. -102)"}, "identificationInfo": {"citation": {"title": "Marco Geoestadístico Integrado — Límite Estatal (AGEE)", "alternateTitle": "Estados INEGI 2025 (32 AGEE)", "date": "2025-07-31", "dateType": "publication", "edition": "2026", "identifier": "shp_00ent"}, "abstract": "Límite estatal del MGI 2025, INEGI (32 AGEE). Representación para referencia geográfica de censos y encuestas. No es fuente oficial de división político-administrativa. Claves 01 Aguascalientes a 32 Zacatecas.", "purpose": "Contexto geográfico de referencia para censos, planeación y control de cobertura.", "credit": "Instituto Nacional de Estadística y Geografía — INEGI", "status": "completed", "pointOfContact": "Mtro. J. Armando Aguiar Rodríguez", "keywords": ["Límite Estatal", "INEGI", "Marco Geoestadístico", "AGEE", "Referencia"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.365, "eastBoundLongitude": -86.71, "southBoundLatitude": 14.535, "northBoundLatitude": 32.718}, "west": -118.365, "east": -86.71, "south": 14.535, "north": 32.718, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:250000.", "scale": "1:250000", "format": "ESRI Shapefile (líneas/polígonos)", "access": "Público vía INEGI — Libre Uso", "use": "Términos Libre Uso INEGI. No usar como límite oficial.", "url": "https://www.inegi.org.mx/temas/mg/#descargas", "download": "https://www.inegi.org.mx/temas/mg/#descargas"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Compilación e integración de actualizaciones cartográficas 2024-2025, verificación topológica (tolerancia 1 m) y validación contra catálogo único AGEE/AGEM."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile (líneas/polígonos)", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "https://www.inegi.org.mx/temas/mg/#descargas", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://www.inegi.org.mx/temas/mg/#descargas", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "Términos Libre Uso INEGI. No usar como límite oficial.", "accessConstraints": "Público vía INEGI — Libre Uso", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Anualmente"}, "bbox": [-118.365, 14.535, -86.71, 32.718]}, "shp_00mun": {"fileIdentifier": "CONANP-SIG-DES-shp_00mun-202606", "language": "spa", "characterSet": "utf8", "hierarchyLevel": "dataset", "hierarchyLevelName": "Conjunto de datos geoespaciales", "contact": {"name": "Mtro. J. Armando Aguiar Rodríguez", "org": "Instituto Nacional de Estadística y Geografía — INEGI", "organisationName": "Instituto Nacional de Estadística y Geografía — INEGI", "email": "atencion.usuarios@inegi.org.mx", "contactInfo": {"email": "atencion.usuarios@inegi.org.mx", "role": "pointOfContact"}, "address": "Av. Héroe de Nacozari Sur 2301, Aguascalientes"}, "dateStamp": "2025-10-21", "metadataStandardName": "ISO 19115:2003 - Geographic Information - Metadata", "metadataStandardVersion": "ISO 19115:2003/Cor.1:2006", "referenceSystemInfo": {"code": "EPSG:4326", "codeSpace": "EPSG", "version": "WGS 84", "datum": "ITRF08"}, "identificationInfo": {"citation": {"title": "Marco Geoestadístico Integrado — Límite Municipal (AGEM)", "alternateTitle": "Municipios INEGI 2025 (2478 AGEM)", "date": "2025-07-31", "dateType": "publication", "edition": "2026", "identifier": "shp_00mun"}, "abstract": "Límite municipal del MGI 2025 (2478 AGEM + demarcaciones CDMX). Claves CVE_ENT/CVE_MUN/CVE_LOC, NOMGEO. Referencia, no oficial político-administrativa.", "purpose": "Contexto municipal de referencia.", "credit": "Instituto Nacional de Estadística y Geografía — INEGI", "status": "completed", "pointOfContact": "Mtro. J. Armando Aguiar Rodríguez", "keywords": ["Límite Municipal", "AGEM", "INEGI", "Municipios"], "topicCategory": "environment", "spatialRepresentationType": "vector", "language": "spa", "extent": {"description": "República Mexicana", "geographicElement": {"westBoundLongitude": -118.365, "eastBoundLongitude": -86.71, "southBoundLatitude": 14.535, "northBoundLatitude": 32.718}, "west": -118.365, "east": -86.71, "south": 14.535, "north": 32.718, "temporalElement": {"begin": "1989-05-23", "end": "2026-06-15"}}, "supplementalInformation": "Escala 1:250000.", "scale": "1:250000", "format": "ESRI Shapefile", "access": "Público", "use": "Libre Uso INEGI.", "url": "https://www.inegi.org.mx/temas/mg/#descargas", "download": "https://www.inegi.org.mx/temas/mg/#descargas"}, "dataQualityInfo": {"scope": "dataset", "report": {"completeness": "Completo para territorio nacional a fecha publicación.", "positionalAccuracy": "98% vértices submétrica, tolerancia 1 m (sept. 2022). Validado con INEGI, imágenes satélite y GPS.", "attributeAccuracy": "Atributos validados CONANP."}, "lineage": {"statement": "Actualización permanente y recorridos de campo, validación SIVEC/SIGMA."}}, "spatialRepresentationInfo": {"topologyLevel": "geometryOnly", "geometricObjects": {"type": "Polygon"}}, "distributionInfo": {"distributionFormat": "ESRI Shapefile", "transferOptions": {"onLine": [{"protocol": "WWW:LINK", "name": "SIG CONANP", "url": "https://www.inegi.org.mx/temas/mg/#descargas", "description": "Geoportal"}, {"protocol": "WWW:DOWNLOAD", "name": "Descarga SHP", "url": "https://www.inegi.org.mx/temas/mg/#descargas", "description": "Descarga"}]}}, "metadataConstraints": {"useLimitation": "Libre Uso INEGI.", "accessConstraints": "Público", "useConstraints": "license"}, "maintenanceInfo": {"maintenanceAndUpdateFrequency": "Anualmente"}, "bbox": [-118.365, 14.535, -86.71, 32.718]}};

function getMetadataPaths(table){ return [`assets/data/metadata/${table}.json`]; }

async function fetchMetadata(table){

  const KNOWN=["shp_anp","shp_advc","shp_reg_conanp","shp_reg_conanp_mex","shp_zp_anp_mex","shp_00ent","shp_00mun"];

  const isKnown=KNOWN.includes(table);

  if(!isKnown){

    try{ if(window.generatedMetadata&&window.generatedMetadata[table]) return window.generatedMetadata[table]; }catch(e){}

    try{ const s=localStorage.getItem(`metadata_${table}`); if(s) return JSON.parse(s); }catch(e){}

  } else {

    try{ localStorage.removeItem(`metadata_${table}`); }catch(e){}

    if(window.generatedMetadata){ try{ delete window.generatedMetadata[table]; }catch(e){} }

  }

  try{ if(typeof EMBEDDED_METADATA!=='undefined' && EMBEDDED_METADATA[table]) return EMBEDDED_METADATA[table]; }catch(e){}
  const paths=getMetadataPaths(table);

  for(const p of paths){ try{ const r=await fetch(p); if(r.ok) return await r.json(); }catch(e){} }

  return null;

}

function renderMetadata(data, table){

  if(!data) return `<p style="color:var(--text-muted);text-align:center;padding:1rem;">Metadatos no disponibles para <b>${table}</b>. Consulta <a href="https://sig.conanp.gob.mx/" target="_blank">SIG CONANP</a>.</p>`;

  const id=data.identificationInfo||{};

  const cit=id.citation||{};

  const ext=id.extent||{};

  const geo=ext.geographicElement||{westBoundLongitude:ext.west,eastBoundLongitude:ext.east,southBoundLatitude:ext.south,northBoundLatitude:ext.north};

  const dist=data.distributionInfo||{};

  const onLine=(dist.transferOptions&&(dist.transferOptions.onLine||[]))||[];

  const dq=data.dataQualityInfo||{};

  const dqRep=(typeof dq.report==='string')?{completeness:dq.report,positionalAccuracy:dq.report}: (dq.report||{});

  const lineage=(typeof dq.lineage==='string')?dq.lineage:(dq.lineage?.statement||'-');

  const contactName=(data.contact&&(data.contact.organisationName||data.contact.org||data.contact.name))||id.pointOfContact||id.credit||'-';

  const metaId=data.fileIdentifier||table;

  const fmt=(dist.distributionFormat||dist.format||id.format||'Vector');

  const access=(data.metadataConstraints&&data.metadataConstraints.accessConstraints)||id.access||'Público';

  const useLim=(data.metadataConstraints&&data.metadataConstraints.useLimitation)||id.use||'-';

  const refCode=(data.referenceSystemInfo&&data.referenceSystemInfo.code)||'EPSG:4326';

  const refVer=(data.referenceSystemInfo&&(data.referenceSystemInfo.version||data.referenceSystemInfo.datum))||'WGS84 / ITRF08';

  const keywords=(id.keywords||[]);

  const desc=ext.description||'República Mexicana';

  const temp=ext.temporalElement?`${ext.temporalElement.begin} → ${ext.temporalElement.end}`:'-';

  return `

    <div class="metadata-hero">

      <div class="metadata-card">

        <h4><i class="fas fa-id-card"></i> Información General</h4>

        <div class="meta-row"><span class="meta-key">Título</span><span class="meta-val">${cit.title||table}</span></div>

        <div class="meta-row"><span class="meta-key">Título alt.</span><span class="meta-val">${cit.alternateTitle||'-'}</span></div>

        <div class="meta-row"><span class="meta-key">Identificador</span><span class="meta-val" style="font-family:monospace;font-size:0.62rem;">${metaId}</span></div>

        <div class="meta-row"><span class="meta-key">Fecha</span><span class="meta-val">${cit.date||data.dateStamp||'-'}</span></div>

        <div class="meta-row"><span class="meta-key">Idioma / Jerarquía</span><span class="meta-val">${data.language||'spa'} / ${data.hierarchyLevel||'dataset'}</span></div>

        <div class="meta-row"><span class="meta-key">Contacto</span><span class="meta-val">${contactName}</span></div>

        <div class="meta-row"><span class="meta-key">Formato / Escala</span><span class="meta-val">${fmt} / ${id.scale||'-'}</span></div>

      </div>

      <div class="metadata-minimap-wrap"><div id="metadata-minimap" class="metadata-minimap"></div><div class="metadata-minimap-caption"><span>Vista de la capa</span><span id="metadata-bbox-mini">-</span></div></div>

    </div>

    <div class="metadata-grid">

      <div class="metadata-card">

        <h4><i class="fas fa-globe"></i> Límites geográficos</h4>

        <div class="metadata-bbox">

          <div><span>Oeste</span><b>${geo.westBoundLongitude??'-'}</b></div>

          <div><span>Este</span><b>${geo.eastBoundLongitude??'-'}</b></div>

          <div><span>Norte</span><b>${geo.northBoundLatitude??'-'}</b></div>

          <div><span>Sur</span><b>${geo.southBoundLatitude??'-'}</b></div>

        </div>

        <div style="margin-top:0.6rem;font-size:0.68rem;color:var(--text-muted);">Extensión: ${desc}<br>Temporal: ${temp}</div>

        <div style="margin-top:0.5rem;font-size:0.68rem;color:var(--text-secondary);">Referencia: <b>${refCode} ${refVer}</b> · Representación: <b>${id.spatialRepresentationType||'vector'}</b></div>

      </div>

      <div class="metadata-card" style="border-left:3px solid #1a5c4e;">

        <h4><i class="fas fa-database"></i> Fuentes y descargas</h4>

        <p style="font-size:0.72rem;">${id.supplementalInformation||''}</p>

        <div style="margin-top:0.4rem;">
          ${onLine.map(o=>`<div style="font-size:0.7rem;margin:0.15rem 0;color:var(--text-secondary);">· <a href="${o.url}" target="_blank" rel="noopener" style="color:var(--brand-secondary);">${o.name}</a></div>`).join('')}
        </div>

        <p style="font-size:0.66rem;color:var(--text-muted);margin-top:0.4rem;">Acceso: ${access}<br>Uso: ${useLim}</p>

      </div>

    </div>

    <div class="metadata-section-title">Resumen</div>

    <div class="metadata-card"><p>${id.abstract||'-'}</p></div>

    <div class="metadata-section-title">Propósito</div>

    <div class="metadata-card"><p>${id.purpose||'-'}</p></div>

    <div class="metadata-card"><h4><i class="fas fa-tags"></i> Palabras clave & Categoría</h4><p><b>Tema:</b> ${id.topicCategory||'-'}</p><p style="margin-top:0.3rem;"><b>Palabras clave:</b> ${(keywords||[]).join(', ')||'-'}</p></div>

    <div class="metadata-section-title">Calidad de la información</div>

    <div class="metadata-grid">

      <div class="metadata-card"><h4><i class="fas fa-check-circle"></i> Completitud</h4><p>${dqRep.completeness||'-'}</p></div>

      <div class="metadata-card"><h4><i class="fas fa-bullseye"></i> Precisión posicional</h4><p>${dqRep.positionalAccuracy||dqRep||'-'}</p></div>

    </div>

    <div class="metadata-card"><h4><i class="fas fa-code-branch"></i> Linaje</h4><p>${lineage}</p></div>

    <div class="metadata-section-title">Sistema de referencia & Distribución</div>

    <div class="metadata-grid">

      <div class="metadata-card"><h4><i class="fas fa-map"></i> Referencia</h4><div class="meta-row"><span class="meta-key">Código</span><span class="meta-val">${refCode}</span></div><div class="meta-row"><span class="meta-key">Datum</span><span class="meta-val">${refVer}</span></div></div>

      <div class="metadata-card"><h4><i class="fas fa-box-open"></i> Distribución</h4><div class="meta-row"><span class="meta-key">Formato</span><span class="meta-val">${fmt}</span></div><div class="meta-row"><span class="meta-key">Acceso</span><span class="meta-val">${access}</span></div><div class="meta-row"><span class="meta-key">Uso</span><span class="meta-val">${useLim}</span></div></div>

    </div>

    <div style="font-size:0.62rem;color:var(--text-muted);text-align:center;margin-top:0.5rem;border-top:1px solid var(--border-subtle);padding-top:0.6rem;">Metadato: ${data.metadataStandardName||'ISO 19115:2003'} · Fecha: ${data.dateStamp||'-'} · Contacto: ${(data.contact&&(data.contact.contactInfo?.email||data.contact.email))||'-'}</div>

  `;

}

async function openMetadata(table){
  try{ table = String(table||'').trim(); }catch(e){ table=''; }
  var ov = document.getElementById('metadata-overlay');
  var tt = document.getElementById('metadata-title');
  var st = document.getElementById('metadata-subtitle');
  var ct = document.getElementById('metadata-content');
  if(!ov || !ct){
    console.warn('openMetadata sin DOM', table);
    alert('No se pudo abrir metadatos (interfaz no lista). Recarga con Ctrl+F5.');
    return;
  }
  if(!table || table.indexOf('$')!==-1){
    ct.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:1rem;">No se identificó la capa. Activa la capa <b>ANP</b> y pulsa su botón <b>i</b>. Si persiste, recarga con Ctrl+F5.</p>';
    ov.classList.add('active'); ov.style.display='flex'; ov.setAttribute('aria-hidden','false');
    try{ document.body.style.overflow='hidden'; }catch(e){}
    return;
  }
  currentMetadataTable=table;
  try{
    var nombre = table;
    try{ if(typeof getNombreAmigable!=='undefined' && getNombreAmigable) nombre=getNombreAmigable(table); }catch(e){}
    if(tt){
      // conservar el <small> del subtítulo si existe
      var small = tt.querySelector('small');
      tt.childNodes[0].textContent = nombre+' ';
      if(!small && st){ /* st separado */ }
    }
    if(st) st.textContent=table+' \u00b7 Metadato ISO 19115';
    ct.innerHTML='<p style="text-align:center;padding:2rem;color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Cargando metadato...</p>';
  }catch(e){}
  try{ ov.classList.add('active'); ov.style.display='flex'; ov.setAttribute('aria-hidden','false'); }catch(e){}
  try{ document.body.style.overflow='hidden'; }catch(e){}
  try{
    const data=await fetchMetadata(table);
    try{ currentMetadataData=data; }catch(e){}
    try{ ct.innerHTML=renderMetadata(data,table); }catch(e){}
    try{ if(data&&(data.bbox||(data.identificationInfo&&data.identificationInfo.extent))) { var ex=data.identificationInfo.extent; var b=data.bbox||[ex.west!==-1&&ex.west!==undefined?ex.west:(ex.geographicElement&&ex.geographicElement.westBoundLongitude), ex.south!==-1&&ex.south!==undefined?ex.south:(ex.geographicElement&&ex.geographicElement.southBoundLatitude), ex.east!==-1&&ex.east!==undefined?ex.east:(ex.geographicElement&&ex.geographicElement.eastBoundLongitude), ex.north!==-1&&ex.north!==undefined?ex.north:(ex.geographicElement&&ex.geographicElement.northBoundLatitude)]; initMetadataMinimap(b,table); } }catch(e){}
    try{ if(st) st.textContent=((data&&data.identificationInfo&&data.identificationInfo.citation&&data.identificationInfo.citation.alternateTitle)||table); }catch(e){}
  }catch(e){ try{ ct.innerHTML='<p style="color:var(--err);text-align:center;">Error: '+String((e&&e.message)||e)+'</p>'; }catch(e2){} }
}
function closeMetadata(){
  try{
    var ov=document.getElementById('metadata-overlay');
    if(ov){ ov.classList.remove('active'); ov.style.display='none'; ov.setAttribute('aria-hidden','true'); }
    document.body.style.overflow='';
    currentMetadataTable=null; currentMetadataData=null;
  }catch(e){}
}


document.getElementById('metadata-download-pdf')?.addEventListener('click', descargarMetadataPDF);



try{ document.getElementById('metadata-close')?.addEventListener('click', closeMetadata); }catch(e){}
try{
  var _mov = document.getElementById('metadata-overlay');
  if(_mov) _mov.addEventListener('click', function(e){ if(e.target===_mov) closeMetadata(); });
}catch(e){}
try{ document.addEventListener('keydown', function(e){ try{ var o=document.getElementById('metadata-overlay'); if(e.key==='Escape'&&o&&o.classList.contains('active')) closeMetadata(); }catch(e2){} }); }catch(e){}
try{
  var _dj = document.getElementById('metadata-download-json');
  if(_dj) _dj.addEventListener('click', function(){
    try{
      if(!currentMetadataData) return;
      var blob=new Blob([JSON.stringify(currentMetadataData,null,2)],{type:'application/json'});
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(currentMetadataTable||'capa')+'_metadato.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
    }catch(e){}
  });
}catch(e){}
try{
  var _dx = document.getElementById('metadata-download-xml');
  if(_dx) _dx.addEventListener('click', async function(){
    if(!currentMetadataTable) return;
    var cands=['assets/data/metadata/'+currentMetadataTable+'.xml'];
    for(var i=0;i<cands.length;i++){
      try{ var r=await fetch(cands[i]); if(r.ok){ var t=await r.text(); var b=new Blob([t],{type:'application/xml'}); var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=currentMetadataTable+'_metadato.xml'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href); return; } }catch(e){}
    }
    alert('XML no disponible, descargue JSON.');
  });
}catch(e){}
document.addEventListener('click', function(e){
  try{
    var btn = e.target && e.target.closest ? e.target.closest('.btn-info') : null;
    if(btn){
      var tbl = (btn.dataset && btn.dataset.table) || (btn.closest && btn.closest('.capa-item') && btn.closest('.capa-item').dataset ? btn.closest('.capa-item').dataset.table : null);
      if(!tbl || String(tbl).indexOf('$')!==-1){
        var item = btn.closest ? btn.closest('.capa-item') : null;
        if(item && item.dataset && item.dataset.table) tbl = item.dataset.table;
      }
      e.preventDefault(); e.stopPropagation();
      openMetadata(tbl);
    }
  }catch(e){}
});
try{ window.openMetadata=openMetadata; window.closeMetadata=closeMetadata; }catch(e){}


async function descargarMetadataPDF(){
  if(!currentMetadataData || !currentMetadataTable){ alert('No hay metadato cargado.'); return; }
  var loadingEl = document.getElementById('print-loading');
  if(loadingEl){ loadingEl.style.display='flex'; }
  try{
    var jspdfNs = window.jspdf || {};
    var jsPDF = jspdfNs.jsPDF;
    if(typeof jsPDF==='undefined') throw new Error('jsPDF no disponible. Recarga la pagina.');
    var data = currentMetadataData, table = currentMetadataTable;
    var cit = (data.identificationInfo && data.identificationInfo.citation) || {};
    var id = data.identificationInfo || {};
    var ext = id.extent || {};
    var geo = ext.geographicElement || {westBoundLongitude:ext.west, eastBoundLongitude:ext.east, southBoundLatitude:ext.south, northBoundLatitude:ext.north};
    var dist = data.distributionInfo || {};
    var onLine = (dist.transferOptions && (dist.transferOptions.onLine || [])) || [];
    var dq = data.dataQualityInfo || {};
    var dqRep = (typeof dq.report === 'string') ? {completeness:dq.report, positionalAccuracy:dq.report} : (dq.report || {});
    var lineageTxt = (typeof dq.lineage === 'string') ? dq.lineage : ((dq.lineage && dq.lineage.statement) || '-');
    var contactName = (data.contact && (data.contact.organisationName || data.contact.org || data.contact.name)) || id.pointOfContact || id.credit || '-';
    var metaId = data.fileIdentifier || table;
    var fmt = (dist.distributionFormat || dist.format || id.format || 'Vector');
    var access = (data.metadataConstraints && data.metadataConstraints.accessConstraints) || id.access || 'Publico';
    var useLim = (data.metadataConstraints && data.metadataConstraints.useLimitation) || id.use || '-';
    var refCode = (data.referenceSystemInfo && data.referenceSystemInfo.code) || 'EPSG:4326';
    var refVer = (data.referenceSystemInfo && (data.referenceSystemInfo.version || data.referenceSystemInfo.datum)) || 'WGS84 / ITRF08';
    var keywords = (id.keywords || []);
    var descTxt = ext.description || 'Republica Mexicana';
    var tempTxt = ext.temporalElement ? (ext.temporalElement.begin + ' a ' + ext.temporalElement.end) : '-';
    var spatialRep = id.spatialRepresentationType || 'vector';
    var scaleTxt = id.scale || '-';
    var language = data.language || 'spa';
    var hierarchyLevel = data.hierarchyLevel || 'dataset';
    var metadataStandard = data.metadataStandardName || 'ISO 19115:2003';
    var topicCategory = id.topicCategory || '-';
    var supplementalInfo = id.supplementalInformation || '';
    var contactEmail = (data.contact && (data.contact.contactInfo?.email || data.contact.email)) || '-';
    var titleTxt = cit.title || table;
    var altTitle = cit.alternateTitle || '-';
    var fechaTxt = cit.date || data.dateStamp || '-';

    function S(v){ v = (v===null||v===undefined) ? '-' : String(v); return v.replace(/\u2192/g,'a ').replace(/\u2014/g,'-').replace(/\u2013/g,'-').replace(/\u00b7/g,'-').replace(/[^\x20-\x7E\xA0-\xFF]/g,''); }
    titleTxt=S(titleTxt); altTitle=S(altTitle); fechaTxt=S(fechaTxt); contactName=S(contactName);
    metaId=S(metaId); fmt=S(fmt); access=S(access); useLim=S(useLim); refCode=S(refCode);
    refVer=S(refVer); descTxt=S(descTxt); tempTxt=S(tempTxt); spatialRep=S(spatialRep);
    scaleTxt=S(scaleTxt); topicCategory=S(topicCategory); supplementalInfo=S(supplementalInfo);
    lineageTxt=S(lineageTxt); contactEmail=S(contactEmail); metadataStandard=S(metadataStandard);
    var abstractTxt=S(id.abstract||'-'); var purposeTxt=S(id.purpose||'-');
    var compTxt=S(dqRep.completeness||'-');
    var precTxt=S(dqRep.positionalAccuracy|| (typeof dqRep==='string'?dqRep:'-') || '-');
    var westTxt=S(geo.westBoundLongitude ?? '-'); var eastTxt=S(geo.eastBoundLongitude ?? '-');
    var northTxt=S(geo.northBoundLatitude ?? '-'); var southTxt=S(geo.southBoundLatitude ?? '-');

    var doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
    var PW = doc.internal.pageSize.getWidth();
    var PH = doc.internal.pageSize.getHeight();
    var M = 10, CW = PW - 2*M;
    var y = 0, pageNum = 1;

    var C = {
      guinda:[107,17,50], verde:[26,92,78], marino:[15,42,58],
      cardFill:[247,249,248], cardBorder:[214,221,218], line:[229,231,235],
      txt:[30,30,30], mut:[110,114,120], pillBg:[26,92,78], badgeBg:[238,242,240]
    };

    function footer(){
      doc.setFontSize(6); doc.setTextColor(130,130,130); doc.setFont('helvetica','normal');
      doc.text('Geovisor CONANP - Ficha de metadatos ISO 19115  |  Pag. '+pageNum, M, PH-8);
      var f2 = ('Metadato: '+metadataStandard+' - Fecha: '+(data.dateStamp||'-')+' - Contacto: '+contactEmail).substring(0,130);
      doc.text(f2, M, PH-4.5);
    }
    function newPage(){
      footer();
      doc.addPage(); pageNum++; y = M;
    }
    function need(h){ if(y + h > PH - 14){ newPage(); } }

    // ===== HEADER tipo ficha (degradado difuminado guinda -> verde) =====
    (function header(){
      var HH = 30, STEPS = 80, gi;
      for(gi=0; gi<STEPS; gi++){
        var t = gi/(STEPS-1);
        var rr = Math.round(C.guinda[0]+(C.verde[0]-C.guinda[0])*t);
        var gg = Math.round(C.guinda[1]+(C.verde[1]-C.guinda[1])*t);
        var bb = Math.round(C.guinda[2]+(C.verde[2]-C.guinda[2])*t);
        doc.setFillColor(rr,gg,bb);
        doc.rect(gi*PW/STEPS, 0, PW/STEPS+0.4, HH, 'F');
      }
      try{
        doc.setFillColor(0,0,0); doc.setGState(doc.GState({opacity:0.18})); doc.rect(0,0,PW,7,'F');
        doc.setGState(doc.GState({opacity:1}));
      }catch(e){}
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
      doc.text('GEOVISOR CONANP - METADATOS GEOGRAFICOS - ISO 19115:2003', M, 4.5);
      doc.setFontSize(12); doc.setFont('helvetica','bold');
      var tLines = doc.splitTextToSize(titleTxt, CW-8);
      if(tLines.length>2) tLines=tLines.slice(0,2);
      doc.text(tLines, M, 13);
      y = 13 + tLines.length*5 + 1;
      doc.setFontSize(7); doc.setFont('helvetica','normal');
      doc.text(doc.splitTextToSize(altTitle, CW-8).slice(0,1), M, y); y+=4.5;
      doc.setFillColor(255,255,255);
      doc.text('ID: '+metaId.substring(0,70), M, y); y+=4;
      y = HH + 4;
    })();

    // ===== Helpers estilo tarjeta =====
    function cardTitle(t){
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text(t.toUpperCase(), 0, 0); // medida
      doc.text(t.toUpperCase(), arguments[1]||0, 0);
    }
    function drawCardFrame(x, yy, w, h, accentLeft){
      doc.setFillColor(C.cardFill[0],C.cardFill[1],C.cardFill[2]);
      doc.setDrawColor(C.cardBorder[0],C.cardBorder[1],C.cardBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, yy, w, h, 1.5, 1.5, 'FD');
      if(accentLeft){
        doc.setFillColor(C.verde[0],C.verde[1],C.verde[2]);
        doc.roundedRect(x, yy, 1.6, h, 0.6, 0.6, 'F');
      }
    }
    function sectionTitle(t){
      need(10);
      var sy = y;
      doc.setFillColor(C.verde[0],C.verde[1],C.verde[2]); doc.rect(M, sy, 1.2, 4.6, 'F');
      doc.setFillColor(C.guinda[0],C.guinda[1],C.guinda[2]); doc.rect(M, sy+2.3, 1.2, 2.3, 'F');
      doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(25,25,25);
      doc.text(t.toUpperCase(), M+3.5, sy+3.6);
      doc.setDrawColor(C.line[0],C.line[1],C.line[2]); doc.setLineWidth(0.25);
      var tw = doc.getTextWidth(t.toUpperCase())+6;
      doc.line(M+tw, sy+2.5, M+CW, sy+2.5);
      y = sy + 7;
    }
    function metaRowsBlock(x, w, rows, fs){
      // rows: [[k,v],...] -> devuelve altura y dibuja
      fs = fs||6.4;
      var pad = 2.5, innerW = w - pad*2;
      var keyW = innerW*0.38, valW = innerW*0.60;
      var yy = y + pad + 4.5;
      var heights = rows.map(function(r){
        var kl = doc.splitTextToSize(S(r[0]).toUpperCase(), keyW);
        var vl = doc.splitTextToSize(S(r[1]), valW);
        return Math.max(kl.length, vl.length)*(fs*0.52)+2.2;
      });
      var totalH = pad + 6 + heights.reduce(function(a,b){return a+b;},0) + pad;
      return {h:totalH, draw:function(bx, by, title){
        drawCardFrame(bx, by, w, totalH, false);
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
        doc.text(title.toUpperCase().substring(0,60), bx+pad, by+pad+3.2);
        var cy = by + pad + 5.5;
        rows.forEach(function(r, i){
          var kl = doc.splitTextToSize(S(r[0]).toUpperCase(), keyW);
          var vl = doc.splitTextToSize(S(r[1]), valW);
          var rh = heights[i];
          doc.setFontSize(fs-0.6); doc.setFont('helvetica','bold'); doc.setTextColor(C.mut[0],C.mut[1],C.mut[2]);
          doc.text(kl, bx+pad, cy+2.5);
          doc.setFontSize(fs); doc.setFont('helvetica','normal'); doc.setTextColor(C.txt[0],C.txt[1],C.txt[2]);
          // valor alineado a la derecha del bloque
          doc.text(vl, bx+pad+keyW+innerW*0.02, cy+2.5);
          cy += rh;
          if(i<rows.length-1){
            doc.setDrawColor(C.line[0],C.line[1],C.line[2]); doc.setLineWidth(0.2);
            doc.line(bx+pad, cy-1, bx+w-pad, cy-1);
          }
        });
      }};
    }
    function textCardBlock(w, title, body, fs){
      fs=fs||6.6;
      var pad=2.5, innerW=w-pad*2;
      var bl = doc.splitTextToSize(body, innerW);
      var h = pad + 6 + bl.length*(fs*0.52) + pad;
      return {h:h, lines:bl, draw:function(bx, by){
        drawCardFrame(bx, by, w, h, false);
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
        doc.text(title.toUpperCase().substring(0,60), bx+pad, by+pad+3.2);
        doc.setFontSize(fs); doc.setFont('helvetica','normal'); doc.setTextColor(55,55,55);
        doc.text(bl, bx+pad, by+pad+7.5);
      }};
    }

    // Imagen estática determinista del extent (matemática pura, sin depender del minimapa)
    async function imagenExtentEstatica(){
      try{
        var w0 = Number(geo?geo.westBoundLongitude:NaN), s0 = Number(geo?geo.southBoundLatitude:NaN);
        var e0 = Number(geo?geo.eastBoundLongitude:NaN), n0 = Number(geo?geo.northBoundLatitude:NaN);
        if(!(isFinite(w0)&&isFinite(s0)&&isFinite(e0)&&isFinite(n0)) || e0<=w0 || n0<=s0) return null;
        var span = Math.max(e0-w0, n0-s0);
        var baseHot = span > 12;
        var PXW = 640, PXH = 400;
        var TP = 256;
        function mercX(lon, z){ return (lon+180)/360*TP*Math.pow(2,z); }
        function mercY(lat, z){
          var r = lat*Math.PI/180;
          var m = Math.log(Math.tan(r) + 1/Math.cos(r));
          return (1 - m/Math.PI)/2*TP*Math.pow(2,z);
        }
        var z = 0, zi;
        for(zi=19; zi>=0; zi--){
          var ww = Math.abs(mercX(e0,zi)-mercX(w0,zi));
          var hh2 = Math.abs(mercY(s0,zi)-mercY(n0,zi));
          if(ww<=PXW*0.92 && hh2<=PXH*0.92){ z = zi; break; }
        }
        z = baseHot ? Math.min(z,18) : Math.min(z,15);
        var x0 = mercX(w0,z), x1 = mercX(e0,z);
        var yT = mercY(n0,z), yB2 = mercY(s0,z);
        var padX = (PXW-(x1-x0))/2, padY = (PXH-(yB2-yT))/2;
        var cv = document.createElement('canvas'); cv.width=PXW; cv.height=PXH;
        var cx = cv.getContext('2d', {willReadFrequently:true}) || cv.getContext('2d');
        if(!cx) return null;
        cx.fillStyle = '#e8edf2'; cx.fillRect(0,0,PXW,PXH);
        var jobs = [], tx, ty;
        var ax0 = Math.floor((x0-padX)/TP), ax1 = Math.floor((x0-padX+PXW)/TP);
        var ay0 = Math.floor((yT-padY)/TP), ay1 = Math.floor((yT-padY+PXH)/TP);
        for(tx=ax0; tx<=ax1; tx++){
          for(ty=ay0; ty<=ay1; ty++){
            (function(XX,YY){
              var url = '';
              if(baseHot){
                var sub = 'abc'[Math.abs(XX+YY)%3];
                url = 'https://'+sub+'.tile.openstreetmap.fr/hot/'+z+'/'+XX+'/'+YY+'.png';
              } else {
                url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/'+z+'/'+YY+'/'+XX;
              }
              jobs.push(new Promise(function(res){
                var im = new Image(); im.crossOrigin='anonymous';
                var fin=false, done=function(){ if(!fin){ fin=true; res(); } };
                im.onload = function(){
                  try{ cx.drawImage(im, XX*TP-(x0-padX), YY*TP-(yT-padY), TP, TP); }catch(e){}
                  done();
                };
                im.onerror = function(){ done(); };
                setTimeout(done, 5000);
                im.src = url;
              }));
            })(tx,ty);
          }
        }
        await Promise.all(jobs);
        try{
          var feats = null;
          try{
            if(typeof activeLayers!=='undefined' && activeLayers[table] && activeLayers[table].layer){
              var gj = activeLayers[table].layer.toGeoJSON();
              if(gj && gj.features) feats = gj.features.slice(0,400);
            }
          }catch(e){}
          cx.strokeStyle = '#1a5c4e'; cx.fillStyle = 'rgba(26,92,78,0.35)'; cx.lineWidth = 1.5;
          var ox = x0-padX, oy = yT-padY;
          function aPx(lon, lat){ return [mercX(lon,z)-ox, mercY(lat,z)-oy]; }
          function dibujarAnillo(anillo){
            if(!anillo || !anillo.length) return;
            cx.beginPath();
            for(var i=0;i<anillo.length;i++){
              var p = aPx(anillo[i][0], anillo[i][1]);
              if(i===0) cx.moveTo(p[0],p[1]); else cx.lineTo(p[0],p[1]);
            }
            cx.closePath(); cx.fill(); cx.stroke();
          }
          if(feats && feats.length){
            feats.forEach(function(f){
              try{
                var g = f.geometry; if(!g) return;
                if(g.type==='Polygon'){ (g.coordinates||[]).forEach(dibujarAnillo); }
                else if(g.type==='MultiPolygon'){ (g.coordinates||[]).forEach(function(p){ (p||[]).forEach(dibujarAnillo); }); }
                else if(g.type==='LineString'){ dibujarAnillo(g.coordinates); }
                else if(g.type==='MultiLineString'){ (g.coordinates||[]).forEach(dibujarAnillo); }
                else if(g.type==='Point'){ var p2=aPx(g.coordinates[0],g.coordinates[1]); cx.beginPath(); cx.arc(p2[0],p2[1],3,0,Math.PI*2); cx.fill(); cx.stroke(); }
              }catch(e){}
            });
          } else {
            var q1=aPx(w0,n0), q2=aPx(e0,s0);
            cx.strokeStyle='#1a5c4e'; cx.lineWidth=2;
            cx.strokeRect(q1[0], q1[1], q2[0]-q1[0], q2[1]-q1[1]);
          }
        }catch(e){}
        return cv.toDataURL('image/png');
      }catch(e){ return null; }
    }
    // Captura real del minimapa de la ficha (extent de la capa)
    var miniImgCrudo = await imagenExtentEstatica();
    try{
      if(!miniImgCrudo && typeof metadataMinimap!=='undefined' && metadataMinimap){
        try{
          var gMini = (typeof currentMetadataData!=='undefined' && currentMetadataData && currentMetadataData.identificationInfo && currentMetadataData.identificationInfo.extent) || {};
          var ggMini = gMini.geographicElement || {};
          var wMini = Number(ggMini.westBoundLongitude), sMini = Number(ggMini.southBoundLatitude), eMini = Number(ggMini.eastBoundLongitude), nMini = Number(ggMini.northBoundLatitude);
          if(isFinite(wMini)&&isFinite(sMini)&&isFinite(eMini)&&isFinite(nMini)){
            try{ metadataMinimap.fitBounds(L.latLngBounds([sMini, wMini],[nMini, eMini]), {padding:[10,10], animate:false}); }catch(e){}
          }
          metadataMinimap.invalidateSize(true);
          try{ console.info('[pdf-mini] refit extent=['+sMini+','+wMini+','+nMini+','+eMini+'] vista='+metadataMinimap.getBounds().toBBoxString()+' zoom='+metadataMinimap.getZoom()); }catch(e){}
        }catch(e){}
        var tMini = Date.now(), listoMini = false;
        while(Date.now()-tMini < 3000 && !listoMini){
          try{
            var timgsMini = document.querySelectorAll('#metadata-minimap img.leaflet-tile');
            var nMini = 0;
            for(var qiMini=0; qiMini<timgsMini.length; qiMini++){ try{ if(timgsMini[qiMini].complete && timgsMini[qiMini].naturalWidth) nMini++; }catch(e){} }
            var haySvgMini = false;
            try{ haySvgMini = !!document.querySelector('#metadata-minimap .leaflet-overlay-pane svg'); }catch(e){}
            if((timgsMini.length && nMini>=timgsMini.length) || (haySvgMini && Date.now()-tMini>800)) listoMini = true;
            else await new Promise(function(r){ setTimeout(r, 200); });
          }catch(e){ break; }
        }
        miniImgCrudo = await capturaLeafletNativa(metadataMinimap);
      }
    }catch(e){ miniImgCrudo = null; }
    if(!miniImgCrudo && typeof map!=='undefined' && map && typeof L!=='undefined'){
      // Plan B: vista temporal del extent en el mapa principal (mayor resolución) y restaurar
      var vistaG = null, rectM = null;
      try{
        var wM = Number((geo&&geo.westBoundLongitude)!==undefined?geo.westBoundLongitude:NaN);
        var sM = Number(geo?geo.southBoundLatitude:NaN);
        var eM = Number(geo?geo.eastBoundLongitude:NaN);
        var nM = Number(geo?geo.northBoundLatitude:NaN);
        if(isFinite(wM) && isFinite(sM) && isFinite(eM) && isFinite(nM)){
          var bbM = L.latLngBounds([sM, wM],[nM, eM]);
          try{ vistaG = {center: map.getCenter(), zoom: map.getZoom()}; }catch(e){}
          try{ rectM = L.rectangle(bbM, {color:'#1a5c4e', weight:2, fillOpacity:0.06}).addTo(map); }catch(e){}
          try{ map.fitBounds(bbM, {padding:[20,20], animate:false}); }catch(e){}
          var tM = Date.now(), okM = false;
          while(Date.now()-tM < 3500 && !okM){
            try{
              var tis = map.getContainer().querySelectorAll('img.leaflet-tile');
              var cM = 0, qiM;
              for(qiM=0; qiM<tis.length; qiM++){ try{ if(tis[qiM].complete && tis[qiM].naturalWidth) cM++; }catch(e){} }
              if(tis.length && cM>=tis.length) okM = true;
              else await new Promise(function(r){ setTimeout(r, 250); });
            }catch(e){ break; }
          }
          miniImgCrudo = await capturaLeafletNativa(map);
        }
      }catch(e){}
      try{ if(rectM){ try{ map.removeLayer(rectM); }catch(e){} } }catch(e){}
      try{ if(vistaG){ map.setView(vistaG.center, vistaG.zoom, {animate:false}); } }catch(e){}
    }
    async function encuadrarMiniatura(dataURL, aw, ah){
      return new Promise(function(res){
        try{
          if(!dataURL){ res(null); return; }
          var im = new Image();
          im.onload = function(){
            try{
              var ar = aw/Math.max(1,ah), ir = im.width/Math.max(1,im.height);
              var sx=0, sy=0, sw=im.width, sh=im.height;
              if(ir > ar){ sw = im.height*ar; sx = (im.width-sw)/2; }
              else { sh = im.width/ar; sy = (im.height-sh)/2; }
              if(sw<2 || sh<2){ res(dataURL); return; }
              var c = document.createElement('canvas'); c.width = Math.round(sw); c.height = Math.round(sh);
              c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
              res(c.toDataURL('image/png'));
            }catch(e){ res(dataURL); }
          };
          im.onerror = function(){ res(dataURL); };
          im.src = dataURL;
        }catch(e){ res(dataURL); }
      });
    }

    // ===== 1. HERO: Info general + Vista de la capa =====
    await (async function hero(){
      var rows = [
        ['Titulo', titleTxt],
        ['Titulo alt.', altTitle],
        ['Identificador', metaId],
        ['Fecha', fechaTxt],
        ['Idioma / Jerarquia', language+' / '+hierarchyLevel],
        ['Contacto', contactName],
        ['Formato / Escala', fmt+' / '+scaleTxt]
      ];
      var leftW = CW*0.64, rightW = CW*0.34, gap = CW*0.02;
      // medir alto tarjeta izquierda
      var tmpY = y;
      var pad=2.5, innerW=leftW-pad*2, keyW=innerW*0.36, valW=innerW*0.62;
      doc.setFontSize(6.4);
      var hh = rows.map(function(r){
        var kl=doc.splitTextToSize(S(r[0]).toUpperCase(), keyW);
        var vl=doc.splitTextToSize(S(r[1]), valW);
        return Math.max(kl.length,vl.length)*3.33+2.2;
      }).reduce(function(a,b){return a+b;},0) + pad+6+pad;
      var H = Math.max(hh, 64);
      // recalcular con la referencia real para que nada desborde la tarjeta derecha
      var refLinesPrev = doc.splitTextToSize('Referencia: '+refCode+' '+refVer+'  ·  Representación: '+spatialRep, rightW-pad*2);
      for(var _hi=0; _hi<2; _hi++){
        var mhPrev = Math.min(38, H-26);
        H = Math.max(H, pad+6+mhPrev+4+3.2+3.2+2+refLinesPrev.length*3.3+pad);
      }
      need(H+2);
      var y0=y;
      // tarjeta izquierda
      drawCardFrame(M, y0, leftW, H, false);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('INFORMACION GENERAL', M+pad, y0+pad+3.2);
      var cy=y0+pad+5.5;
      rows.forEach(function(r,i){
        var kl=doc.splitTextToSize(S(r[0]).toUpperCase(), keyW);
        var vl=doc.splitTextToSize(S(r[1]), valW);
        var rh=Math.max(kl.length,vl.length)*3.33+2.2;
        doc.setFontSize(5.8); doc.setFont('helvetica','bold'); doc.setTextColor(C.mut[0],C.mut[1],C.mut[2]);
        doc.text(kl, M+pad, cy+2.5);
        doc.setFontSize(6.4); doc.setFont('helvetica','normal'); doc.setTextColor(C.txt[0],C.txt[1],C.txt[2]);
        // truncar identificador largo
        var vv = vl; if(i===2 && vv.join(' ').length>90){ vv = doc.splitTextToSize(vl.join(' ').substring(0,90), valW); }
        doc.text(vv, M+pad+keyW+2, cy+2.5);
        cy+=rh;
        if(i<rows.length-1){ doc.setDrawColor(C.line[0],C.line[1],C.line[2]); doc.setLineWidth(0.2); doc.line(M+pad, cy-1, M+leftW-pad, cy-1); }
      });
      // tarjeta derecha: vista de la capa (placeholder mapa)
      var rx = M+leftW+gap;
      drawCardFrame(rx, y0, rightW, H, false);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('VISTA DE LA CAPA', rx+pad, y0+pad+3.2);
      // recuadro mapa (fondo gris mapa como en la ficha, bbox bien visible)
      var mx=rx+2.5, mw=rightW-5, mh=Math.min(38, H-26);
      var my=y0+pad+5.5;
      doc.setFillColor(224,231,239); doc.setDrawColor(150,160,175); doc.setLineWidth(0.4);
      doc.roundedRect(mx, my, mw, mh, 1, 1, 'FD');
      // reticula tipo mapa
      doc.setDrawColor(198,206,216); doc.setLineWidth(0.15);
      doc.line(mx, my+mh/4, mx+mw, my+mh/4); doc.line(mx, my+mh/2, mx+mw, my+mh/2); doc.line(mx, my+3*mh/4, mx+mw, my+3*mh/4);
      doc.line(mx+mw/4, my, mx+mw/4, my+mh); doc.line(mx+mw/2, my, mx+mw/2, my+mh); doc.line(mx+3*mw/4, my, mx+3*mw/4, my+mh);
      // contorno estilizado de referencia (marco interior)
      doc.setDrawColor(170,180,192); doc.setLineWidth(0.25);
      doc.roundedRect(mx+mw*0.08, my+mh*0.12, mw*0.84, mh*0.76, 2, 2, 'D');
      // rectangulo bbox grande y visible
      var bx0=mx+mw*0.20, by0=my+mh*0.20, bw0=mw*0.60, bh0=mh*0.60;
      try{ doc.setFillColor(C.verde[0],C.verde[1],C.verde[2]); doc.setGState(doc.GState({opacity:0.18})); doc.rect(bx0, by0, bw0, bh0, 'F'); doc.setGState(doc.GState({opacity:1})); }catch(e){ doc.setFillColor(210,228,222); doc.rect(bx0, by0, bw0, bh0, 'F'); }
      doc.setDrawColor(C.verde[0],C.verde[1],C.verde[2]); doc.setLineWidth(0.9);
      doc.rect(bx0, by0, bw0, bh0, 'D');
      // indicador norte
      doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('N', mx+mw-4, my+5);
      // imagen real del minimapa sobre el esquema (extent de la capa)
      var miniPintado = false;
      if(miniImgCrudo){
        try{
          var miniRec = await encuadrarMiniatura(miniImgCrudo, mw, mh);
          if(miniRec){
            doc.addImage(miniRec, 'PNG', mx, my, mw, mh);
            doc.setDrawColor(150,160,175); doc.setLineWidth(0.4);
            doc.rect(mx, my, mw, mh, 'S');
            miniPintado = true;
          }
        }catch(e){}
      }
      try{ console.info('[pdf-mini] imagen='+(miniPintado?'REAL':'ESQUEMA')+' caja='+Math.round(mw)+'x'+Math.round(mh)); }catch(e){}
      var capY = my+mh+4;
      doc.setFontSize(5.6); doc.setFont('helvetica','normal'); doc.setTextColor(C.mut[0],C.mut[1],C.mut[2]);
      doc.text('W '+westTxt+'  E '+eastTxt, rx+pad, capY);
      doc.text('S '+southTxt+'  N '+northTxt, rx+pad, capY+3.2);
      // referencia en texto plano (sin botones)
      doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(70,70,70);
      var refLines = doc.splitTextToSize('Referencia: '+refCode+' '+refVer+'  ·  Representación: '+spatialRep, rightW-pad*2);
      doc.text(refLines, rx+pad, capY+6);
      y = y0 + H + 3;
    })();

    // ===== 2. GRID: Limites + Fuentes =====
    (function grid2(){
      var gap=3, colW=(CW-gap)/2;
      // --- medir tarjeta limites (bbox 2x2 + extension/temporal) ---
      doc.setFontSize(6.2);
      var bboxCells = [['Oeste',westTxt],['Este',eastTxt],['Norte',northTxt],['Sur',southTxt]];
      var limBody = ['Extension: '+descTxt, 'Temporal: '+tempTxt];
      var limBodyLines = limBody.map(function(t){ return doc.splitTextToSize(t, colW-5); });
      var limH = 2.5+6 + (13)*2 + limBodyLines[0].length*3.4 + limBodyLines[1].length*3.4 + 4;
      // --- medir tarjeta fuentes (sin botones: solo texto plano) ---
      var supLines = supplementalInfo ? doc.splitTextToSize(supplementalInfo, colW-5) : [];
      var resMeasure = [];
      onLine.slice(0,4).forEach(function(o){ resMeasure = resMeasure.concat(doc.splitTextToSize(S('- '+(o.name||'Recurso')).substring(0,80), colW-10)); });
      var accLines = doc.splitTextToSize('Acceso: '+access+'  |  Uso: '+useLim, colW-5);
      var fuH = 2.5+6 + supLines.length*3.4 + resMeasure.length*3.3 + accLines.length*3.4 + 6;
      var H = Math.max(limH, fuH, 34);
      need(H+2);
      var y0=y;
      // Limites
      drawCardFrame(M, y0, colW, H, false);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('LIMITES GEOGRAFICOS', M+2.5, y0+5.5);
      var cellW=(colW-2.5*2-2)/2, cellH=13, cx0=M+2.5, cy0=y0+8;
      bboxCells.forEach(function(c, i){
        var cx = cx0 + (i%2)*(cellW+2), cyy = cy0 + Math.floor(i/2)*(cellH+2);
        doc.setFillColor(255,255,255); doc.setDrawColor(C.cardBorder[0],C.cardBorder[1],C.cardBorder[2]); doc.setLineWidth(0.25);
        doc.roundedRect(cx, cyy, cellW, cellH, 1, 1, 'FD');
        doc.setFontSize(5.6); doc.setFont('helvetica','bold'); doc.setTextColor(C.mut[0],C.mut[1],C.mut[2]);
        doc.text(S(c[0]).toUpperCase(), cx+2, cyy+4);
        doc.setFontSize(6.8); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
        doc.text(S(c[1]).substring(0,16), cx+2, cyy+8.5);
      });
      var ly = cy0 + (cellH+2)*2 + 2;
      doc.setFontSize(6.2); doc.setFont('helvetica','normal'); doc.setTextColor(70,70,70);
      limBodyLines.forEach(function(ls){ doc.text(ls, M+2.5, ly+2.5); ly += ls.length*3.4; });
      // Fuentes (borde izquierdo verde como en la ficha)
      var fx = M+colW+gap;
      drawCardFrame(fx, y0, colW, H, true);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('FUENTES Y ACCESO', fx+4, y0+5.5);
      var fy = y0+9;
      if(supLines.length){ doc.setFontSize(6.4); doc.setFont('helvetica','normal'); doc.setTextColor(55,55,55); doc.text(supLines, fx+4, fy+2.5); fy += supLines.length*3.4+1; }
      // recursos en linea como texto plano (sin botones)
      var resLines = [];
      onLine.slice(0,4).forEach(function(o){ resLines = resLines.concat(doc.splitTextToSize(S('- '+(o.name||'Recurso')).substring(0,80), colW-10)); });
      if(resLines.length){ doc.setFontSize(6.2); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,50); doc.text(resLines, fx+4, fy+2.5); fy += resLines.length*3.3+1; }
      doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(90,90,90);
      doc.text(accLines, fx+4, fy+2.5);
      y = y0 + H + 3;
    })();

    // ===== 3. Resumen / 4. Proposito =====
    sectionTitle('Resumen');
    (function(){
      var b = textCardBlock(CW, 'RESUMEN', abstractTxt, 6.6);
      need(b.h); var y0=y; b.draw(M, y0); y = y0 + b.h + 3;
    })();
    sectionTitle('Proposito');
    (function(){
      var b = textCardBlock(CW, 'PROPOSITO', purposeTxt, 6.6);
      need(b.h); var y0=y; b.draw(M, y0); y = y0 + b.h + 3;
    })();

    // ===== 5. Palabras clave en texto plano (sin botones) =====
    (function(){
      var pad=2.5;
      doc.setFontSize(6.4);
      var tl = doc.splitTextToSize('Tema: '+topicCategory, CW-pad*2);
      var kwTxt = (keywords||[]).slice(0,30).join(', ') || '-';
      var kl = doc.splitTextToSize('Palabras clave: '+kwTxt, CW-pad*2);
      var H = pad+6+tl.length*3.6+2+kl.length*3.4+pad;
      need(H);
      var y0=y;
      drawCardFrame(M, y0, CW, H, false);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('PALABRAS CLAVE Y CATEGORIA', M+pad, y0+pad+3.2);
      doc.setFontSize(6.4); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,50);
      doc.text(tl, M+pad, y0+pad+7.5);
      doc.text(kl, M+pad, y0+pad+7.5+tl.length*3.6+1);
      y = y0 + H + 3;
    })();

    // ===== 6. Calidad =====
    sectionTitle('Calidad de la informacion');
    (function(){
      var gap=3, colW=(CW-gap)/2;
      var a=textCardBlock(colW,'COMPLETITUD',compTxt,6.4);
      var b=textCardBlock(colW,'PRECISION POSICIONAL',precTxt,6.4);
      var H=Math.max(a.h,b.h);
      need(H); var y0=y;
      // redibujar con altura igual
      drawCardFrame(M, y0, colW, H, false);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('COMPLETITUD', M+2.5, y0+5.5);
      doc.setFontSize(6.4); doc.setFont('helvetica','normal'); doc.setTextColor(55,55,55);
      doc.text(a.lines, M+2.5, y0+10);
      drawCardFrame(M+colW+gap, y0, colW, H, false);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
      doc.text('PRECISION POSICIONAL', M+colW+gap+2.5, y0+5.5);
      doc.setFontSize(6.4); doc.setFont('helvetica','normal'); doc.setTextColor(55,55,55);
      doc.text(b.lines, M+colW+gap+2.5, y0+10);
      y = y0 + H + 3;
    })();

    // ===== 7. Linaje =====
    (function(){
      var b=textCardBlock(CW,'LINAJE',lineageTxt,6.4);
      need(b.h); var y0=y; b.draw(M, y0); y=y0+b.h+3;
    })();

    // ===== 8. Referencia & Distribucion =====
    sectionTitle('Sistema de referencia y distribucion');
    (function(){
      var gap=3, colW=(CW-gap)/2;
      var r1=[['Codigo',refCode],['Datum',refVer]];
      var r2=[['Formato',fmt],['Acceso',access],['Uso',useLim]];
      var y0=y;
      // alturas
      function rowsH(rows){ doc.setFontSize(6.4); return rows.map(function(r){
        var kl=doc.splitTextToSize(S(r[0]).toUpperCase(), colW*0.34);
        var vl=doc.splitTextToSize(S(r[1]), colW*0.58);
        return Math.max(kl.length,vl.length)*3.33+2.2;
      }).reduce(function(a,b){return a+b;},0); }
      var H=Math.max(rowsH(r1),rowsH(r2))+2.5+6+2.5;
      need(H); y0=y;
      [[r1,'REFERENCIA',M],[r2,'DISTRIBUCION',M+colW+gap]].forEach(function(cfg){
        var rows=cfg[0], ttl=cfg[1], bx=cfg[2];
        drawCardFrame(bx, y0, colW, H, false);
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(C.verde[0],C.verde[1],C.verde[2]);
        doc.text(ttl, bx+2.5, y0+5.5);
        var cy=y0+8;
        rows.forEach(function(r,i){
          var kl=doc.splitTextToSize(S(r[0]).toUpperCase(), colW*0.34);
          var vl=doc.splitTextToSize(S(r[1]), colW*0.58);
          var rh=Math.max(kl.length,vl.length)*3.33+2.2;
          doc.setFontSize(5.8); doc.setFont('helvetica','bold'); doc.setTextColor(C.mut[0],C.mut[1],C.mut[2]);
          doc.text(kl, bx+2.5, cy+2.5);
          doc.setFontSize(6.4); doc.setFont('helvetica','normal'); doc.setTextColor(C.txt[0],C.txt[1],C.txt[2]);
          doc.text(vl, bx+2.5+colW*0.38, cy+2.5);
          cy+=rh;
          if(i<rows.length-1){ doc.setDrawColor(C.line[0],C.line[1],C.line[2]); doc.setLineWidth(0.2); doc.line(bx+2.5, cy-1, bx+colW-2.5, cy-1); }
        });
      });
      y=y0+H+3;
    })();

    footer();
    doc.save(table+'_metadato.pdf');
  }catch(e){ console.error(e); alert('Error PDF: '+String((e&&e.message)||e)); }
  finally{ if(loadingEl) loadingEl.style.display='none'; }
}
try{ document.getElementById('metadata-download-pdf')?.addEventListener('click', descargarMetadataPDF); }catch(e){}
try{ window.descargarMetadataPDF = descargarMetadataPDF; }catch(e){}
