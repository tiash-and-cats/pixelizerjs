import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { asThreeJS } from "./pixelizer.js";
import Alpine from 'alpinejs';
import AnchorJS from 'anchor-js';

// not the best practice, but oh well ;)
THREE.ColorManagement.enabled = false;

import spaceUrl from './assets/space.jpg';
import laughiconUrl from './assets/laughicon.png';
import moonUrl from './assets/moon.jpg';
import normalUrl from './assets/normal.jpg';
import apiDocsHtml from './api.md';

(async function() {
  const canvas = document.querySelector("#bg");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  
  const textureLdr = new THREE.TextureLoader();

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
  
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    composer.setSize(width, height);
  }

  window.addEventListener("resize", resize);
  resize();

  renderer.render(scene, camera);

  // Torus

  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
  const torus = new THREE.Mesh(geometry, material);

  scene.add(torus);

  // Lights

  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(5, 5, 5);
  pointLight.intensity = Math.PI;
  pointLight.decay = 0;

  const ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.intensity = Math.PI;
  ambientLight.decay = 0;
  
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

  const spaceTexture = textureLdr.load(spaceUrl);
  scene.background = spaceTexture;

  // Avatar

  const laughTexture = textureLdr.load(laughiconUrl);

  const laugh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: laughTexture }));

  scene.add(laugh);

  // Moon

  const moonTexture = textureLdr.load(moonUrl);
  const normalTexture = textureLdr.load(normalUrl);

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
    
    moon.rotation.x += 0.025;
    moon.rotation.y += 0.0375;
    moon.rotation.z += 0.025;

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
    
    _perfect: false,
    get perfect() { return this._perfect; },
    set perfect(v) {
      this._perfect = v;
      pixelizer.setPerfectlyAccurateMode(v);
    },
    
    genConf() {
      return `\
// Generated using the pixelizer.js playground
// https://tiash.is-cool.dev/pixelizerjs
//
// Change to "await asThreeJS" if using Three.js
const pixelizer = makePixelizer({
  initialSqSize: ${JSON.stringify(this.pxSize)},
  palette: /* ${this.palette} */ ${
    JSON.stringify(this.paletteArr, null, 2)
      .split('\n')
      .map((line, index) => (index === 0 ? line : '  ' + line))
      .join('\n')
  },
  perfectlyAccurate: ${this.perfect},
});

pixelizer.setDitherStrength(${this.dither});`;
    },
    
    copyConf() {
      navigator.clipboard.writeText(
        this.genConf()
      );

      this.error = "Configuration copied!";

      setTimeout(() => {
        if (this.error === "Configuration copied!") {
          this.error = "";
        }
      }, 2000);
    },
    
    error: "",
    palette: "Resurrect 64 by Kerrie Lake (default)",
    paletteArr: [
      "2e222f", "3e3546", "625565", "966c6c", "ab947a", "694f62", "7f708a", "9babb2",
      "c7dcd0", "ffffff", "6e2727", "b33831", "ea4f36", "f57d4a", "ae2334", "e83b3b",
      "fb6b1d", "f79617", "f9c22b", "7a3045", "9e4539", "cd683d", "e6904e", "fbb954",
      "4c3e24", "676633", "a2a947", "d5e04b", "fbff86", "165a4c", "239063", "1ebc73",
      "91db69", "cddf6c", "313638", "374e4a", "547e64", "92a984", "b2ba90", "0b5e65",
      "0b8a8f", "0eaf9b", "30e1b9", "8ff8e2", "323353", "484a77", "4d65b4", "4d9be6",
      "8fd3ff", "45293f", "6b3e75", "905ea9", "a884f3", "eaaded", "753c54", "a24b6f",
      "cf657f", "ed8099", "831c5d", "c32454", "f04f78", "f68181", "fca790", "fdcbb0"
    ],
    
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
        this.paletteArr = obj.colors;
        this.error = "";
      } catch (err) {
        // The browser's forced rejection lands here
        this.error = `Palette "${id}" not found or request blocked (CORS/Network error).`;
        console.error("Fetch threw an error:", err);
      }
    }
  }));

  window._pixelizer = pixelizer;
  
  document.getElementById("docs").innerHTML = apiDocsHtml;
  Alpine.start();
  
  const anchors = new AnchorJS();
  anchors.options["class"] = "anchor";
  anchors.add("#docs h1, #docs h2, #docs h3, #docs h4, #docs h5, #docs h6");

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