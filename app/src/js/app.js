/**
 * Coordina la interfaz y la selección de fotografías.
 * La integración del modelo se agregará posteriormente.
 */

const imageInput = document.querySelector("#image-input");
const preview = document.querySelector("#preview");
const status = document.querySelector("#status");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

let currentImageUrl = null;

function clearPreview() {
  preview.hidden = true;
  preview.removeAttribute("src");

  if (currentImageUrl !== null) {
    URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = null;
  }
}

imageInput.addEventListener("change", () => {
  clearPreview();

  const file = imageInput.files[0];

  if (!file) {
    status.textContent = "Selecciona una imagen para visualizarla.";
    return;
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    status.textContent = "Selecciona una imagen JPG o PNG.";
    imageInput.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    status.textContent = "La imagen debe pesar como máximo 10 MB.";
    imageInput.value = "";
    return;
  }

  status.textContent = "Cargando imagen...";
  currentImageUrl = URL.createObjectURL(file);
  preview.src = currentImageUrl;
});

preview.addEventListener("load", () => {
  preview.hidden = false;
  status.textContent =
    "Imagen cargada. La detección todavía no está implementada.";
});

preview.addEventListener("error", () => {
  clearPreview();
  imageInput.value = "";
  status.textContent =
    "No se pudo abrir la imagen. Prueba con otro archivo.";
});