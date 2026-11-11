import p5 from "https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.esm.js";
import { asP5 } from "./pixelizer.js";

new p5((p) => {
  let px, fbo;

  p.setup = () => {
    p.createCanvas(600, 400, p.WEBGL);
    p.pixelDensity(1);

    fbo = p.createFramebuffer();
    px = asP5(p);
  };

  p.draw = () => {
    // 1. Draw the 3D scene into the framebuffer
    fbo.begin();
    p.background(30);
    p.orbitControl(); // Works natively!

    p.ambientLight(100);
    p.directionalLight(255, 255, 255, 0, 0, -1);
    p.specularMaterial(0, 180, 255);
    p.noStroke();

    p.rotateX(p.frameCount * 0.01);
    p.rotateY(p.frameCount * 0.01);
    p.box(120);
    fbo.end();

    // 2. Pass the framebuffer directly to your shader
    // p.image(fbo, -300, -200);
    px.render(fbo);
  };
}, "canvas");