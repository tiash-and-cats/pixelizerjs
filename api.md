# API Reference

## `makePixelizer(options?)`

Creates a standalone Pixelizer instance. This function creates an image processor capable of transforming `ImageBitmap` objects using pixelization, palette quantization, and Bayer dithering.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | Object | Configuration options. See the Options section below. |

### Returns

| Type | Description |
|------|-------------|
| Object | A Pixelizer instance. |

### Example

```js
import makePixelizer from "./pixelizer.js";

const pixelizer = makePixelizer();
```



## `pixelizer.pixelize(imageBitmap)`

Processes an image. This method applies pixelization, palette quantization, and dithering to an image and returns a new `ImageBitmap` containing the result.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `imageBitmap` | ImageBitmap | The image to process. |

### Returns

| Type | Description |
|------|-------------|
| ImageBitmap | The processed image. |

### Example

```js
const output =
  pixelizer.pixelize(inputBitmap);
```



## `pixelizer.setPixelSize(size)`

Changes the pixel size. This method updates the width and height of each generated pixel block and affects all future renders immediately.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `size` | Number | The new pixel size. |

### Example

```js
pixelizer.setPixelSize(10);
```



## `pixelizer.setPalette(colors)`

Changes the active palette. This method replaces the currently loaded palette and affects all future renders immediately.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `colors` | Array of hexadecimal color strings | The new palette colors. |

### Example

```js
pixelizer.setPalette([
  "000000",
  "ffffff",
]);
```



## `pixelizer.setDitherStrength(strength)`

Changes dithering strength. This method adjusts the influence of the Bayer dithering pattern and can be updated at runtime without recreating the Pixelizer instance.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `strength` | Number | The new dithering strength. |

### Example

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



## `pixelizer.setPerfectlyAccurateMode(enabled)`

Changes the averaging mode. This method switches between the fast representative-sample algorithm and the exact averaging algorithm without recreating the Pixelizer instance.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `enabled` | Boolean | Whether perfectly accurate mode should be enabled. |

### Example

```js
pixelizer.setPerfectlyAccurateMode(true);
```



# Three.js Integration

## `async asThreeJS(options?)`

Creates a Three.js post-processing pass. This function returns an object compatible with `EffectComposer` and accepts the same configuration options as `makePixelizer()`.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | Object | Configuration options. See the Options section below. |

### Returns

| Type | Description |
|------|-------------|
| Pass | A Three.js post-processing pass. |

### Example

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



## `pixelizer.setPixelSize(size)`

Changes the pixel size. This method immediately updates the post-processing effect.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `size` | Number | The new pixel size. |



## `pixelizer.setPalette(colors)`

Changes the active palette. This method immediately updates the post-processing effect.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `colors` | Array of hexadecimal color strings | The new palette colors. |



## `pixelizer.setDitherStrength(strength)`

Changes dithering strength. This method immediately updates the post-processing effect.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `strength` | Number | The new dithering strength. |



## `pixelizer.setPerfectlyAccurateMode(enabled)`

Changes the averaging mode. This method immediately switches between representative sampling and exact averaging.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `enabled` | Boolean | Whether perfectly accurate mode should be enabled. |



# Shader Access

## `getWebGLSource()`

Returns the shader sources used internally by Pixelizer. This function is intended for advanced use cases involving custom WebGL integrations.

### Parameters

None.

### Returns

| Property | Type | Description |
|-----------|------|-------------|
| `vertexShader` | String | The generated vertex shader source. |
| `fragmentShader` | String | The generated fragment shader source. |

### Example

```js
const {
  vertexShader,
  fragmentShader,
} = getWebGLSource();
```

# Options

The following options are accepted by both `makePixelizer()` and `asThreeJS()`.

| Option | Default | Description |
|----------|----------|-------------|
| `initialSqSize` | `5` | Controls the width and height of each generated pixel block. |
| `palette` | Resurrect 64 by Kerrie Lake | Determines which colors Pixelizer may use when producing output. |
| `dithering` | `true` | Determines whether Bayer dithering is enabled when the Pixelizer instance is created. |
| `perfectlyAccurate` | `false` | Controls how colors are selected for each pixel block. When disabled, Pixelizer uses a fast representative sample from the block, which is significantly faster and often produces a slightly more retro appearance. When enabled, Pixelizer computes the exact average color of every pixel within a block, which is slower, can produce subtle anti-aliasing, and may look smoother at small pixel sizes. |

## Example

```js
{
  initialSqSize: 10,
  dithering: true,
  perfectlyAccurate: false,
  palette: [
    // (h3Rry F!z by ID Rando on Lospec
    "0d0a19",
    "ed2443",
    "58b6ef",
    "f3ecdd",
  ],
}
```

# See also...

- [... the README on GitHub](https://github.com/tiash-and-cats/pixelizerjs/blob/master/README.md)