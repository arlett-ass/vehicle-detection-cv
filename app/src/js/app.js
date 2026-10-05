/**
 * Coordina la selección, validación y carga de fotografías,
 * y conecta detección, conteo y dibujo.
 * Cada selección tiene un identificador para descartar
 * respuestas de una fotografía anterior.
 */

const imageInput = document.querySelector("#image-input");
const cameraInput = document.querySelector("#camera-input");
const preview = document.querySelector("#preview");
const statusElement = document.querySelector("#status");

const analyzeButton = document.querySelector("#analyze-button");
const canvas = document.querySelector("#detection-canvas");

const imageComparison = document.querySelector("#image-comparison");
const analysisPanel = document.querySelector("#analysis-panel");
const detectionDetails = document.querySelector("#detection-details");
const detectionList = document.querySelector("#detection-list");

const emptyState = document.querySelector("#empty-state");

const countElements = {
  car: document.querySelector("#count-car"),
  motorcycle: document.querySelector("#count-motorcycle"),
  bus: document.querySelector("#count-bus"),
  truck: document.querySelector("#count-truck"),
  total: document.querySelector("#count-total"),
};

let analysisInProgress = false;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STATES = Object.freeze({
  EMPTY: "sin-imagen",
  LOADING_IMAGE: "cargando-imagen",
  IMAGE_READY: "imagen-lista",
  LOADING_MODEL: "cargando-modelo",
  ANALYZING: "analizando",
  FINISHED: "terminado",
  ERROR: "error",
});

let currentState = STATES.EMPTY;
let currentImage = null;
let currentImageUrl = null;
let selectionId = 0;

/**
 * Actualiza el estado y su mensaje visible.
 * El atributo data-state permite comprobarlo en el navegador.
 */
function setState(state, message) {
  currentState = state;
  statusElement.dataset.state = state;
  statusElement.textContent = message;

  analyzeButton.disabled = currentImage === null || analysisInProgress;
  imageInput.disabled = analysisInProgress;
  cameraInput.disabled = analysisInProgress;

  emptyState.hidden = currentImage !== null;
  imageComparison.hidden = currentImage === null;
}

/**
 * Retira los resultados anteriores sin borrar la fotografía original.
 */
function resetResults() {
  canvas.hidden = true;
  analysisPanel.hidden = true;
  detectionDetails.hidden = true;
  detectionList.replaceChildren();

  const context = canvas.getContext("2d");

  if (context !== null) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  for (const element of Object.values(countElements)) {
    element.textContent = "—";
  }

  preview.hidden = currentImage === null;
}

/**
 * Muestra los conteos recibidos del módulo counter.
 */
function showCounts(counts) {
  for (const [category, element] of Object.entries(countElements)) {
    element.textContent = String(counts[category]);
  }
}

/**
 * Retira la fotografía anterior y libera su URL temporal además de limpiar el canvas y conteos anteriores.
 */
function clearImage() {
  currentImage = null;
  preview.hidden = true;
  preview.removeAttribute("src");

  if (currentImageUrl !== null) {
    URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = null;
  }

  resetResults();
}

/**
 * Comprueba formato y tamaño antes de intentar abrir el archivo.
 * Devuelve un mensaje de error o null si cumple las condiciones.
 */
function validateFile(file) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Selecciona una imagen JPG o PNG.";
  }

  if (file.size === 0) {
    return "El archivo está vacío. Selecciona otra imagen.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "La imagen debe pesar como máximo 10 MB.";
  }

  return null;
}

/**
 * Carga una imagen independiente de la vista previa.
 * Resuelve solo cuando el navegador puede leer sus dimensiones.
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      image.onload = null;
      image.onerror = null;

      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error("La imagen no tiene dimensiones válidas."));
        return;
      }

      resolve(image);
    };

    image.onerror = () => {
      image.onload = null;
      image.onerror = null;
      reject(new Error("No se pudo abrir la imagen."));
    };

    image.src = url;
  });
}

/**
 * Valida y carga la nueva fotografía.
 * Descarta cualquier respuesta de una selección anterior.
 */
async function handleImageSelection(event) {
  const selectedInput = event.currentTarget;
  const requestId = ++selectionId;

  clearImage();

  const file = selectedInput.files[0];

  if (!file) {
    setState(
      STATES.EMPTY,
      "Selecciona una imagen para visualizarla."
    );
    return;
  }

  const validationError = validateFile(file);

  if (validationError !== null) {
    selectedInput.value = "";
    setState(STATES.ERROR, validationError);
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  currentImageUrl = imageUrl;

  setState(STATES.LOADING_IMAGE, "Cargando imagen...");

  try {
    const image = await loadImage(imageUrl);

    if (requestId !== selectionId) {
      return;
    }

    currentImage = image;
    preview.src = imageUrl;
    preview.hidden = false;

    setState(
      STATES.IMAGE_READY,
      `Imagen cargada: ${image.naturalWidth} × ` +
        `${image.naturalHeight} píxeles. ` +
        "Pulsa «Analizar vehículos» para iniciar."
    );
  } catch (error) {
    if (requestId !== selectionId) {
      return;
    }

    clearImage();
    selectedInput.value = "";

    setState(
      STATES.ERROR,
      "No se pudo abrir la imagen. Prueba con otro archivo."
    );

    console.error("Error al cargar la fotografía:", error);
  }
}

function showDetectionDetails(detections) {
  const labels = {
    car: "Automóvil",
    motorcycle: "Motocicleta",
    bus: "Autobús",
    truck: "Camión",
  };

  detectionList.replaceChildren();

  detections.forEach((detection, index) => {
    const item = document.createElement("li");
    const confidence = Math.round(detection.score * 100);

    item.textContent =
      `#${index + 1} · ${labels[detection.class]} · ${confidence} %`;

    detectionList.append(item);
  });

  if (detections.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No se detectaron vehículos.";
    detectionList.append(item);
  }

  detectionDetails.hidden = false;
}

/**
 * Conecta los módulos reales y coordina un análisis.
 * Bloquea ejecuciones simultáneas y recupera controles ante errores.
 */
async function handleAnalysis() {
  if (currentImage === null || analysisInProgress) {
    return;
  }

  const imageToAnalyze = currentImage;
  const requestId = selectionId;

  analysisInProgress = true;
  resetResults();

  try {
    setState(
      STATES.LOADING_MODEL,
      "Preparando el modelo de detección..."
    );

    const detector = await import("./detector.js");
    const counter = await import("./counter.js");
    const renderer = await import("./renderer.js");

    if (
      typeof detector.loadModel !== "function" ||
      typeof detector.detectVehicles !== "function" ||
      typeof counter.countVehicles !== "function" ||
      typeof renderer.renderDetections !== "function"
    ) {
      throw new Error("MODULES_PENDING");
    }

    await detector.loadModel();

    if (requestId !== selectionId) {
      return;
    }

    setState(STATES.ANALYZING, "Analizando vehículos...");

    const detections = await detector.detectVehicles(imageToAnalyze);

    if (requestId !== selectionId) {
      return;
    }

    const counts = counter.countVehicles(detections);

    await renderer.renderDetections(
      canvas,
      imageToAnalyze,
      detections
    );

    if (requestId !== selectionId) {
      return;
    }

    showCounts(counts);
    showDetectionDetails(detections);

    canvas.hidden = false;
    analysisPanel.hidden = false;
    preview.hidden = false;

    setState(
      STATES.FINISHED,
      `Análisis terminado. Vehículos detectados: ${counts.total}.`
    );
  } catch (error) {
    if (requestId !== selectionId) {
      return;
    }

    resetResults();

    const message = error.message === "MODULES_PENDING"
      ? "Los módulos de detección, conteo y dibujo no están disponibles."
      : "No se pudo completar el análisis. Inténtalo nuevamente; " +
    "si persiste, revisa el error en la consola.";

    setState(STATES.ERROR, message);

    console.error("Error durante el análisis:", error);
  } finally {
    analysisInProgress = false;
    setState(currentState, statusElement.textContent);
  }
}

imageInput.addEventListener("change", handleImageSelection);
cameraInput.addEventListener("change", handleImageSelection);
analyzeButton.addEventListener("click", handleAnalysis);

setState(
  STATES.EMPTY,
  "Selecciona una imagen para visualizarla."
);