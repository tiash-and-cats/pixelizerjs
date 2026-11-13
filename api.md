# API Reference

`pixelizer.js` provides a simple API (this is an opinion, you may disagree), which is described below.

---

## Toplevel Functions

### `makePixelizer(options?)`

Creates a standalone Pixelizer instance. This function creates an image processor capable of transforming `ImageBitmap` objects using pixelization, palette quantization, and Bayer dithering.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | Object | Configuration options. See the Options section below. |

#### Returns

| Type | Description |
|------|-------------|
| Object | A Pixelizer instance. |

#### Example

```js
import makePixelizer from "./pixelizer.js";

const pixelizer = makePixelizer();
```

---

### `async asThreeJS(options?)`

Creates a Three.js post-processing pass. This function returns an object compatible with `EffectComposer` and accepts the same configuration options as `makePixelizer()`.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | Object | Configuration options. See the Options section below. |

#### Returns

| Type | Description |
|------|-------------|
| Pass | A Three.js post-processing pass. |

#### Example

```js
import { EffectComposer }
  from "three/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass }
  from "three/examples/jsm/postprocessing/RenderPass.js";

import { asThreeJS }
  from "./pixelizer.js";

const composer =
  new EffectComposer(renderer);

composer.addPass(
  new RenderPass(scene, camera)
);

const pixelizer =
  await asThreeJS({
    initialSqSize: 5,
  });

composer.addPass(pixelizer);
```

The returned object supports the same configuration methods as `makePixelizer()`.

---

### `asP5(p, options?)`

Creates a p5.js integration instance. This function provides access to Pixelizer from p5.js and accepts the same configuration options as `makePixelizer()`. It is instance mode-specific.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `p` | p5 instance | The current p5 instance. |
| `options` | Object | Configuration options. See the Options section below. |

#### Returns

| Type | Description |
|------|-------------|
| Object | A p5.js Pixelizer integration instance. |

#### Example

```js
import p5
  from "https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.esm.js";

import { asP5 }
  from "./pixelizer.js";

new p5((p) => {
  let px;
  let fbo;

  p.setup = () => {
    p.createCanvas(
      600,
      400,
      p.WEBGL
    );

    fbo =
      p.createFramebuffer();

    px = asP5(p);
  };

  p.draw = () => {
    fbo.begin();

    p.background(30);
    p.rotateY(
      p.frameCount * 0.01
    );

    p.box(120);

    fbo.end();

    px.render(fbo);
  };
});
```

#### Methods

The returned object supports the same configuration methods as `makePixelizer()`.

It has one unique method:

##### `px.render(sourceBuffer)`

Renders a p5.js source buffer using Pixelizer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceBuffer` | p5.Framebuffer, p5.Graphics, or p5.Image | The source image to render. |

#### Example

```js
px.render(fbo);
```

#### See also...

- [...a semi-interactive example](https://tiash.is-cool.dev/pixelizerjs/demos/p5)

---

### `async asBabylon(engine, camera, scene, options?)`

Creates a Babylon.js post-processing pass. This function returns an asynchronous wrapper object containing the active Babylon `PostProcess` instance along with configuration methods that accept the same options as `makePixelizer()`.

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `engine` | `BABYLON.Engine` | The current Babylon engine instance. |
| `camera` | `BABYLON.Camera` | The camera to attach the post-processing pass to. |
| `scene` | `BABYLON.Scene` | The active Babylon scene. |
| `options` | Object | Configuration options. See the Options section below. |

#### Returns

| Type | Description |
| --- | --- |
| Object | An object containing the `PostProcess` instance as `postProcess`, and configuration methods. |

#### Example

```js
import * as BABYLON from "@babylonjs/core";
import { asBabylon } from "./pixelizer.js";

const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);

// Initialize the pixelizer post-process asynchronously
const pixelizerPass = await asBabylon(
  engine,
  camera,
  scene,
  {
    initialSqSize: 5,
    dithering: true,
  }
);
```

#### See also...

- [...a semi-interactive example](https://tiash.is-cool.dev/pixelizerjs/demos/babylon)

---

### `getWebGLSource()`

Returns the shader sources used internally by Pixelizer. This function is exported for advanced use cases involving custom WebGL integrations.

#### Parameters

None.

#### Returns

| Property | Type | Description |
|-----------|------|-------------|
| `vertexShader` | String | The generated vertex shader source. |
| `fragmentShader` | String | The generated fragment shader source. |

#### Example

```js
const {
  vertexShader,
  fragmentShader,
} = getWebGLSource();
```

---

## Common Methods

The objects returned by `makePixelizer()`, `asThreeJS()`, and `asP5()` provide a shared set of configuration methods.

### `pixelizer.setPixelSize(size)`

Changes the pixel size. This method updates the width and height of each generated pixel block and affects all future renders immediately.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `size` | Number | The new pixel size. |

#### Example

```js
pixelizer.setPixelSize(10);
```

### `pixelizer.setPalette(colors)`

Changes the active palette. This method replaces the currently loaded palette and affects all future renders immediately.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `colors` | Array of hexadecimal color strings | The new palette colors. |

#### Example

```js
pixelizer.setPalette([
  "000000",
  "ffffff",
]);
```

### `pixelizer.setDitherStrength(strength)`

Changes dithering strength. This method adjusts the influence of the Bayer dithering pattern and can be updated at runtime without recreating the Pixelizer instance.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `strength` | Number | The new dithering strength. |

#### Example

```js
pixelizer.setDitherStrength(0.15);
```

Typical values:

```text
0.00  No dithering
0.15  Default strength
0.30  Strong dithering
1.00  Extreme dithering
```



### `pixelizer.setPerfectlyAccurateMode(enabled)`

Changes the averaging mode. This method switches between the fast representative-sample algorithm and the exact averaging algorithm without recreating the Pixelizer instance.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `enabled` | Boolean | Whether perfectly accurate mode should be enabled. |

#### Example

```js
pixelizer.setPerfectlyAccurateMode(true);
```



### `pixelizer.pixelize(imageBitmap)`

Processes an image. This method applies pixelization, palette quantization, and dithering to an image and returns a new `ImageBitmap` containing the result.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `imageBitmap` | ImageBitmap | The image to process. |

#### Returns

| Type | Description |
|------|-------------|
| ImageBitmap | The processed image. |

#### Example

```js
const output =
  pixelizer.pixelize(inputBitmap);
```

## Common Options

The following options are accepted by `makePixelizer()`, `asThreeJS()`, and `asP5()`.

| Option | Default | Description |
|----------|----------|-------------|
| `initialSqSize` | `5` | Controls the width and height of each generated pixel block. |
| `palette` | Resurrect 64 by Kerrie Lake | Determines which colors Pixelizer may use when producing output. |
| `dithering` | `true` | Enables Bayer dithering. May also be a number specifying an explicit dithering strength. (If `true`, the strength is `0.15`.) |
| `perfectlyAccurate` | `false` | Controls how colors are selected for each pixel block. When disabled, Pixelizer uses a fast representative sample from the block, which is significantly faster and often produces a slightly more retro appearance. When enabled, Pixelizer computes the exact average color of every pixel within a block, which is slower, can produce subtle anti-aliasing, and may look smoother at small pixel sizes. |

### Example

```js
{
  initialSqSize: 10,

  dithering: true,

  perfectlyAccurate: false,

  palette: [
    // h3Rry F!z by ID Rando on Lospec
    "0d0a19",
    "ed2443",
    "58b6ef",
    "f3ecdd",
  ],
}
```

## See also...

- [README on GitHub](https://github.com/tiash-and-cats/pixelizerjs/blob/master/README.md)