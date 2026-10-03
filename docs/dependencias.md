# Dependencias y modelo del detector

Responsable: Eddie Dacosta Garcia. Implementación asistida por Codex.

## Ejecución

La aplicación usa HTML, CSS y JavaScript en el navegador. No necesita backend,
base de datos, Python ni entrenamiento propio. Servir la raíz del repositorio
con Live Server y abrir `app/index.html`; los módulos ES necesitan HTTP/HTTPS.
Node.js es opcional y se usa únicamente para las pruebas unitarias.

| Dependencia | Versión fija | Licencia | Archivo cargado |
| --- | --- | --- | --- |
| TensorFlow.js | 4.22.0 | Apache-2.0 | https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js |
| COCO-SSD | 2.2.3 | Apache-2.0 | https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js |

`index.html` carga TensorFlow.js antes de COCO-SSD y después el módulo `app.js`.
COCO-SSD 2.2.3 declara compatibilidad con `tfjs-core` y `tfjs-converter` ^4.10.0;
4.22.0 satisface ese rango y el bundle incluye los backends CPU y WebGL.
No usar enlaces sin versión ni cargar dos copias de TensorFlow.js.

Fuentes de versiones y licencias:

- [Paquete COCO-SSD 2.2.3](https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/package.json).
- [Paquete TensorFlow.js 4.22.0](https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/package.json).
- [Licencia TensorFlow.js](https://github.com/tensorflow/tfjs/blob/master/LICENSE).
- [Licencia tfjs-models](https://github.com/tensorflow/tfjs-models/blob/master/LICENSE).

## Modelo y pesos

Se seleccionó `lite_mobilenet_v2`, variante predeterminada de COCO-SSD, por su
tamaño y velocidad para un prototipo de navegador. El modelo fue preentrenado
para categorías COCO; este proyecto integra sus predicciones y filtra vehículos.
No se afirma que haya sido entrenado por el equipo ni que reconozca todo vehículo.

El cargador oficial descarga:

- Manifiesto: https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
- Pesos: `group1-shard1of5`, `group1-shard2of5`, `group1-shard3of5`,
  `group1-shard4of5` y `group1-shard5of5`, en el mismo directorio del manifiesto.

Estas rutas proceden del manifiesto y del cargador de la versión 2.2.3.
La URL de los pesos no incluye una versión semántica: fijar las bibliotecas
no equivale a conservar una copia inmutable de los pesos. Para una entrega
reproducible sin red, habría que guardar y verificar el manifiesto y sus shards,
conservar avisos de licencia y configurar `modelUrl`; no se implementó ese modo.

Origen técnico: [API y variantes oficiales](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd),
[cargador publicado 2.2.3](https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/index.js)
y [modelos originales de TensorFlow](https://github.com/tensorflow/models/tree/master/research/object_detection).
El código de los repositorios TensorFlow citados se distribuye bajo Apache-2.0.
Las fotografías tienen sus propias licencias; no heredan la licencia del código.

Alternativas: el mismo cargador admite `mobilenet_v1` y `mobilenet_v2`.
Cambiar `MODEL_BASE` requiere volver a medir descarga, tiempo y detecciones con
las mismas fotos; no se evaluaron aquí esas otras variantes.

## Contrato de detector.js

`loadModel()` devuelve una promesa compartida del modelo. Las llamadas
simultáneas y posteriores reutilizan esa promesa; si falla, la caché se libera.
Se espera `tf.ready()` antes de descargar el modelo. No se hace `dispose()` por
fotografía porque el modelo se conserva para el siguiente análisis.

`detectVehicles(image, minConfidence = 0.5)` recibe un `HTMLImageElement` ya
cargado, valida dimensiones y umbral finito entre 0 y 1, espera el modelo y llama
a `model.detect(image, 100, minConfidence)`. Devuelve únicamente `car`,
`motorcycle`, `bus` y `truck` cuyo `score >= minConfidence`.

Cada resultado conserva `{ class, score, bbox: [x, y, ancho, alto] }` y copia el
recuadro sin modificar la predicción original. Las coordenadas están en píxeles
naturales, no en el tamaño CSS. La lista vacía es un resultado válido. Los fallos
se propagan a `app.js`; no se convierten en una falsa detección de cero vehículos.

## Parámetros y límites

- Umbral inicial: **0.5**, conforme al contrato del equipo. Consultar la
  comparación de 0.3, 0.5 y 0.7 en `pruebas-detector.md`; no es una calibración
  estadística ni una garantía de precisión.
- `MAX_NUM_BOXES = 100`: evita el tope predeterminado de 20. Limita todas las
  detecciones del modelo **antes** de filtrar vehículos. Otros objetos pueden
  ocupar plazas; no garantiza detectar 100 vehículos ni contar escenas completas.
- El modelo reduce internamente la información visual y puede omitir vehículos
  pequeños, lejanos, tapados o muy juntos. Elevar el límite no recupera objetos
  que el modelo no reconoció.
- En COCO-SSD 2.2.3, el código usa `minScore` tanto para el score mínimo como
  para la supresión de recuadros solapados (NMS). Cambiar el umbral también puede
  cambiar qué recuadros se suprimen; no es solo filtrar una lista fija.
- `score` es confianza del modelo, no precisión global. Contar bien el total
  puede ocultar omisiones y falsos positivos que se compensan.

## Conexión y errores

Se requiere internet para jsDelivr y Google Cloud Storage. Una caché del navegador
no garantiza funcionamiento sin conexión. Las fotografías seleccionadas se
procesan localmente; el módulo no las sube a un servidor.

Si fallan los pesos, el siguiente análisis vuelve a intentar la carga.
Si faltan los scripts externos, hay que recuperar la conexión y recargar la página:
reiniciar el modelo no vuelve a insertar scripts. El error original queda en
`error.cause`. La interfaz coordinadora controla mensajes y habilita los botones.

## Integración y mantenimiento

El cambio de HTML se limita a las dos etiquetas de dependencias requeridas por
el detector; revisar con Conde al integrar su interfaz. `app.js` de Angélica ya
invoca las dos exportaciones acordadas. `counter.js` y `renderer.js` deben estar
implementados e integrados para completar el recorrido de la aplicación.

Para modificar el detector: ajustar las constantes exportadas, ejecutar
`node --test tests/detector.test.mjs`, repetir `tests/detector-browser.html`
y registrar los resultados. Si cambia el umbral predeterminado, coordinar también
el `0.5` explícito que actualmente pasa `app.js`. No modificar los filtros del
contador ni del dibujo: ambos deben consumir la lista entregada por el detector.
