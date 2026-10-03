/**
 * Coordina la selección y carga de fotografías.
 *
 * Cada selección tiene un identificador para impedir que una
 * carga anterior sobrescriba el estado de una imagen nueva.
 * La integración del detector se añadirá posteriormente.
 */

const imageInput = document.querySelector("#image-input");
const preview = document.querySelector("#preview");
const statusElement = document.querySelector("#status");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STATES = Object.freeze({
  EMPTY: "sin-imagen",
  LOADING_IMAGE: "cargando-imagen",
  IMAGE_READY: "imagen-lista",
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
  statusElement.dataset.state = currentState;
  statusElement.textContent = message;
}

/**
 * Retira la fotografía anterior y libera su URL temporal.
 */
function clearImage() {
  currentImage = null;
  preview.hidden = true;
  preview.removeAttribute("src");

  if (currentImageUrl !== null) {
    URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = null;
  }
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
async function handleImageSelection() {
  const requestId = ++selectionId;

  clearImage();

  const file = imageInput.files[0];

  if (!file) {
    setState(
      STATES.EMPTY,
      "Selecciona una imagen para visualizarla."
    );
    return;
  }

  const validationError = validateFile(file);

  if (validationError !== null) {
    imageInput.value = "";
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
        "La detección todavía no está implementada."
    );
  } catch (error) {
    if (requestId !== selectionId) {
      return;
    }

    clearImage();
    imageInput.value = "";

    setState(
      STATES.ERROR,
      "No se pudo abrir la imagen. Prueba con otro archivo."
    );

    console.error("Error al cargar la fotografía:", error);
  }
}

imageInput.addEventListener("change", handleImageSelection);

setState(
  STATES.EMPTY,
  "Selecciona una imagen para visualizarla."
);