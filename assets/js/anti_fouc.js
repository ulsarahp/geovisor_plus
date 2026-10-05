
  /* Anti-FOUC: fija data-theme en <html> antes del primer render.
    Prioridad: preferencia guardada en localStorage → claro (por defecto,
    alineado con la operación institucional de la versión anterior). */
  (function () {
   var t = 'light';
   try {
    t = localStorage.getItem('geovisor-theme') || 'light';
   } catch (e) {}
   document.documentElement.setAttribute('data-theme', t);
  })();
 