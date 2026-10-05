import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Una instancia de módulo por caso, sin cambiar el tipo de módulos del proyecto.
const source = await readFile(new URL("../app/src/js/detector.js", import.meta.url), "utf8");
let instance = 0;
async function fresh(load, ready = async () => {}) {
  globalThis.tf = { ready };
  globalThis.cocoSsd = { load };
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${instance++}`);
}
const image = { complete: true, naturalWidth: 1600, naturalHeight: 1200 };
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
  const original = structuredClone(input);
  const detector = await fresh(async () => ({ detect: async () => input }));
  const output = await detector.detectVehicles(image, 0.5);
  assert.deepEqual(output.map((p) => p.class), ["car", "motorcycle", "bus", "truck"]);
  assert.deepEqual(output[0], original[0]);
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
    Array.from({ length: 75 }, () => prediction("car")).slice(0, maximum) }));
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

test.after(() => { delete globalThis.tf; delete globalThis.cocoSsd; });

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