// ================================================================



 // DISCLAIMER MODAL - estilo MapBiomas



 // ================================================================



 (function(){



  const STORAGE_DONT_SHOW = 'disclaimer_dont_show_v5';



  const STORAGE_ACCEPTED = 'disclaimer_accepted_v5';







  function shouldShowDisclaimer(){



    try{



      if(localStorage.getItem(STORAGE_DONT_SHOW)==='true') return false;



      // Si ya aceptó en esta sesión, no volver a mostrar hasta recargar sesión



      if(sessionStorage.getItem(STORAGE_ACCEPTED)==='true') return false;



    }catch(e){}



    return true;



  }







  function showDisclaimer() {



    const overlay = document.getElementById('disclaimer-modal');



    if (!overlay) return;



    overlay.classList.add('active');



    overlay.style.display = 'flex';



    try{



      const dontShow = localStorage.getItem(STORAGE_DONT_SHOW)==='true';



      const cb = document.getElementById('disclaimer-dont-show');



      if(cb) cb.checked = dontShow;



    }catch(e){}



    document.body.style.overflow = 'hidden';



    try{ document.getElementById('disclaimer-close')?.focus(); }catch(e){}



  }







  function persistDontShowIfChecked(){



    try{



      const cb = document.getElementById('disclaimer-dont-show');



      if(cb && cb.checked) localStorage.setItem(STORAGE_DONT_SHOW,'true');



    }catch(e){}



  }







  function closeDisclaimer() {



    persistDontShowIfChecked();



    try{ sessionStorage.setItem(STORAGE_ACCEPTED,'true'); }catch(e){}



    const overlay = document.getElementById('disclaimer-modal');



    if (overlay) {



      overlay.classList.remove('active');



      overlay.style.display = 'none';



      document.body.style.overflow = '';



    }



  }







  function acceptDisclaimer() {



    try{



      persistDontShowIfChecked();



      sessionStorage.setItem(STORAGE_ACCEPTED,'true');



      // también guardar en localStorage por compatibilidad previa



      try{ localStorage.setItem(STORAGE_ACCEPTED,'true'); }catch(e){}



    }catch(e){}



    closeDisclaimer();



  }







  document.getElementById('disclaimer-close')?.addEventListener('click', closeDisclaimer);



  document.getElementById('disclaimer-accept')?.addEventListener('click', acceptDisclaimer);



  document.getElementById('disclaimer-modal')?.addEventListener('click', (e) => {



    if (e.target.id === 'disclaimer-modal') closeDisclaimer();



  });



  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ const o=document.getElementById('disclaimer-modal'); if(o && o.classList.contains('active')) closeDisclaimer(); }});







  function init(){



    if(shouldShowDisclaimer()) setTimeout(showDisclaimer, 450);



  }



  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);



  else init();







  window.showDisclaimer = showDisclaimer;



  window.closeDisclaimer = closeDisclaimer;



  window.acceptDisclaimer = acceptDisclaimer;



 })();
