// ================================================================
// CLIPBOARD
// ================================================================
document.querySelectorAll('.btn-copy').forEach(btn=>{
 btn.addEventListener('click',function(e){e.stopPropagation();const el=document.getElementById(this.dataset.copy);if(!el)return;const txt=el.textContent.trim();if(!txt||txt==='—'){alert('Sin datos.');return;}navigator.clipboard.writeText(txt).then(()=>{const o=this.innerHTML;this.innerHTML='<i class="fas fa-check"></i>';this.classList.add('copied');setTimeout(()=>{this.innerHTML=o;this.classList.remove('copied');},1500);}).catch(()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);const o=this.innerHTML;this.innerHTML='<i class="fas fa-check"></i>';setTimeout(()=>{this.innerHTML=o;},1500);});});
});