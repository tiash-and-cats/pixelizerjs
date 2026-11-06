# `pixelizer.js`

A palette-based pixelization and dithering library for JavaScript.

`pixelizer.js` renders an image through a configurable color palette, optionally applies Bayer dithering, and produces a retro-inspired result. It can be used as a standalone image processor, integrated into custom WebGL pipelines, or attached as a Three.js post-processing pass.

## Features

- Palette-based color quantization
- Optional Bayer dithering
- Runtime palette switching
- Runtime pixel size adjustment
- Raw WebGL shader access
- Three.js post-processing integration
- No external dependencies for core functionality

## Installation

Just copy `pixelizer.js` into your project! I promise there'll be a better way to do this soon.

## Examples

### Boring

``` js
import makePixelizer from "pixelizer";

const pixelizer = makePixelizer();
const output =
  pixelizer.pixelize(imageBitmap);
```

> By default, `pixelizer.js` uses the Resurrect64 color palette by Kerrie Lake on Lospec, a 5x5 pixel square size, with dithering enabled. You can change this by using *options!*

### Custom options

``` js
const pixelizer = makePixelizer({
  initialSqSize: 2, // 2x2px square size
  dithering: true, // set to false if you like
  palette: [
    // (h3Rry F!z by ID Rando on Lospec
    "0d0a19",
    "ed2443",
    "58b6ef",
    "f3ecdd",
  ],
});
```

### Three.js

> Three.js is only required if you want to use the Three.js features. If you're just using the other parts, it is not needed.

> You may need to set up an importmap.

``` js
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { asThreeJS } from "./pixelizer.js";

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

composer.addPass(
  await asThreeJS({
    initialSqSize: 5,
    palette: [
      // MAGENTA ST by Leonardo, a rejected palette from Lospec
      "ffffff",
      "ffe5ff",
      "ffccff",
      "ffb2ff",
      "ff99ff",
      "ff7fff",
      "ff65ff",
      "ff4cff",
      "ff19ff",
      "ff32ff",
      "ff00ff",
      "e500e5",
      "cc00cc",
      "b200b2",
      "990099",
      "190019",
      "000000",
    ],
    dithering: true,
  })
);
```

### Low-Level Access

> [!CAUTION]
> YOU ARE ENTERING A VERY TECHNICAL AREA. IF YOU DO NOT UNDERSTAND, STAY CALM AND SCROLL PAST.

``` js
import { getWebGLSource } from "pixelizer";

const {
  vertexShader,
  fragmentShader,
} = getWebGLSource({
  dithering: true,
});

// bla bla WebGL shader compilation etc.
```

## A Note from the Author (`tiash-and-cats`)

`pixelizer.js` is intentionally palette-driven.

The shader is only part of the final look. Different palettes can dramatically change the atmosphere of a scene, ranging from subtle retro rendering to aggressive posterization.

Please experiment with palettes, pixel sizes, and dithering settings to develop a UNIQUE visual identity!

I do not want `pixelizer.js` to become known for a repetitive visual style, so PLEASE don't all use the same cookie-cutter config. The defaults are intended as a starting point.