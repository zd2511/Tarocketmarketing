import * as THREE from 'three';

const canvas = document.querySelector('#planet-canvas');
const wrap = document.querySelector('#planet-wrap');
let renderer, scene, camera, globe, clouds, animationId;
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');

try {
  renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.z = 4.15;

  const ambient = new THREE.AmbientLight(0x9bb7e8, 1.25);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffc08a, 3.5);
  sun.position.set(-3, 2, 4); scene.add(sun);
  const rim = new THREE.PointLight(0xff5c20, 18, 8);
  rim.position.set(3, -.8, -2); scene.add(rim);

  const geometry = new THREE.SphereGeometry(1.22, 96, 96);
  const material = new THREE.MeshPhongMaterial({color:0x9b8c82, shininess:16, specular:0x5b4b45});
  globe = new THREE.Mesh(geometry, material); scene.add(globe);

  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.265, 96, 96),
    new THREE.MeshBasicMaterial({color:0x5b9fff, transparent:true, opacity:.11, side:THREE.BackSide}));
  scene.add(atmosphere);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.31, 64, 64),
    new THREE.MeshBasicMaterial({color:0xff7b3d, transparent:true, opacity:.055, side:THREE.BackSide}));
  scene.add(glow);

  // Earth-like high-resolution map and relief: the planet remains fully interactive if a texture host is unavailable.
  const mapURL = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
  const bumpURL = 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg';
  textureLoader.load(mapURL, tex => { tex.colorSpace=THREE.SRGBColorSpace; material.map=tex; material.color.set(0xffffff); material.needsUpdate=true; });
  textureLoader.load(bumpURL, tex => { material.bumpMap=tex; material.bumpScale=.035; material.needsUpdate=true; });

  const cloudMat = new THREE.MeshPhongMaterial({color:0xffffff, transparent:true, opacity:.16, depthWrite:false});
  const cloudShell = new THREE.Mesh(new THREE.SphereGeometry(1.235,64,64), cloudMat);
  scene.add(cloudShell); clouds=cloudShell;
  textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png', tex => { clouds.material.map=tex; clouds.material.alphaMap=tex; clouds.material.needsUpdate=true; });

  // Star points add depth without a flat illustrated look.
  const starGeo = new THREE.BufferGeometry(), starCount=1800, positions=[];
  for(let i=0;i<starCount;i++){const r=12+Math.random()*28,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);positions.push(r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t));}
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffd8c1,size:.035,transparent:true,opacity:.8})));

  let dragging=false, prevX=0, prevY=0, velocity=0;
  canvas.addEventListener('pointerdown',e=>{dragging=true;prevX=e.clientX;prevY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-prevX,dy=e.clientY-prevY;globe.rotation.y+=dx*.006;globe.rotation.x=Math.max(-.55,Math.min(.55,globe.rotation.x+dy*.004));velocity=dx*.0008;prevX=e.clientX;prevY=e.clientY;});
  const stopDrag=()=>dragging=false;
  canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
  canvas.addEventListener('wheel',e=>{camera.position.z=Math.max(3.1,Math.min(5.2,camera.position.z+e.deltaY*.002));},{passive:true});

  const resize=()=>{const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(wrap);
  const clock=new THREE.Clock();
  function animate(){animationId=requestAnimationFrame(animate);const dt=clock.getDelta();if(!dragging){globe.rotation.y+=.12*dt+velocity;velocity*=.96;}if(clouds)clouds.rotation.y=globe.rotation.y*.92;renderer.render(scene,camera);}
  animate();
} catch(err) {
  console.warn('3D planet could not initialize in this browser:', err);
  canvas.style.background='radial-gradient(circle at 35% 30%,#b56d4a,#25151b 55%,#050506 72%)';
}

document.querySelector('.menu-toggle').addEventListener('click',e=>{
  const nav=document.querySelector('.nav'), open=nav.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded',String(open));
});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav').classList.remove('open')));
document.querySelector('#year').textContent=new Date().getFullYear();

// Replace this with the real TA Rocket Marketing inbox before publishing.
const BUSINESS_EMAIL = 'ADD-YOUR-EMAIL-HERE';
document.querySelector('#contact-form').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const subject=encodeURIComponent('Project enquiry — TA Rocket Marketing');
  const body=encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\nProject details:\n${data.get('message')}`);
  if(BUSINESS_EMAIL==='ADD-YOUR-EMAIL-HERE'){
    document.querySelector('#form-note').textContent='Demo mode: add your business email in script.js to activate enquiry delivery.';
    return;
  }
  window.location.href=`mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
});
