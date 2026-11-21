document.getElementById('year').textContent=new Date().getFullYear();
// Keep keyboard and screen-reader access to all transparent navigation hotspots.
document.querySelectorAll('.hotspot').forEach((link)=>{
  link.addEventListener('click',()=>{
    const target=document.querySelector(link.getAttribute('href'));
    if(target) target.focus({preventScroll:true});
  });
});