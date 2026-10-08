/** Detección en el navegador; no entrena ni envía la fotografía a un servidor. */
// Se conserva el umbral acordado: mejorar la imagen no implica aceptar cualquier score.
export const DEFAULT_MIN_CONFIDENCE = 0.4;
// El límite se aplica a TODAS las clases antes de filtrar vehículos.
export const MAX_NUM_BOXES = 100;
export const MODEL_BASE = "lite_mobilenet_v2";

// Las copias auxiliares se limitan para controlar memoria y tiempo en el navegador.
const MAX_ANALYSIS_SIDE = 1280;
const DARK_LUMINANCE = 90; // Luminancia media de 0 (negro) a 255 (blanco).
const SHADOW_GAMMA = 0.6; // Un exponente menor que 1 aclara sombras sin cambiar coordenadas.
const MIN_TILED_SIDE = 320;
const TILE_FRACTION = 0.6; // Cuatro recortes con solapamiento para vehículos cercanos a bordes.
const DUPLICATE_IOU = 0.5; // Fracción de solapamiento para unir propuestas del mismo objeto.

const VEHICLE_CLASSES = new Set(["car", "motorcycle", "bus", "truck"]);
// Conserva la descarga en curso y después el modelo; no se vuelve a cargar por recorte.
let modelPromise = null;

/**
 * Comparte tanto la descarga en curso como el modelo ya cargado.
 * Una descarga fallida libera la promesa para que la siguiente llamada reintente.
 * Las bibliotecas se cargan, en orden y con versiones fijas, desde index.html.
 * @returns {Promise<import('@tensorflow-models/coco-ssd').ObjectDetection>}
 * @throws {Error} Si faltan bibliotecas, el backend falla o no se descargan pesos.
 */
export function loadModel() {
  if (modelPromise === null) {
    modelPromise = Promise.resolve().then(async () => {
      if (typeof globalThis.tf?.ready !== "function" ||
          typeof globalThis.cocoSsd?.load !== "function") {
        throw new Error(
          "No se cargaron TensorFlow.js y COCO-SSD. Revisa la conexión y recarga la página."
        );
      }
      await globalThis.tf.ready();
      return globalThis.cocoSsd.load({ base: MODEL_BASE });
    }).catch((cause) => {
      modelPromise = null;
      throw new Error(
        "No se pudo cargar el modelo. Revisa la conexión e inténtalo nuevamente.",
        { cause }
      );
    });
  }
  return modelPromise;
}

/** Crea una superficie auxiliar; nunca cambia la imagen ni el Canvas de Emir. */
function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("No se pudo preparar la fotografía para analizarla.");
  return { canvas, context };
}

/**
 * Prepara la vista original y, cuando corresponde, una copia aclarada y cuatro
 * recortes. El modelo reduce cada entrada a su resolución interna: los recortes
 * hacen que un vehículo pequeño ocupe más píxeles durante la inferencia.
 * Cada vista conserva su origen y escala respecto de la fotografía original.
 */
function prepareViews(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const views = [{ input: image, x: 0, y: 0, scaleX: 1, scaleY: 1 }];
  const sample = makeCanvas(64, 64);
  sample.context.drawImage(image, 0, 0, 64, 64);
  const pixels = sample.context.getImageData(0, 0, 64, 64).data;
  let luminance = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    luminance += 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
  }
  const isDark = luminance / (pixels.length / 4) < DARK_LUMINANCE;
  const useTiles = Math.min(width, height) >= MIN_TILED_SIDE;
  if (!isDark && !useTiles) return views;

  const ratio = Math.min(1, MAX_ANALYSIS_SIDE / Math.max(width, height));
  const work = makeCanvas(Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio)));
  const w = work.canvas.width;
  const h = work.canvas.height;
  const scaleX = width / w;
  const scaleY = height / h;
  work.context.drawImage(image, 0, 0, w, h);
  if (isDark) {
    // Tabla de 256 valores: evita calcular una potencia por cada canal y píxel.
    const table = Array.from({ length: 256 }, (_, value) => Math.round(255 * (value / 255) ** SHADOW_GAMMA));
    const frame = work.context.getImageData(0, 0, w, h);
    for (let i = 0; i < frame.data.length; i += 4) {
      frame.data[i] = table[frame.data[i]];
      frame.data[i + 1] = table[frame.data[i + 1]];
      frame.data[i + 2] = table[frame.data[i + 2]];
    }
    work.context.putImageData(frame, 0, 0);
    views.push({ input: work.canvas, x: 0, y: 0, scaleX, scaleY });
  }
  if (useTiles) {
    const tileWidth = Math.ceil(w * TILE_FRACTION);
    const tileHeight = Math.ceil(h * TILE_FRACTION);
    for (const y of [0, h - tileHeight]) {
      for (const x of [0, w - tileWidth]) {
        const tile = makeCanvas(tileWidth, tileHeight);
        tile.context.drawImage(work.canvas, x, y, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
        views.push({ input: tile.canvas, x: x * scaleX, y: y * scaleY, scaleX, scaleY,
          edges: { left: x > 0, top: y > 0, right: x + tileWidth < w, bottom: y + tileHeight < h } });
      }
    }
  }
  return views;
}

/** Devuelve intersección / unión de dos recuadros [x, y, ancho, alto]. */
function intersectionOverUnion(a, b) {
  const width = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
  const height = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  const intersection = width * height;
  return intersection / (a[2] * a[3] + b[2] * b[3] - intersection);
}

/**
 * Une propuestas repetidas de distintas vistas, incluso si una dice car y otra
 * truck. Conserva la de mayor confianza, sin alterar las predicciones originales.
 * No divide un recuadro que el modelo haya asignado a dos vehículos juntos.
 */
function removeDuplicates(detections) {
  const selected = [];
  for (const detection of [...detections].sort((a, b) => b.score - a.score)) {
    if (!selected.some((other) => intersectionOverUnion(other.bbox, detection.bbox) > DUPLICATE_IOU)) {
      selected.push(detection);
      if (selected.length === MAX_NUM_BOXES) break;
    }
  }
  return selected;
}

/**
 * Analiza la fotografía en varias vistas y entrega una única lista a conteo y
 * dibujo. Mantiene class, score y bbox en píxeles de la fotografía original.
 * @param {HTMLImageElement} image Fotografía ya cargada y accesible al Canvas.
 * @param {number} [minConfidence=0.4] Confianza mínima, entre 0 y 1 inclusive.
 * @returns {Promise<Array<{class: string, score: number, bbox: number[]}>>}
 *   Una lista vacía es válida. La mejora de sombras no recupera detalles ausentes.
 * @throws {Error} Entrada inválida, error de Canvas, descarga o inferencia.
 */
export async function detectVehicles(image, minConfidence = DEFAULT_MIN_CONFIDENCE) {
  if (!Number.isFinite(minConfidence) || minConfidence < 0 || minConfidence > 1) {
    throw new RangeError("La confianza mínima debe ser un número entre 0 y 1.");
  }
  if (!image?.complete || !(image.naturalWidth > 0) || !(image.naturalHeight > 0)) {
    throw new Error("La fotografía debe estar cargada antes de analizarla.");
  }
  const model = await loadModel();
  const candidates = [];
  // Inferencias secuenciales: comparten modelo y evitan competir por el backend.
  for (const view of prepareViews(image)) {
    const predictions = await model.detect(view.input, MAX_NUM_BOXES, minConfidence);
    for (const prediction of predictions) {
      if (!VEHICLE_CLASSES.has(prediction.class) || !Number.isFinite(prediction.score) ||
          prediction.score < minConfidence || !Array.isArray(prediction.bbox) ||
          prediction.bbox.length !== 4 || !prediction.bbox.every(Number.isFinite)) continue;
      const [x, y, width, height] = prediction.bbox;
      if (width <= 0 || height <= 0) continue;
      // Un objeto cortado por un borde interno puede parecer otro vehículo.
      // Otra vista solapada o la fotografía completa conserva su contexto.
      if (view.edges) {
        const marginX = view.input.width * 0.03;
        const marginY = view.input.height * 0.03;
        if ((view.edges.left && x < marginX) || (view.edges.top && y < marginY) ||
            (view.edges.right && x + width > view.input.width - marginX) ||
            (view.edges.bottom && y + height > view.input.height - marginY)) continue;
      }
      // Reubicar cada recorte antes de deduplicar; acotar a los bordes de la foto.
      const left = Math.max(0, view.x + x * view.scaleX);
      const top = Math.max(0, view.y + y * view.scaleY);
      const right = Math.min(image.naturalWidth, view.x + (x + width) * view.scaleX);
      const bottom = Math.min(image.naturalHeight, view.y + (y + height) * view.scaleY);
      if (right <= left || bottom <= top) continue;
      candidates.push({ class: prediction.class, score: prediction.score,
        bbox: [left, top, right - left, bottom - top] });
    }
  }
  return removeDuplicates(candidates);
}
