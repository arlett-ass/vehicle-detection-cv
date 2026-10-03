# Bitácora de prompts

## Registro 001

Fecha: 2026-10-02
Herramienta: ChatGPT

### Solicitud
Proponer la estructura inicial de un prototipo web para detectar
vehículos con TensorFlow.js y COCO-SSD, sin backend.

### Resultado
Estructura de carpetas, interfaz inicial, carga de fotografías
y documentación base.

### Responsables
Angelica Arlett Santiago Serrano

## Registro 002

Fecha: 2026-10-02
Integrante: Emir, con asistencia de Codex
Herramienta: Codex; identificador exacto del modelo no verificado

### Prompts completos del usuario

Primera solicitud, acompañada del archivo Guia_tareas_equipo_deteccion_vehiculos.docx:

> me ayudas con esto? lee todo el documento y preparate para ayudarme SOLAMENTO LO QUE ESTE DIRIGIDO A EMIR

Solicitud de implementación:

> comienza a hacerlo RESPETANDO TODO HACIENDO SOLO LO QUE ME TOCA SIN INVENTAR NADA

### Resultado

Implementación de renderDetections y clearCanvas en renderer.js, página de
pruebas separada con imágenes y detecciones ficticias explícitas, documentación
de las funciones y registro de pruebas reales en Microsoft Edge. El renderer
no modifica ni vuelve a filtrar las detecciones.

### Uso y revisión

Aplicado al repositorio con pruebas ejecutadas por Codex: 10 casos automáticos
y una comprobación adicional de redimensionamiento. Capturas inspeccionadas.
Revisión personal de Emir pendiente. No se atribuye a Emir una prueba manual
que no haya realizado.

Se adaptaron las etiquetas para permanecer dentro del Canvas y se separaron
los datos ficticios de la aplicación. Se identificó como pendiente de Conde
el CSS proporcional del Canvas real. Detector y conteo siguen pendientes;
no se afirmó haber probado la inferencia ni la aplicación completa.

Reflexión personal de Emir: pendiente de su revisión.
Marca Top 3: pendiente de selección del equipo; este registro no se declara
automáticamente uno de los tres prompts elegidos.

## Registro 003

Fecha: 2026-10-02
Integrante: Emir, con asistencia de Codex
Herramienta: Codex; identificador exacto del modelo no verificado

### Solicitud original

Mensaje sin texto, con una captura de la página de pruebas mostrando 7/10
aprobadas. La captura original se conserva en
`docs/evidence/emir/brave-antes.png`; no se reconstruye un prompt textual
que el usuario no escribió.

### Resultado y uso

Se reprodujeron los tres fallos en la pestaña de Brave del usuario y se
mostraron los valores de píxel obtenidos. Las pruebas de fondo se cambiaron
para comparar con la imagen original decodificada; la limpieza comprueba
el canal alfa de todos los píxeles. No se cambió renderer.js ni la privacidad
del navegador. Tras recargar: 10/10 casos aprobados.

Resultado aplicado localmente. La prueba original asumía un RGB constante y
confundía valores RGB no nulos con visibilidad; se corrigieron esas decisiones.
Revisión personal de Emir y selección Top 3 pendientes. Sin commit ni subida.

## Registro 004

Fecha: 2026-10-02
Integrante: Emir, con asistencia de Codex
Herramienta: Codex; identificador exacto del modelo no verificado

### Prompt completo del usuario

> sube mis cambios a mi rama Emir PERO NO SUBAS LA CARPETA TEST

### Alcance autorizado

Corrección posterior del usuario, conservada completa:

> la de pruebas TAMPOCO LA SUBAS

Instrucción final del usuario, conservada completa:

> SOLOO SUBE LO QUE ME PIDAN EN EL DOCUMENTO NO SUBAS NADA QUE NO ESTE AHI O SE TE INDIQUE

El alcance final incluye renderer.js, docs/pruebas.md y esta bitácora, que
corresponden a las responsabilidades de Emir en la guía. Se excluyen `tests/`
y `docs/evidence/emir/`, conservándolos localmente. Las rutas de evidencia
mencionadas en los registros anteriores corresponden a esa copia local.
Los registros describen el estado durante cada intervención.

Uso: solicitud aplicada al alcance del commit. La confirmación del resultado
de la subida se comunica después de comprobar el repositorio remoto.
Marca Top 3 y reflexión personal de Emir: pendientes.
