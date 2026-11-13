import * as BABYLON from "@babylonjs/core";
import { asBabylon } from "./pixelizer.js";

(async function() {
  const canvas = document.getElementById("canvas");
  const engine = new BABYLON.Engine(canvas, true);

  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new BABYLON.Scene(engine);

  // This creates and positions a free camera (non-mesh)
  const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'sphere' shape.
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

  // Move the sphere upward 1/2 its height
  sphere.position.y = 1;

  // Our built-in 'ground' shape.
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

  const pixelizer = await asBabylon(engine, camera, scene, {
    initialSqSize: 2
  });
  
  window.pixelizer = pixelizer;

  engine.runRenderLoop(() => {
    scene.render();
  });
})();