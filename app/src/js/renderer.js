/**
 * Módulo visual: dibuja la fotografía y las detecciones recibidas.
 * Las coordenadas se expresan en píxeles naturales de la imagen.
 * La detección y el conteo pertenecen a otros módulos.
 * @typedef {{x: number, y: number, width: number, height: number}} Rectangle
 */

// Equivalencias entre las clases del modelo y sus nombres en español.
// Object.freeze impide modificar accidentalmente este diccionario.
// Las etiquetas actuales usan números y no consultan esta tabla.
const VEHICLE_LABELS = Object.freeze({
  car: "Automóvil",
  motorcycle: "Motocicleta",
  bus: "Autobús",
  truck: "Camión",
});

/**
 * Genera colores que permiten distinguir detecciones cercanas.
 * El índice conserva la correspondencia con el número mostrado en la lista.
 * @param {number} index Posición de la detección, comenzando en cero.
 * @returns {{outline: string, label: string}} Colores CSS del borde y del fondo.
 */
function detectionColors(index) {
  // El ángulo áureo separa tonos consecutivos sin depender de una fotografía.
  const hueStep = 180 * (3 - Math.sqrt(5));
  // El módulo mantiene el tono dentro del círculo de color de 0 a 360 grados.
  const hue = (200 + index * hueStep) % 360;
  // El borde es claro y el fondo es oscuro para mostrar el número en blanco.
  return {
    outline: `hsl(${hue}, 95%, 65%)`,
    label: `hsl(${hue}, 75%, 22%)`,
  };
}

/**
 * Calcula el área que comparten dos rectángulos para colocar las etiquetas.
 * @param {Rectangle} a Primer rectángulo.
 * @param {Rectangle} b Segundo rectángulo.
 * @returns {number} Área compartida en píxeles cuadrados; cero si no se cruzan.
 */
function overlapArea(a, b) {
  // Multiplica el ancho y el alto de la intersección. Math.max evita tamaños
  // negativos cuando los rectángulos están separados.
  return Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
}

/**
 * Elige una esquina próxima a la caja sin desplazar ni cambiar esa caja.
 * Prioriza no tapar etiquetas anteriores y después no cubrir otros vehículos.
 * Si no hay espacio libre, escoge la posición con menos solapamiento.
 * @param {Rectangle} box Caja de la detección que se va a identificar.
 * @param {number} labelWidth Ancho calculado del fondo de la etiqueta.
 * @param {number} labelHeight Alto calculado del fondo de la etiqueta.
 * @param {number} width Ancho interno del Canvas.
 * @param {number} height Alto interno del Canvas.
 * @param {Rectangle[]} placedLabels Etiquetas ya colocadas en este dibujo.
 * @param {Rectangle[]} boxes Cajas de todas las detecciones recibidas.
 * @param {number} index Índice de la detección actual para excluir su propia caja.
 * @returns {Rectangle} Posición y dimensiones de la etiqueta elegida.
 */
function placeLabel(box, labelWidth, labelHeight, width, height, placedLabels, boxes, index) {
  // Se prueban las esquinas superiores e inferiores de la caja actual.
  const candidates = [
    { x: box.x, y: box.y - labelHeight },
    { x: box.x + box.width - labelWidth, y: box.y - labelHeight },
    { x: box.x, y: box.y + box.height },
    { x: box.x + box.width - labelWidth, y: box.y + box.height },
  ];
  let best = null;
  // Infinity permite que la primera alternativa sea la referencia inicial.
  let bestLabelOverlap = Infinity;
  let bestVehicleOverlap = Infinity;
  for (const candidate of candidates) {
    // Acota la etiqueta al área visible, sin cambiar la bbox del vehículo.
    const rectangle = {
      x: Math.max(0, Math.min(candidate.x, width - labelWidth)),
      y: Math.max(0, Math.min(candidate.y, height - labelHeight)),
      width: labelWidth,
      height: labelHeight,
    };
    // reduce suma el área de la etiqueta que cubriría dibujos ya colocados.
    const labelOverlap = placedLabels.reduce((sum, label) => sum + overlapArea(rectangle, label), 0);
    // La caja del vehículo actual se excluye: su propia etiqueta puede tocarla.
    const vehicleOverlap = boxes.reduce((sum, other, otherIndex) =>
      sum + (otherIndex === index ? 0 : overlapArea(rectangle, other)), 0);
    // Primero se evita tapar números; en caso de empate, otros vehículos.
    if (labelOverlap < bestLabelOverlap ||
        (labelOverlap === bestLabelOverlap && vehicleOverlap < bestVehicleOverlap)) {
      best = rectangle;
      bestLabelOverlap = labelOverlap;
      bestVehicleOverlap = vehicleOverlap;
    }
    // Sin ningún solapamiento, no hace falta evaluar más alternativas.
    if (labelOverlap === 0 && vehicleOverlap === 0) break;
  }
  return best;
}

/**
 * Borra el dibujo completo sin cambiar las dimensiones del Canvas.
 * No cambia la visibilidad ni los conteos: eso corresponde a app.js.
 * @param {HTMLCanvasElement} canvas Canvas de resultados.
 * @returns {void}
 * @throws {Error} Si el contexto de dibujo 2D no está disponible.
 */
export function clearCanvas(canvas) {
  // El contexto 2D ofrece las operaciones para borrar y dibujar en Canvas.
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("No se pudo obtener el contexto 2D del Canvas.");
  }
  // Conserva el estado del contexto y borra en coordenadas sin transformaciones,
  // incluso si antes se había aplicado una escala o una traslación.
  context.save();
  context.resetTransform();
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Devuelve el contexto al estado que tenía quien llamó esta función.
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
  // Las dimensiones naturales pertenecen al archivo, no al tamaño aplicado
  // por CSS. Usarlas conserva la escala con la que se calcularon las bbox.
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  // Evita dibujar una imagen sin terminar de cargar o que no pudo decodificarse.
  if (!image.complete || !(width > 0) || !(height > 0)) {
    throw new Error("La fotografía debe estar cargada antes de dibujarla.");
  }
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("No se pudo obtener el contexto 2D del Canvas.");
  }

  // Ajustar las dimensiones internas reinicia el contexto y sus píxeles.
  // Imagen y recuadros compartirán el mismo origen y la misma escala.
  canvas.width = width;
  canvas.height = height;
  clearCanvas(canvas);
  // Primero se dibuja la fotografía; después, los resultados sobre ella.
  context.drawImage(image, 0, 0, width, height);

  // Acota el tamaño de la fuente entre 12 y 28 píxeles internos. En imágenes
  // muy pequeñas, cada etiqueta puede reducirlo todavía más para caber.
  const fontSize = Math.max(12, Math.min(28, Math.min(width, height) / 25));
  // El grosor acompaña al texto y mantiene como mínimo un píxel.
  context.lineWidth = Math.max(1, fontSize / 7);

  // Cada elemento conserva su bbox y produce exactamente un recuadro.
  // strokeRect dibuja de forma independiente: no acumula ni une trayectorias.
  // Una bbox que abarque dos vehículos debe corregirse en el detector;
  // el renderer no inventa separaciones ni modifica la lista que se cuenta.
  // Crea objetos auxiliares para calcular solapamientos, sin alterar la entrada.
  const boxes = detections.map(({ bbox: [x, y, boxWidth, boxHeight] }) =>
    ({ x, y, width: boxWidth, height: boxHeight }));
  detections.forEach((detection, index) => {
    context.strokeStyle = detectionColors(index).outline;
    // ... convierte [x, y, ancho, alto] en los cuatro argumentos de strokeRect.
    context.strokeRect(...detection.bbox);
  });

  // Etiquetas después de todos los trazos para conservar su legibilidad.
  // Solo guarda posiciones de etiquetas de esta imagen; empieza vacío al renderizar.
  const placedLabels = [];
  detections.forEach((detection, index) => {
    // Los índices comienzan en cero, pero los números visibles comienzan en uno.
    const text = `#${index + 1}`;

    // Margen entre el número y el borde; se reduce en imágenes pequeñas.
    const padding = Math.min(4, width / 8, height / 8);

    // let permite reducir la fuente después de medir el texto, si es necesario.
    let labelFontSize = Math.min(
      fontSize,
      (height - padding * 2) / 1.2
    );

    context.font = `bold ${labelFontSize}px Arial, sans-serif`;

    // Ancho útil para el texto una vez descontados los márgenes laterales.
    const availableWidth = width - padding * 2;
    // measureText usa la fuente del contexto para obtener el ancho real del número.
    const textWidth = context.measureText(text).width;

    // Reduce proporcionalmente una etiqueta que no cabe en el Canvas.
    if (textWidth > availableWidth) {
      labelFontSize *= availableWidth / textWidth;
      context.font = `bold ${labelFontSize}px Arial, sans-serif`;
    }

    // El fondo incluye texto y márgenes, sin superar las dimensiones de la imagen.
    const labelWidth = Math.min(
      width,
      context.measureText(text).width + padding * 2
    );

    const labelHeight = Math.min(
      height,
      labelFontSize * 1.2 + padding * 2
    );

    // Busca una ubicación visible y registra su área para las etiquetas siguientes.
    const label = placeLabel(boxes[index], labelWidth, labelHeight,
      width, height, placedLabels, boxes, index);
    const labelX = label.x;
    const labelY = label.y;
    placedLabels.push(label);

    // El fondo comparte el tono del recuadro para relacionar número y vehículo.
    context.fillStyle = detectionColors(index).label;
    context.fillRect(labelX, labelY, labelWidth, labelHeight);

    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    // Centra el texto verticalmente dentro del fondo de la etiqueta.
    context.textBaseline = "middle";

    // El último argumento limita el ancho del texto disponible para dibujar.
    context.fillText(
      text,
      labelX + padding,
      labelY + labelHeight / 2,
      availableWidth
    );
  });
}
