import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Una instancia de módulo por caso, sin cambiar el tipo de módulos del proyecto.
const source = await readFile(new URL("../app/src/js/detector.js", import.meta.url), "utf8");
let instance = 0;
let shade = 128;
let surfaces = [];
function fakeCanvas() {
  const canvas = { width: 0, height: 0, draws: [], frame: null };
  const context = {
    drawImage: (...args) => canvas.draws.push(args),
    getImageData: (_x, _y, width, height) => ({ data: Uint8ClampedArray.from(
      { length: width * height * 4 }, (_, i) => i % 4 === 3 ? 255 : shade) }),
    putImageData: (frame) => { canvas.frame = frame; },
  };
  canvas.getContext = () => context;
  surfaces.push(canvas);
  return canvas;
}
async function fresh(load, ready = async () => {}) {
  shade = 128;
  surfaces = [];
  globalThis.document = { createElement: fakeCanvas };
  globalThis.tf = { ready };
  globalThis.cocoSsd = { load };
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${instance++}`);
}
const image = { complete: true, naturalWidth: 160, naturalHeight: 120 };
const prediction = (category, score = 0.8) => ({ class: category, score, bbox: [20, 30, 80, 90] });

test("carga concurrente comparte promesa y espera al backend", async () => {
  let readyDone = false;
  let loads = 0;
  const model = { detect() {} };
  const detector = await fresh(async (config) => {
    assert.equal(readyDone, true);
    assert.deepEqual(config, { base: "lite_mobilenet_v2" });
    loads++;
    return model;
  }, async () => { readyDone = true; });
  const first = detector.loadModel();
  assert.strictEqual(first, detector.loadModel());
  assert.strictEqual(await first, model);
  assert.strictEqual(await detector.loadModel(), model);
  assert.equal(loads, 1);
});

test("fallo de descarga compartido permite un reintento posterior", async () => {
  let attempts = 0;
  const failure = new Error("descarga bloqueada");
  const model = {};
  const detector = await fresh(async () => {
    if (++attempts === 1) throw failure;
    return model;
  });
  const first = detector.loadModel();
  const second = detector.loadModel();
  assert.strictEqual(first, second);
  const results = await Promise.allSettled([first, second]);
  assert(results.every((r) => r.status === "rejected" && r.reason.cause === failure));
  assert.strictEqual(await detector.loadModel(), model);
  assert.equal(attempts, 2);
});

test("bibliotecas ausentes y fallo del backend no envenenan la caché", async () => {
  const detector = await fresh(async () => ({}));
  delete globalThis.cocoSsd;
  await assert.rejects(detector.loadModel(), /No se pudo cargar/);
  globalThis.cocoSsd = { load: async () => ({}) };
  globalThis.tf.ready = async () => { throw new Error("backend"); };
  await assert.rejects(detector.loadModel(), /No se pudo cargar/);
  globalThis.tf.ready = async () => {};
  assert.deepEqual(await detector.loadModel(), {});
});

test("filtra cuatro categorías y umbral inclusivo sin modificar predicciones", async () => {
  const input = [prediction("car", 0.5), prediction("motorcycle"), prediction("bus"),
    prediction("truck"), prediction("person"), prediction("bicycle"),
    prediction("car", 0.49), prediction("car", NaN)];
  input.forEach((p, i) => { p.bbox = [i * 15, 10, 10, 10]; });
  const original = structuredClone(input);
  const detector = await fresh(async () => ({ detect: async () => input }));
  const output = await detector.detectVehicles(image, 0.5);
  assert.deepEqual(output.map((p) => p.class).sort(), ["bus", "car", "motorcycle", "truck"]);
  assert.deepEqual(output.find(p => p.class === "car"), original[0]);
  output[0].bbox[0] = 999;
  assert.deepEqual(input, original);
});

test("dos análisis reutilizan el modelo y pasan imagen, límite 100 y umbral", async () => {
  let loads = 0;
  const calls = [];
  const detector = await fresh(async () => {
    loads++;
    return { detect: async (...args) => { calls.push(args); return [prediction("car", 0.4)]; } };
  });
  assert.equal((await detector.detectVehicles(image, 0.3)).length, 1);
  assert.deepEqual(await detector.detectVehicles(image, 0.7), []);
  assert.deepEqual(calls, [[image, 100, 0.3], [image, 100, 0.7]]);
  assert.equal(loads, 1);
});

test("no trunca en 20 una lista densa simulada", async () => {
  const detector = await fresh(async () => ({ detect: async (_image, maximum) =>
    Array.from({ length: 75 }, (_, i) => ({ ...prediction("car"), bbox: [i * 2, 10, 1, 1] })).slice(0, maximum) }));
  assert.equal((await detector.detectVehicles(image)).length, 75);
});

test("lista vacía y objetos ajenos a vehículos devuelven cero detecciones", async () => {
  let calls = 0;
  const detector = await fresh(async () => ({ detect: async () =>
    calls++ === 0 ? [] : [prediction("dog"), prediction("person")] }));
  assert.deepEqual(await detector.detectVehicles(image), []);
  assert.deepEqual(await detector.detectVehicles(image), []);
});

test("fallo de inferencia llega al coordinador y no vuelve a descargar el modelo", async () => {
  let calls = 0;
  let loads = 0;
  const failure = new Error("inferencia interrumpida");
  const detector = await fresh(async () => {
    loads++;
    return { detect: async () => { if (++calls === 1) throw failure; return []; } };
  });
  await assert.rejects(detector.detectVehicles(image), (error) => error === failure);
  assert.deepEqual(await detector.detectVehicles(image), []);
  assert.equal(loads, 1);
});

test("rechaza imágenes no cargadas y umbrales inválidos antes de descargar", async () => {
  let loads = 0;
  const detector = await fresh(async () => { loads++; return {}; });
  for (const threshold of [-0.1, 1.1, NaN, Infinity, "0.5", null]) {
    await assert.rejects(detector.detectVehicles(image, threshold), RangeError);
  }
  for (const invalid of [null, {}, { ...image, complete: false }, { ...image, naturalWidth: 0 }]) {
    await assert.rejects(detector.detectVehicles(invalid), /fotografía debe estar cargada/);
  }
  assert.equal(loads, 0);
});

test("acepta los extremos 0 y 1 del umbral", async () => {
  const detector = await fresh(async () => ({ detect: async () => [prediction("car", 1)] }));
  assert.equal((await detector.detectVehicles(image, 0)).length, 1);
  assert.equal((await detector.detectVehicles(image, 1)).length, 1);
});

test.after(() => { delete globalThis.tf; delete globalThis.cocoSsd; delete globalThis.document; });

test("usa 0.4 como umbral predeterminado y acepta su límite", async () => {
  const input = [
    prediction("car", 0.4),
    prediction("motorcycle", 0.39),
  ];

  let receivedThreshold;

  const detector = await fresh(async () => ({
    detect: async (_image, _maximum, threshold) => {
      receivedThreshold = threshold;
      return input;
    },
  }));

  assert.equal(detector.DEFAULT_MIN_CONFIDENCE, 0.4);

  const output = await detector.detectVehicles(image);

  assert.equal(receivedThreshold, 0.4);
  assert.deepEqual(output, [input[0]]);
});

test("aclara solo imágenes oscuras y conserva alfa y dimensiones originales", async () => {
  const inputs = [];
  const detector = await fresh(async () => ({ detect: async (input) => { inputs.push(input); return []; } }));
  shade = 25;
  await detector.detectVehicles(image);
  assert.equal(inputs.length, 2);
  assert.strictEqual(inputs[0], image);
  assert.equal(inputs[1].width, image.naturalWidth);
  assert.equal(inputs[1].frame.data[0], Math.round(255 * (25 / 255) ** 0.6));
  assert.equal(inputs[1].frame.data[3], 255);
  assert.equal(image.naturalWidth, 160);
});

test("reubica recortes reducidos y descarta fragmentos en bordes internos", async () => {
  let calls = 0;
  const inputs = [];
  const detector = await fresh(async () => ({ detect: async (input) => {
    inputs.push(input);
    calls++;
    if (calls === 5) return [
      { class: "car", score: 0.8, bbox: [100, 100, 100, 80] },
      { class: "car", score: 0.9, bbox: [0, 100, 50, 50] },
    ];
    return [];
  } }));
  const output = await detector.detectVehicles({ ...image, naturalWidth: 2560, naturalHeight: 1600 });
  assert.equal(calls, 5);
  assert.equal(inputs[4].width, 768);
  assert.deepEqual(output, [{ class: "car", score: 0.8, bbox: [1224, 840, 200, 160] }]);
});

test("une duplicados entre clases conservando vehículos vecinos y la mayor confianza", async () => {
  const detector = await fresh(async () => ({ detect: async () => [
    { class: "car", score: 0.6, bbox: [10, 10, 40, 40] },
    { class: "truck", score: 0.9, bbox: [12, 12, 40, 40] },
    { class: "car", score: 0.8, bbox: [55, 10, 40, 40] },
  ] }));
  const output = await detector.detectVehicles(image);
  assert.equal(output.length, 2);
  assert.equal(output[0].class, "truck");
  assert.deepEqual(output[1].bbox, [55, 10, 40, 40]);
});

test("rechaza recuadros inválidos y acota los que exceden la fotografía", async () => {
  const detector = await fresh(async () => ({ detect: async () => [
    { ...prediction("car"), bbox: [-5, -5, 30, 30] },
    { ...prediction("car"), bbox: [200, 0, 20, 20] },
    { ...prediction("car"), bbox: [0, 0, -2, 20] },
    { ...prediction("car"), bbox: [NaN, 0, 20, 20] },
  ] }));
  assert.deepEqual((await detector.detectVehicles(image)).map(d => d.bbox), [[0, 0, 25, 25]]);
});

test("un fallo en una vista adicional se propaga, sin entregar resultados parciales", async () => {
  let calls = 0;
  const detector = await fresh(async () => ({ detect: async () => {
    if (++calls === 2) throw new Error("falló el recorte");
    return [prediction("car")];
  } }));
  await assert.rejects(detector.detectVehicles({ ...image, naturalWidth: 800, naturalHeight: 600 }), /falló el recorte/);
});
