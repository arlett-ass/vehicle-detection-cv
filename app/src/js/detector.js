/** Detección en el navegador; no entrena ni envía la fotografía a un servidor. */
export const DEFAULT_MIN_CONFIDENCE = 0.5;
// El límite se aplica a TODAS las clases antes de filtrar vehículos.
export const MAX_NUM_BOXES = 100;
export const MODEL_BASE = "lite_mobilenet_v2";

const VEHICLE_CLASSES = new Set(["car", "motorcycle", "bus", "truck"]);
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

/**
 * Analiza una fotografía ya cargada, en sus dimensiones naturales.
 * Conserva class, score y bbox [x, y, ancho, alto] en píxeles originales.
 * Conteo y dibujo deben utilizar esta misma lista sin volver a filtrarla.
 * @param {HTMLImageElement} image Fotografía con carga/decodificación terminada.
 * @param {number} [minConfidence=0.5] Umbral entre 0 y 1, inclusivo.
 * @returns {Promise<Array<{class: string, score: number, bbox: number[]}>>}
 *   Una lista vacía es un resultado válido, no un fallo.
 * @throws {Error} Entrada inválida, error de carga o error de inferencia.
 */
export async function detectVehicles(image, minConfidence = DEFAULT_MIN_CONFIDENCE) {
  if (!Number.isFinite(minConfidence) || minConfidence < 0 || minConfidence > 1) {
    throw new RangeError("La confianza mínima debe ser un número entre 0 y 1.");
  }
  if (!image?.complete || !(image.naturalWidth > 0) || !(image.naturalHeight > 0)) {
    throw new Error("La fotografía debe estar cargada antes de analizarla.");
  }

  const model = await loadModel();
  // Pasar el umbral al modelo permite usar valores menores a su 0.5 predeterminado.
  // Los errores se propagan a app.js para que restaure controles y muestre el fallo.
  const predictions = await model.detect(image, MAX_NUM_BOXES, minConfidence);
  return predictions
    .filter((prediction) => VEHICLE_CLASSES.has(prediction.class) &&
      Number.isFinite(prediction.score) && prediction.score >= minConfidence)
    .map(({ class: category, score, bbox }) => ({
      class: category,
      score,
      bbox: [...bbox],
    }));
}
