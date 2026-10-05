# Pruebas del módulo visual de Emir

## Alcance y entorno

Fecha de ejecución: 2026-10-02. Implementación y ejecución asistidas por Codex
para Emir. Sistema operativo: Windows. Navegador: Microsoft Edge
154.0.4258.48, en modo sin ventana, con Canvas 2D real.

Se verificó únicamente `app/src/js/renderer.js`. Las entradas son imágenes
PNG geométricas generadas por la página de pruebas y detecciones ficticias
de coordenadas conocidas. No son fotografías de vehículos ni resultados del
modelo. Umbral y límite del detector: no aplican; no se ejecutó inferencia.

## Cómo repetir las pruebas

Por solicitud de Emir, la carpeta `tests/` se conserva únicamente en su
computadora y no se incluye en la rama publicada. Las instrucciones siguientes
aplican a esa copia local. Las capturas y resultados JSON también se conservan
localmente; no se incluyen en la subida. Este documento contiene el registro
de resultados disponible para el equipo.

Servir la raíz del repositorio con un servidor HTTP estático y abrir
`/tests/renderer.html`. No abrir mediante `file://`, porque utiliza módulos
JavaScript. La página ejecuta los casos al cargarse y muestra sus resultados.
No necesita TensorFlow.js, COCO-SSD, Node ni un framework de pruebas para
ejecutarse en el navegador. El servidor es solo una herramienta de desarrollo.

Cambiar el tamaño de ventana para inspeccionar los dos ejemplos. El CSS
proporcional de esta página se limita a pruebas; no modifica la interfaz real.

## Casos ejecutados

| ID | Entrada | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| R-horizontal | PNG 640 × 360; cuatro categorías en las esquinas | Dimensiones naturales; categorías en español y porcentajes; etiquetas visibles | Dimensiones, textos y límites de fondos y texto comprobados | Aprobado |
| R-vertical | PNG 360 × 640; cuatro categorías en las esquinas | Mismos contratos en orientación vertical | Dimensiones, textos y límites de fondos y texto comprobados | Aprobado |
| R-alineacion | PNG 320 × 240; car, score 0.1, bbox [40,70,100,80] | Recuadro en esas coordenadas; Automóvil 10% sin nuevo filtro | Píxeles de tres lados y píxel externo comprobados; etiqueta conservada | Aprobado |
| R-vacia | Imagen cargada y lista vacía | Fotografía completa sin dibujos anteriores | Todos los píxeles iguales a la imagen original | Aprobado |
| R-inmutable | Lista, objeto y bbox congelados | No modificar entrada | Ejecución sin mutación y contenido idéntico | Aprobado |
| R-reemplazo | Imagen horizontal con recuadro, después vertical 180 × 300 sin detecciones | Eliminar recuadro y tamaño anteriores | Nuevas dimensiones y píxel del recuadro anterior limpios | Aprobado |
| R-limpieza | Canvas dibujado con transformación de traslación activa | Borrar todo sin cambiar dimensiones | Todos los píxeles transparentes; dimensiones conservadas | Aprobado |
| R-pequena | PNG 80 × 40; motorcycle junto al borde inferior derecho | Fondo y texto dentro del Canvas | Límites de fondo y glifos comprobados | Aprobado |
| R-no-cargada | HTMLImageElement sin cargar | Error explícito | Error recibido | Aprobado |
| R-sin-contexto | Contexto 2D no disponible | Error en ambas funciones | Ambos errores recibidos | Aprobado |
| R-redimension | Misma página, ventanas 1280 × 1000 y 390 × 844 | Mantener proporción y píxeles al cambiar tamaño visual | Dimensiones internas y huellas de píxeles iguales; sin desbordamiento en la página de pruebas | Aprobado |

Resumen: 11 casos comprobados, 11 aprobados, 0 fallidos. Sin errores de
JavaScript observados durante esta ejecución. Las capturas de ambas ventanas
se inspeccionaron visualmente: recuadros alineados con las figuras grises y
etiquetas dentro de los límites en ambas orientaciones.

## Evidencia conservada localmente

- `docs/evidence/emir/resultados.json`: resultados de los 10 casos automáticos,
  medidas y huellas de píxeles de las dos ventanas para R-redimension.
- `docs/evidence/emir/escritorio.png`: captura de ventana 1280 × 1000.
- `docs/evidence/emir/movil.png`: captura de ventana 390 × 844.
- `tests/renderer.html` y `tests/renderer.test.js`: entradas y comprobaciones
  reproducibles, separadas de la aplicación final.

## Pendientes de integración y límites

### Corrección de las pruebas en Brave

El 2026-10-02, el usuario mostró 7 de 10 casos aprobados en Brave. Se reprodujo
en su pestaña de Live Server. R-alineacion y R-reemplazo comparaban un fondo
RGB fijo `[245,245,245,255]` con la lectura `[245,244,244,255]`. R-limpieza
detectaba un canal RGB de valor 1 y lo confundía con un píxel visible.

Estos tres fallos eran de las comprobaciones, no del renderer. Son coherentes
con la protección de Canvas de Brave descrita en
https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/.

Se corrigieron las dos comparaciones para usar un Canvas de referencia que
dibuja la misma imagen decodificada, y la limpieza para comprobar alfa 0 en
todos los píxeles. No se relajó el umbral de color ni se cambiaron los ajustes
de privacidad; tampoco se modificó renderer.js en esta corrección.

Resultado tras recargar la pestaña del usuario: 10/10 aprobadas, 0 fallidas.
La versión exacta de Brave no se verificó. Evidencia:
`docs/evidence/emir/brave-antes.png`, `brave.png` y `brave-resultados.json`.
La comprobación de cambio de tamaño sigue siendo la ejecución previa en Edge;
no se declara ejecutada de nuevo en Brave.

| ID de incidencia | Casos | Gravedad | Corrección | Estado |
| --- | --- | --- | --- | --- |
| E-EMIR-01 | R-alineacion, R-reemplazo, R-limpieza | Baja: falsos fallos en pruebas; no bloqueo de la aplicación | Referencia de imagen y comprobación de alfa | Corregido; 10 casos aprobados en Brave |

La corrección del código de pruebas se conserva localmente en `tests/`, que
Emir pidió excluir de la subida. Se publican el módulo visual, este registro
y la bitácora de prompts; las capturas y archivos de pruebas no se publican.
El commit correspondiente puede identificarse mediante
`git log -- app/src/js/renderer.js docs/pruebas.md`.

- Conde debe incorporar el tamaño visual proporcional de `#detection-canvas`
  en el CSS real: `max-width: 100%; height: auto;`. Es una propuesta para
  coordinación, no un cambio aplicado por Emir a sus archivos.
- Probar fotografías reales y el flujo integrado cuando detector.js y
  counter.js estén implementados. Ambos siguen como módulos pendientes en
  la versión revisada. Estas pruebas no validan la precisión del modelo.
- Angélica coordina la limpieza al cambiar imagen y la visibilidad del Canvas.
  El renderer no cambia controles ni conteos.
- En fotografías grandes reducidas visualmente, las etiquetas también se
  reducen con el Canvas; revisar su legibilidad con las fotos reales del equipo.
- No se garantiza que etiquetas de objetos superpuestos no se solapen entre sí.
- Revisión personal de Emir y revisión de David del PR del renderer pendientes.
- La prueba con persona externa, el video y la presentación no se han realizado.

## Descripción para el manual del programador

`renderDetections(canvas, image, detections)` recibe una imagen ya cargada
y la misma lista filtrada que recibe el módulo de conteo. Ajusta las dimensiones
internas del Canvas a `naturalWidth` y `naturalHeight`, borra resultados,
dibuja la imagen, los recuadros bbox y las etiquetas. No devuelve un resultado
de datos (`void`) y no modifica la lista. Lanza un error si la imagen no está
cargada o falta el contexto 2D. La confianza se muestra como porcentaje
redondeado; no representa la precisión global del sistema.

`clearCanvas(canvas)` borra los píxeles, conserva dimensiones y no cambia
visibilidad ni conteos. Lanza un error si falta el contexto 2D.

Para cambiar traducciones, editar `VEHICLE_LABELS`; para cambiar apariencia,
editar colores, ancho del trazo y fuente en renderer.js. Las coordenadas deben
seguir usando la escala natural de la imagen. Cualquier cambio del contrato
debe acordarse antes con la integración; no agregar filtros de confianza aquí.
