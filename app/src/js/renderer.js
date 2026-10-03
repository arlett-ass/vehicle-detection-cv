const VEHICLE_LABELS = Object.freeze({
  car: "Automóvil",
  motorcycle: "Motocicleta",
  bus: "Autobús",
  truck: "Camión",
});

/**
 * Borra el dibujo completo sin cambiar las dimensiones del Canvas.
 * No cambia la visibilidad ni los conteos: eso corresponde a app.js.
 * @param {HTMLCanvasElement} canvas Canvas de resultados.
 * @returns {void}
 * @throws {Error} Si el contexto de dibujo 2D no está disponible.
 */
export function clearCanvas(canvas) {
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("No se pudo obtener el contexto 2D del Canvas.");
  }
  context.save();
  context.resetTransform();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

/**
 * Dibuja una fotografía cargada y las detecciones que entrega detector.js.
 * Las coordenadas bbox se interpretan en píxeles naturales de la imagen.
 * CSS debe adaptar el tamaño visual conservando la proporción del Canvas.
 * No modifica, cuenta ni filtra las detecciones; una lista vacía dibuja
 * únicamente la fotografía. El contexto se reinicia al ajustar el Canvas.
 * @param {HTMLCanvasElement} canvas Canvas de resultados.
 * @param {HTMLImageElement} image Fotografía ya cargada.
 * @param {Array<{class: string, score: number, bbox: number[]}>} detections
 *   Lista filtrada por el detector: car, motorcycle, bus y truck.
 * @returns {void}
 * @throws {Error} Si la imagen no está cargada o no hay contexto 2D.
 */
export function renderDetections(canvas, image, detections) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!image.complete || !(width > 0) || !(height > 0)) {
    throw new Error("La fotografía debe estar cargada antes de dibujarla.");
  }
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("No se pudo obtener el contexto 2D del Canvas.");
  }

  canvas.width = width;
  canvas.height = height;
  clearCanvas(canvas);
  context.drawImage(image, 0, 0, width, height);

  const fontSize = Math.max(12, Math.min(28, Math.min(width, height) / 25));
  context.strokeStyle = "#00bfff";
  context.lineWidth = Math.max(1, fontSize / 7);

  // Dibujar todos los recuadros primero evita que sus trazos tapen etiquetas.
  for (const detection of detections) {
    context.strokeRect(...detection.bbox);
  }

  for (const detection of detections) {
    const [x, y] = detection.bbox;
    const text = `${VEHICLE_LABELS[detection.class] ?? detection.class} ` +
      `${Math.round(detection.score * 100)}%`;
    // Reducir texto y margen solo si la imagen es demasiado pequeña.
    const padding = Math.min(4, width / 8, height / 8);
    let labelFontSize = Math.min(fontSize, (height - padding * 2) / 1.2);
    context.font = `${labelFontSize}px Arial, sans-serif`;
    const availableWidth = width - padding * 2;
    const textWidth = context.measureText(text).width;
    if (textWidth > availableWidth) {
      labelFontSize *= availableWidth / textWidth;
      context.font = `${labelFontSize}px Arial, sans-serif`;
    }
    const labelWidth = Math.min(width, context.measureText(text).width + padding * 2);
    const labelHeight = Math.min(height, labelFontSize * 1.2 + padding * 2);
    const labelX = Math.max(0, Math.min(x, width - labelWidth));
    // Preferir arriba del recuadro; en el borde superior, usar su interior.
    const preferredY = y >= labelHeight ? y - labelHeight : y;
    const labelY = Math.max(0, Math.min(preferredY, height - labelHeight));
    context.fillStyle = "#102a43";
    context.fillRect(labelX, labelY, labelWidth, labelHeight);
    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(text, labelX + padding, labelY + labelHeight / 2, availableWidth);
  }
}
