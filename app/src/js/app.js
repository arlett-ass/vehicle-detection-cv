/**
 * app.js
 *
 * Coordina la interacción principal de la aplicación:
 * - Selección de imágenes desde el dispositivo o la cámara.
 * - Validación del archivo seleccionado.
 * - Carga y vista previa de la fotografía.
 * - Inicio y control del análisis.
 * - Comunicación con los módulos de detección, conteo y renderizado.
 * - Actualización de los resultados mostrados al usuario.
 *
 * Este archivo no realiza directamente la detección de vehículos.
 * Su función es coordinar los diferentes módulos que realizan cada tarea.
 *
 * Además, cada selección de imagen recibe un identificador para evitar
 * que una respuesta de una imagen anterior sobrescriba los resultados
 * de una selección más reciente.
 */

// Elementos de la interfaz que se utilizan durante el flujo de análisis.
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

/**
 * Referencias a los elementos donde se muestran los conteos.
 *
 * Las claves corresponden con las clases que devuelve el detector:
 * car, motorcycle, bus y truck.
 *
 * También se incluye "total" para mostrar la cantidad total
 * de vehículos detectados.
 */
const countElements = {
  car: document.querySelector("#count-car"),
  motorcycle: document.querySelector("#count-motorcycle"),
  bus: document.querySelector("#count-bus"),
  truck: document.querySelector("#count-truck"),
  total: document.querySelector("#count-total"),
};

// Evita que el usuario inicie más de un análisis al mismo tiempo.
let analysisInProgress = false;

/**
 * Tipos de archivo que la aplicación acepta como entrada.
 *
 * Se utiliza un Set porque permite comprobar de manera sencilla
 * si el tipo MIME del archivo seleccionado pertenece a los formatos
 * permitidos.
 */
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

/**
 * Tamaño máximo permitido para las imágenes.
 *
 * 10 * 1024 * 1024 representa 10 megabytes expresados en bytes.
 * Limitar el tamaño evita intentar procesar archivos demasiado grandes.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Estados posibles de la aplicación.
 *
 * Object.freeze evita que estos valores sean modificados accidentalmente
 * durante la ejecución del programa.
 *
 * Los estados permiten saber en qué parte del flujo se encuentra
 * actualmente la aplicación y mostrar un mensaje adecuado al usuario.
 */
const STATES = Object.freeze({
  EMPTY: "sin-imagen",
  LOADING_IMAGE: "cargando-imagen",
  IMAGE_READY: "imagen-lista",
  LOADING_MODEL: "cargando-modelo",
  ANALYZING: "analizando",
  FINISHED: "terminado",
  ERROR: "error",
});

// Al iniciar la aplicación todavía no existe ninguna imagen seleccionada.
let currentState = STATES.EMPTY;

// Guarda la imagen que actualmente será analizada.
let currentImage = null;

// Guarda la URL temporal creada para mostrar la imagen seleccionada.
let currentImageUrl = null;

/**
 * Identificador de la selección actual.
 *
 * Cada vez que el usuario selecciona una nueva imagen se incrementa.
 * Esto permite comprobar si una operación asíncrona pertenece todavía
 * a la imagen actual o si ya corresponde a una selección anterior.
 */
let selectionId = 0;

/**
 * Actualiza el estado interno de la aplicación y los elementos visibles.
 *
 * @param {string} state - Estado actual de la aplicación.
 * @param {string} message - Mensaje que se mostrará al usuario.
 */
function setState(state, message) {
  currentState = state;

  // Guarda el estado también en el atributo data-state del elemento.
  // Esto permite consultarlo desde el navegador o utilizarlo para estilos CSS.
  statusElement.dataset.state = state;

  // Actualiza el mensaje que informa al usuario qué está sucediendo.
  statusElement.textContent = message;

  // El botón solo puede utilizarse cuando existe una imagen
  // y no hay otro análisis en ejecución.
  analyzeButton.disabled =
    currentImage === null || analysisInProgress;

  // Durante el análisis se deshabilitan los selectores de imagen
  // para evitar cambiar de archivo mientras se procesa el anterior.
  imageInput.disabled = analysisInProgress;
  cameraInput.disabled = analysisInProgress;

  // Si no hay imagen, se muestra el estado inicial.
  emptyState.hidden = currentImage !== null;

  // La comparación solo tiene sentido cuando existe una imagen seleccionada.
  imageComparison.hidden = currentImage === null;
}

/**
 * Limpia los resultados del análisis anterior.
 *
 * La fotografía original no se elimina; únicamente se retiran
 * las detecciones, conteos y elementos gráficos generados anteriormente.
 */
function resetResults() {
  // Oculta el canvas y el panel mientras no existan resultados actuales.
  canvas.hidden = true;
  analysisPanel.hidden = true;
  detectionDetails.hidden = true;

  // Elimina los elementos de la lista de detecciones anteriores.
  detectionList.replaceChildren();

  // Obtiene el contexto de dibujo del canvas para poder limpiarlo.
  const context = canvas.getContext("2d");

  if (context !== null) {
    // Borra todo el contenido dibujado anteriormente.
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Restablece los contadores visuales hasta que exista un nuevo análisis.
  for (const element of Object.values(countElements)) {
    element.textContent = "—";
  }

  // La vista previa permanece visible solamente si existe una imagen actual.
  preview.hidden = currentImage === null;
}

/**
 * Muestra en la interfaz los conteos obtenidos por el módulo counter.
 *
 * @param {Object} counts - Objeto con el número de vehículos detectados
 *                          por categoría y el total.
 */
function showCounts(counts) {
  // Recorre cada contador y coloca el valor correspondiente
  // en el elemento de la interfaz.
  for (const [category, element] of Object.entries(countElements)) {
    element.textContent = String(counts[category]);
  }
}

/**
 * Elimina completamente la fotografía actual.
 *
 * También libera la URL temporal creada mediante createObjectURL()
 * para evitar mantener innecesariamente el recurso en memoria.
 */
function clearImage() {
  // Elimina la referencia a la imagen que se estaba utilizando.
  currentImage = null;

  // Oculta y limpia la vista previa.
  preview.hidden = true;
  preview.removeAttribute("src");

  // Si existe una URL temporal, se libera porque ya no será utilizada.
  if (currentImageUrl !== null) {
    URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = null;
  }

  // También se eliminan los resultados asociados a la imagen anterior.
  resetResults();
}

/**
 * Comprueba que el archivo seleccionado tenga un formato y tamaño válidos.
 *
 * @param {File} file - Archivo seleccionado por el usuario.
 * @returns {string|null} Mensaje de error si no cumple las condiciones;
 *                        null si el archivo es válido.
 */
function validateFile(file) {
  // Comprueba que el formato MIME sea JPG/JPEG o PNG.
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Selecciona una imagen JPG o PNG.";
  }

  // Evita intentar procesar archivos sin contenido.
  if (file.size === 0) {
    return "El archivo está vacío. Selecciona otra imagen.";
  }

  // Evita cargar imágenes que superen el límite establecido.
  if (file.size > MAX_FILE_SIZE) {
    return "La imagen debe pesar como máximo 10 MB.";
  }

  // null indica que no se encontró ningún problema.
  return null;
}

/**
 * Carga una imagen a partir de una URL temporal.
 *
 * Se utiliza una instancia independiente de Image para comprobar
 * que el navegador pueda abrir correctamente el archivo y obtener
 * sus dimensiones antes de utilizarlo en el análisis.
 *
 * @param {string} url - URL de la imagen que se desea cargar.
 * @returns {Promise<HTMLImageElement>} Promesa que devuelve la imagen cargada.
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    // Se ejecuta cuando el navegador termina de cargar la imagen.
    image.onload = () => {
      // Se eliminan los manejadores después de completar la operación.
      image.onload = null;
      image.onerror = null;

      // Una imagen sin dimensiones válidas no puede utilizarse para analizarla.
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error("La imagen no tiene dimensiones válidas."));
        return;
      }

      resolve(image);
    };

    // Se ejecuta si el navegador no puede abrir la imagen.
    image.onerror = () => {
      image.onload = null;
      image.onerror = null;

      reject(new Error("No se pudo abrir la imagen."));
    };

    // Inicia la carga de la imagen.
    image.src = url;
  });
}

/**
 * Procesa una nueva imagen seleccionada por el usuario.
 *
 * El flujo consiste en:
 * 1. Identificar la selección actual.
 * 2. Limpiar la imagen y resultados anteriores.
 * 3. Validar el archivo.
 * 4. Crear una URL temporal.
 * 5. Cargar la imagen.
 * 6. Mostrarla en la vista previa.
 *
 * También comprueba el selectionId después de operaciones asíncronas
 * para evitar utilizar el resultado de una selección anterior.
 *
 * @param {Event} event - Evento generado al seleccionar una imagen.
 */
async function handleImageSelection(event) {
  // Identifica cuál de los dos selectores generó el evento:
  // el selector de archivos o el selector de cámara.
  const selectedInput = event.currentTarget;

  // Cada selección recibe un identificador único.
  const requestId = ++selectionId;

  // Antes de procesar la nueva imagen se elimina la anterior.
  clearImage();

  const file = selectedInput.files[0];

  // Si el usuario cancela la selección, se mantiene el estado inicial.
  if (!file) {
    setState(
      STATES.EMPTY,
      "Selecciona una imagen para visualizarla."
    );
    return;
  }

  // Comprueba formato, tamaño y contenido antes de intentar abrirla.
  const validationError = validateFile(file);

  if (validationError !== null) {
    // Limpia el selector cuando el archivo no es válido.
    selectedInput.value = "";

    setState(STATES.ERROR, validationError);
    return;
  }

  /**
   * Crea una URL temporal para poder mostrar el archivo seleccionado
   * directamente en el navegador sin tener que subirlo a un servidor.
   */
  const imageUrl = URL.createObjectURL(file);
  currentImageUrl = imageUrl;

  setState(STATES.LOADING_IMAGE, "Cargando imagen...");

  try {
    // Espera a que el navegador pueda abrir y validar la imagen.
    const image = await loadImage(imageUrl);

    // Si durante la carga el usuario seleccionó otra imagen,
    // se ignora el resultado de esta operación anterior.
    if (requestId !== selectionId) {
      return;
    }

    // Guarda la imagen como la imagen actualmente seleccionada.
    currentImage = image;

    // Muestra la fotografía en la vista previa.
    preview.src = imageUrl;
    preview.hidden = false;

    // Informa las dimensiones de la imagen al usuario.
    setState(
      STATES.IMAGE_READY,
      `Imagen cargada: ${image.naturalWidth} × ` +
        `${image.naturalHeight} píxeles. ` +
        "Pulsa «Analizar vehículos» para iniciar."
    );
  } catch (error) {
    // Si ya existe una selección más reciente, se ignora este error.
    if (requestId !== selectionId) {
      return;
    }

    // Limpia la imagen que no pudo cargarse.
    clearImage();

    selectedInput.value = "";

    setState(
      STATES.ERROR,
      "No se pudo abrir la imagen. Prueba con otro archivo."
    );

    // Conserva el detalle técnico en la consola para facilitar
    // la revisión y depuración durante el desarrollo.
    console.error("Error al cargar la fotografía:", error);
  }
}

/**
 * Muestra el detalle de cada detección realizada por el modelo.
 *
 * @param {Array} detections - Lista de objetos detectados.
 */
function showDetectionDetails(detections) {
  // Convierte las etiquetas internas del modelo a nombres
  // comprensibles para el usuario de la aplicación.
  const labels = {
    car: "Automóvil",
    motorcycle: "Motocicleta",
    bus: "Autobús",
    truck: "Camión",
  };

  // Elimina los detalles de la detección anterior.
  detectionList.replaceChildren();

  // Crea un elemento de lista para cada objeto detectado.
  detections.forEach((detection, index) => {
    const item = document.createElement("li");

    // Convierte el score del modelo, que está entre 0 y 1,
    // a un porcentaje entero para mostrarlo al usuario.
    const confidence = Math.round(detection.score * 100);

    // Ejemplo: "#1 · Automóvil · 94 %"
    item.textContent =
      `#${index + 1} · ${labels[detection.class]} · ${confidence} %`;

    detectionList.append(item);
  });

  // Si el modelo no encontró vehículos, se informa explícitamente
  // en lugar de dejar la lista vacía.
  if (detections.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No se detectaron vehículos.";
    detectionList.append(item);
  }

  // Hace visible la sección con el detalle de las detecciones.
  detectionDetails.hidden = false;
}

/**
 * Coordina todo el proceso de análisis de la fotografía.
 *
 * Este es el punto donde app.js conecta los tres módulos principales:
 * - detector.js: carga el modelo y obtiene las detecciones.
 * - counter.js: cuenta los vehículos por categoría.
 * - renderer.js: dibuja las detecciones sobre el canvas.
 *
 * La función también evita análisis simultáneos y controla los errores.
 */
async function handleAnalysis() {
  // No se inicia el análisis si no existe una imagen
  // o si ya existe otro análisis en ejecución.
  if (currentImage === null || analysisInProgress) {
    return;
  }

  // Guarda una referencia a la imagen que corresponde a este análisis.
  const imageToAnalyze = currentImage;

  // Guarda el identificador de la selección actual.
  const requestId = selectionId;

  // Bloquea nuevos análisis mientras este proceso termina.
  analysisInProgress = true;

  // Limpia resultados de análisis anteriores.
  resetResults();

  try {
    // Informa al usuario que se está preparando el modelo.
    setState(
      STATES.LOADING_MODEL,
      "Preparando el modelo de detección..."
    );

    /**
     * Importaciones dinámicas.
     *
     * Los módulos se cargan cuando son necesarios en lugar de
     * cargarlos todos al iniciar la página.
     */
    const detector = await import("./detector.js");
    const counter = await import("./counter.js");
    const renderer = await import("./renderer.js");

    /**
     * Comprueba que los módulos cargados tengan las funciones
     * necesarias para realizar el análisis.
     */
    if (
      typeof detector.loadModel !== "function" ||
      typeof detector.detectVehicles !== "function" ||
      typeof counter.countVehicles !== "function" ||
      typeof renderer.renderDetections !== "function"
    ) {
      throw new Error("MODULES_PENDING");
    }

    // Carga el modelo de detección.
    await detector.loadModel();

    // Evita continuar si el usuario cambió de imagen durante la carga.
    if (requestId !== selectionId) {
      return;
    }

    setState(STATES.ANALYZING, "Analizando vehículos...");

    // Envía la imagen al módulo encargado de realizar la detección.
    const detections = await detector.detectVehicles(imageToAnalyze);

    // Comprueba nuevamente que el análisis corresponde
    // a la imagen actualmente seleccionada.
    if (requestId !== selectionId) {
      return;
    }

    // Convierte las detecciones individuales en conteos por categoría.
    const counts = counter.countVehicles(detections);

    // Envía la imagen y las detecciones al módulo de renderizado
    // para dibujar los cuadros y etiquetas sobre el canvas.
    await renderer.renderDetections(
      canvas,
      imageToAnalyze,
      detections
    );

    // Evita mostrar resultados que ya no corresponden
    // a la imagen actualmente seleccionada.
    if (requestId !== selectionId) {
      return;
    }

    // Actualiza los contadores de la interfaz.
    showCounts(counts);

    // Muestra el detalle de cada detección.
    showDetectionDetails(detections);

    // Hace visibles los resultados finales.
    canvas.hidden = false;
    analysisPanel.hidden = false;
    preview.hidden = false;

    // Informa al usuario que el análisis terminó correctamente.
    setState(
      STATES.FINISHED,
      `Análisis terminado. Vehículos detectados: ${counts.total}.`
    );
  } catch (error) {
    // Si la selección cambió, no se muestran errores
    // relacionados con una imagen anterior.
    if (requestId !== selectionId) {
      return;
    }

    resetResults();

    /**
     * Se utiliza un mensaje específico cuando alguno de los módulos
     * necesarios todavía no está disponible.
     */
    const message =
      error.message === "MODULES_PENDING"
        ? "Los módulos de detección, conteo y dibujo no están disponibles."
        : "No se pudo completar el análisis. Inténtalo nuevamente; " +
          "si persiste, revisa el error en la consola.";

    setState(STATES.ERROR, message);

    // El error detallado se conserva en la consola para depuración.
    console.error("Error durante el análisis:", error);
  } finally {
    // Permite volver a utilizar los controles después de terminar
    // correctamente o después de producirse un error.
    analysisInProgress = false;

    // Mantiene visible el último estado y mensaje mostrado.
    setState(currentState, statusElement.textContent);
  }
}

/**
 * Eventos principales de la aplicación.
 *
 * Ambos selectores utilizan la misma función porque tanto una imagen
 * elegida desde el dispositivo como una fotografía obtenida mediante
 * la cámara deben pasar por el mismo proceso de validación y carga.
 */
imageInput.addEventListener("change", handleImageSelection);
cameraInput.addEventListener("change", handleImageSelection);

// El botón inicia el análisis de la imagen actualmente seleccionada.
analyzeButton.addEventListener("click", handleAnalysis);

/**
 * Estado inicial de la aplicación.
 *
 * Al cargar la página todavía no existe ninguna imagen seleccionada,
 * por lo que se muestra el mensaje correspondiente.
 */
setState(
  STATES.EMPTY,
  "Selecciona una imagen para visualizarla."
);