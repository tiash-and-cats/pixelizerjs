import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { asThreeJS } from "./pixelizer.js";
import Alpine from 'alpinejs'

import spaceUrl from './assets/space.jpg';
import laughiconUrl from './assets/laughicon.png';
import moonUrl from './assets/moon.jpg';
import normalUrl from './assets/normal.jpg';

(async function() {
  const canvas = document.querySelector("#bg");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    window.devicePixelRatio
  );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.setZ(30);
  camera.position.setX(-3);

  const composer =
    new EffectComposer(renderer);

  composer.addPass(
    new RenderPass(scene, camera)
  );

  const pixelizer = await asThreeJS({
    initialSqSize: 5,
    dithering: true,
  });

  composer.addPass(pixelizer);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.position.setZ(30);
  camera.position.setX(-3);

  renderer.render(scene, camera);

  // Torus

  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
  const torus = new THREE.Mesh(geometry, material);

  scene.add(torus);

  // Lights

  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(5, 5, 5);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(pointLight, ambientLight);

  // Helpers

  // const lightHelper = new THREE.PointLightHelper(pointLight)
  // const gridHelper = new THREE.GridHelper(200, 50);
  // scene.add(lightHelper, gridHelper)

  // const controls = new OrbitControls(camera, renderer.domElement);

  function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    scene.add(star);
  }

  Array(200).fill().forEach(addStar);

  // Background

  const spaceTexture = new THREE.TextureLoader().load(spaceUrl);
  scene.background = spaceTexture;

  // Avatar

  const laughTexture = new THREE.TextureLoader().load(laughiconUrl);

  const laugh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: laughTexture }));

  scene.add(laugh);

  // Moon

  const moonTexture = new THREE.TextureLoader().load(moonUrl);
  const normalTexture = new THREE.TextureLoader().load(normalUrl);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      normalMap: normalTexture,
    })
  );

  scene.add(moon);

  moon.position.z = 30;
  moon.position.setX(-10);

  laugh.position.z = -5;
  laugh.position.x = 2;

  // Scroll Animation

  function moveCamera() {
    const t = (document.body.getBoundingClientRect().top / Math.max(
      document.body.scrollHeight, 
      document.body.offsetHeight, 
      document.documentElement.clientHeight, 
      document.documentElement.scrollHeight, 
      document.documentElement.offsetHeight
    )) * 8000;
    
    moon.rotation.x += 0.05;
    moon.rotation.y += 0.075;
    moon.rotation.z += 0.05;

    laugh.rotation.y += 0.01;
    laugh.rotation.z += 0.01;

    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;
  }

  document.body.onscroll = moveCamera;
  moveCamera();

  Alpine.data('play', () => ({
    _dither: 0.15,
    get dither() { return this._dither; },
    set dither(v) {
      v = Number(v);
      
      this._dither = v;
      pixelizer.setDitherStrength(v);
    },
    
    _pxSize: 5,
    get pxSize() { return this._pxSize; },
    set pxSize(v) {
      v = Number(v);
      
      this._pxSize = v;
      pixelizer.setPixelSize(v);
    },
    
    get enabled() { return pixelizer.enabled; },
    set enabled(v) { pixelizer.enabled = v; },
    
    error: "",
    palette: "Resurrect 64 by Kerrie Lake (default)",
    
    async loadLospecPalette(e) {
      const id = document.getElementById("lospec-palette").value
        .toLowerCase()
        .replaceAll(" ", "-")
        .replace(/[^a-zA-Z0-9-]/g, "");
      
      this.error = "Loading...";
      
      try {
        const res = await fetch(`https://lospec.com/palette-list/${id}.json`);
        if (!res.ok) {
          this.error = `Request failed (HTTP error ${res.status})`;
          return; 
        }
        
        const obj = await res.json();
        pixelizer.setPalette(obj.colors);
        
        this.palette = `${obj.name} by ${obj.author || "(Anonymous)"}`
        this.error = "";
      } catch (err) {
        // The browser's forced rejection lands here
        this.error = `Palette "${id}" not found or request blocked (CORS/Network error).`;
        console.error("Fetch threw an error:", err);
      }
    }
  }));

  window.pixelizer = pixelizer;

  Alpine.start();

  // Animation Loop

  function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.02;
    torus.rotation.y += 0.01;
    torus.rotation.z += 0.02;

    moon.rotation.x += 0.01;

    composer.render();
  }

  animate();
})();