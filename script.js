import * as THREE from 'three';

const canvas = document.querySelector('#planet');
const stage = document.querySelector('#planet-stage');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.z = 4.15;

  scene.add(new THREE.AmbientLight(0x829bc9, 1.05));
  const key = new THREE.DirectionalLight(0xffc18b, 3.1);
  key.position.set(-3.2, 2.1, 4); scene.add(key);
  const rim = new THREE.PointLight(0xff6328, 20, 8);
  rim.position.set(3.2, -.4, -2); scene.add(rim);
  const warm = new THREE.PointLight(0xffa05b, 4, 7);
  warm.position.set(-2,-2,3); scene.add(warm);

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const globe = new THREE.Group(); scene.add(globe);
  const earthMat = new THREE.MeshPhongMaterial({color:0xffffff, shininess:22, specular:0x62514a});
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1.24,128,128), earthMat);
  globe.add(earth);
  const cloudsMat = new THREE.MeshPhongMaterial({transparent:true,opacity:.23,depthWrite:false});
  const cloudLayer = new THREE.Mesh(new THREE.SphereGeometry(1.253,96,96),cloudsMat);
  globe.add(cloudLayer);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.29,96,96),new THREE.MeshBasicMaterial({color:0x70aaff,transparent:true,opacity:.14,side:THREE.BackSide}));
  globe.add(atmo);
  const orangeRim = new THREE.Mesh(new THREE.SphereGeometry(1.315,96,96),new THREE.MeshBasicMaterial({color:0xff7435,transparent:true,opacity:.075,side:THREE.BackSide}));
  globe.add(orangeRim);

  // High-resolution Earth imagery: daylight, city lights and cloud cover.
  loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;earthMat.map=t;earthMat.needsUpdate=true;});
  loader.load('https://threejs.org/examples/textures/planets/earth_lights_2048.png',t=>{t.colorSpace=THREE.SRGBColorSpace;earthMat.emissive=new THREE.Color(0xff8a42);earthMat.emissiveMap=t;earthMat.emissiveIntensity=.72;earthMat.needsUpdate=true;});
  loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',t=>{earthMat.bumpMap=t;earthMat.bumpScale=.028;earthMat.needsUpdate=true;});
  loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png',t=>{cloudsMat.map=t;cloudsMat.alphaMap=t;cloudsMat.needsUpdate=true;});

  const starsGeo=new THREE.BufferGeometry(), points=[];
  for(let i=0;i<2400;i++){const r=11+Math.random()*26,theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);points.push(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));}
  starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xffe2cf,size:.032,transparent:true,opacity:.9})));

  let dragging=false,lastX=0,lastY=0,spin=0;
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;globe.rotation.y+=dx*.006;globe.rotation.x=Math.max(-.48,Math.min(.48,globe.rotation.x+dy*.004));spin=dx*.0007;lastX=e.clientX;lastY=e.clientY;});
  const release=()=>dragging=false;
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('wheel',e=>{camera.position.z=Math.max(3.1,Math.min(5.4,camera.position.z+e.deltaY*.002));},{passive:true});
  const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(stage);
  const clock=new THREE.Clock();
  function render(){requestAnimationFrame(render);const dt=clock.getDelta();if(!dragging){globe.rotation.y+=dt*.105+spin;spin*=.965;}cloudLayer.rotation.y=globe.rotation.y*.94;renderer.render(scene,camera);}
  render();
} catch(e) {
  console.error('WebGL planet unavailable',e);
  canvas.style.background='radial-gradient(circle at 35% 30%,#a65a3a,#24151a 58%,#030303 75%)';
}

const menu=document.querySelector('.menu');
menu.addEventListener('click',()=>{const nav=document.querySelector('.navigation');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
document.querySelectorAll('.navigation a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.navigation').classList.remove('open')));
document.querySelector('#year').textContent=new Date().getFullYear();

// Set the real business inbox here before going live.
const BUSINESS_EMAIL='ADD-BUSINESS-EMAIL-HERE';
document.querySelector('#enquiry').addEventListener('submit',e=>{
  e.preventDefault();const d=new FormData(e.currentTarget);
  if(BUSINESS_EMAIL==='ADD-BUSINESS-EMAIL-HERE'){document.querySelector('#form-message').textContent='Demo mode: add the business email in script.js to enable enquiries.';return;}
  const subject=encodeURIComponent('Website enquiry — TA Rocket Marketing');
  const body=encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\n\nProject details:\n${d.get('message')}`);
  location.href=`mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
});
