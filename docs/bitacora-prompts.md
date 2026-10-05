# Bitácora de prompts

Documento único del equipo. Se conservan los prompts y los registros históricos
recibidos, incluidas sus advertencias sobre reconstrucciones y revisiones pendientes.
El índice siguiente clasifica los registros sin reescribir sus solicitudes.

| Registros | Integrante | Clasificación |
|---|---|---|
| 001 | Angélica | Planificación y estructura |
| 002–004 | Emir | Visualización, depuración y control de versiones |
| 005 | Eddie | Investigación de visión por computadora |
| 006 | Eddie | Caso de uso y herramientas |
| 007 | Eddie | Detector e integración |

Los estados pendientes en los registros corresponden al momento de cada
intervención y no describen necesariamente el estado actual de la aplicación.
No se han recibido en los materiales suministrados los prompts de Conde y David.
Deben incorporarse a este mismo archivo cuando estén disponibles.


## Registro 001

Fecha: 2026-10-02

Herramienta: ChatGPT

Responsable: Angelica Arlett Santiago Serrano

### Solicitudes

1. Que es el modelo de visión por computadora, explicame como funciona el modelo, como procesa y maneja los datos y dime sus caracteristicas, ventajas y desventajas además de un ejemplo práctico de como se implementa en la vida real

2. Cuales son las herramientas que existen como apoyo para el desarrollo del prototipo de visión por computadora, tanto gratuitas como de paga, y sencillas como complejas

3. Las siguientes herramientas cuales serían las ventajas sobre el proyecto, dame su explicación aparte de como funcionan dentro del proyecto: javascript, tensorflow.js, coco-ssd, canvas, css y html

4. Dame la lista de fases del desarrollo de visión por computadora desde 0, es decir el proceso que hace para poder llegar al resultado de clasificar el objeto establecido a visualizar, el flujo y la explicación de cada fase y de que se encarga

5. Entonces con estas fases de desarrollo desde 0, cual sería la organización de las tareas que se encargaría cada integrante entre los 5 que son del equipo, el tiempo que tomaria cada fase

6. Entonces por tiempo de 4 días para desarrollo con el siguiente stack seleccionado: html, css, javascript, tensorflow, coco-ssd, canvas sería ocupar estas herramientas para poder entregar el prototipo funcional, cuales serían las fases de desarrollo y la distribución de trabajo para cada integrante

7. Entonces con el stack seleccionado genera un documento como guia de tareas de cada integrante, incluye conceptos base tanto de las herramientas como del desarrollo en si, flujo de trabajo, y tareas de cada integrante de manera que sea organizado y equitativo

8. Con el repositorio ya creado proporcióname una estructura de carpetas para el proyecto que sea viable manejar para el desarrollo del prototipo y el propósito de cada carpeta y los archivos esperados

9. Guiame paso a paso y por partes entonces para la programación del archivo app.js que me corresponde como parte de la integración y seguimiento junto con la explicación y motivo por la cual fue programa de esa manera, y las pruebas que debo realizar para verificar que funciona

10. Continua con la integración del botón de análisis de la imagen acompañado de la explicación y motivo de la línea de código

11. Examina el contenido de los nuevos archivos hechos por los otros integrantes, explícame el código de cada archivo y dime si hay detalles que se deban revisar

12. Ya hice los ajustes necesarios e integre la rama por lo que ahora ayudame a programar un mejor diseño para la página, las imagenes adjuntadas son como esta actualmente el diseño, que la paleta de colores sea acorde al objetivo y tema del proyecto, además de mejorar la estructura de los componentes para que sea vistoso y responsivo en laptops y celulares.

13. Hay que quitar el diseño de cuadros detrás de la imagen, y ocupar iconos e imágenes para darle una mejor vista al diseño, dime cuales busco para integrarlos a la página

14. Solo pude encontrar iconos en png, svg son de paga, entonces a que tamaño de pixeles debo descargarlos? Los de imagen los descargue a 256px, además debo descargar una imagen representativa para que quede ya sea en la parte superior o algo asi? Que otra paleta de colores seria recomendable

15. Mejora la distribución de los iconos para que quede al mismo nivel que la leyenda en el caso de los tipos de vehiculos y la sección de información

16. Ya revise el flujo de la página con open live server por lo que verifica el ajuste de la confianza del detector ya que eh mostrado algunas fotos donde se ven varios vehiculos, motos y no cuenta a algunos que se ven claramente, se puede modificar o ajustar esa parte?

17. Revisando el porcentaje de detector a diferencia del .5 y el .3 aunque detecta más vehiculos el porcentaje de confianza se reduce además de que el modelo de mobilenet_v2 aunque tuviera .3 no detectaba más vehiculos, por lo que para un prototipo donde se requiere que ambos sean nivelados cual sería un mejor ajuste

18. De renderer.js explicame por secciones y líneas para que sirve cada línea de código y dime que sección se debe modificar

19. Para modificar el como recibe los datos de la imagen, es decir pixeles o iluminación donde se debe ajustar para que la imagen ingresada pueda tener la detección más acertada ya sea de noche, día o iluminación saturada

20. El ajuste no es para modificar la foto original sino para que el modelo pueda leerlo mejor es decir leer imagenes con distinta iluminación, días o noche

21. Antes de hacer la prueba de programar para reconocer mejor las escenas nocturnas, primero cual sería el ajuste necesario para que una fotografia de transporte "combis" lo clasifique adecuadamente en automoviles y no cada combi en una categoria distinta si son lo mismo

22. Pero al dejar el usuario modifique el resultado implicaria que pueda manipular una imagen cuando no es necesario?

23. En el caso de utilizar el prototipo por celular lo ideal sería que también el usuario cargara el imagen desde la cámara aparte de poder hacerlo por las imagenes ya almacenadas

24. Ya abri con live server y hay varios puntos que se deben verificar, primero la confianza del contador ya que eh mostrado algunas fotos donde se ven varios vehiculos, motos y no cuenta a algunos que se ven claramente, se puede modificar o ajustar esa parte?

25. Revisando el porcentaje de detector a diferencia del .5 y el .3 aunque detecta más vehiculos el porcentaje de confianza se reduce además de que el modelo de mobilenet_v2 aunque tuviera .3 no detectaba más vehiculos, por lo que para un prototipo donde se requiere que ambos sean nivelados cual sería un mejor ajuste

26. También hay que ajustar el canvas ya que cuando realiza el análisis los recuadros y las leyendas junto con el porcentaje se llegan a tapar o encimar, por lo que una opción sería que aparte de las cantidades por categoría, sería poner la foto original comparandola con el análisis o poner otro recuadro donde el resultado del canvas o porcentaje vaya en otro componente aunque sea un componente que lleve la imagen» |

27. De renderer.js explicame por secciones y líneas para que sirve cada línea de código y dime que sección se debe modificar:» — acompañado del código de `renderer.js`. |

28. Para modificar el como recibe los datos de la imagen, es decir pixeles o iluminación donde se debe ajustar para que la imagen ingresada pueda tener la detección más acertada ya sea de noche, día o iluminación saturada» |

29. El ajuste no es para modificar la foto original sino para que el modelo pueda leerlo mejor es decir leer imagenes con distinta iluminación, días o noche» |

30. Antes de hacer la prueba de programar para reconocer mejor las escenas nocturnas, primero cual sería el ajuste necesario para que una fotografia de transporte "combis" lo clasifique adecuadamente en automoviles y no cada combi en una categoria distinta si son lo mismo» |

31. Pero al dejar el usuario modifique el resultado implicaria que pueda manipular una imagen cuando no es necesario?

32. Cual sería el nuevo desarrollo para recibir combis como una clasificación aparte

33. En el caso de utilizar el prototipo por celular lo ideal sería que también el usuario cargara el imagen desde la cámara aparte de poder hacerlo por las imágenes ya almacenadas

34. Como puedo probar en celular si todavía lo tengo localmente?

35. Al querer utilizar la cámara en el celular no hace nada si funciona el subir archivos pero el botón de cámara no se abre

36. Haciendo las modificaciones para tomar la foto sigue sin funcionar y ahora que intento cargar una imagen desde archivos si sube la imagen pero al querer analizar aparece la leyenda de "No se pudo completar el análisis. Revisa la conexión e inténtalo de nuevo"» — acompañado de `app.js` e `index.html`.

37. Ya hice las modificaciones pero sigue sin abrir la cámara, en botón de elegir archivo si carga pero al querer analizar no hace nada, no responde y esto sale en la consola:» — acompañado de la consola y los archivos.

38. Ya hice los cambios para subir directamente archivos que ya lo permite solo es el de cámara, al probar en mi celular no abre la cámara ni archivos, es un Android motorola probándolo en chrome.

39. Eran cuestiones de permisos de mi celular ya elimine el archivo de prueba de html, entonces prácticamente ya quedo esta parte, dame la lista de los prompts tal como te pedi para la integración de la funcionalidad de celular y los que te iba pidiendo para ajustar y eso después que otra cosa falta de programar.

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

## Registro 005

Fecha de registro: 2026-10-02

Herramienta: ChatGPT

Responsable: Eddie Dacosta Garcia

Los registros 005 a 007 recogen el apoyo recibido desde la investigación hasta la integración del módulo. Redacciones reconstruidas a partir de la conversación y los documentos proporcionados, organizadas para esta bitácora; no son transcripciones literales.

### Solicitud: Investigación sobre visión por computadora

Ayúdame a organizar mi investigación sobre la rama de inteligencia artificial de visión por computadora, siguiendo las instrucciones de la actividad. Explica qué es, cómo funciona, sus aplicaciones y las herramientas que se pueden utilizar. Incluye fuentes y ayúdame a preparar el documento en PDF.

### Resultado y uso

Apoyo para organizar la investigación y preparar Vision_por_computadora.pdf.

## Registro 006

Fecha de registro: 2026-10-02

Herramienta: ChatGPT

Responsable: Eddie Dacosta Garcia

### Solicitud: Caso de uso: detección de vehículos

Continuando con la investigación de visión por computadora, ayúdame a desarrollar el caso de uso de detección de carros, motos y camiones en imágenes adjuntas. Necesito explicar el problema, cómo funcionaría el prototipo, sus entradas y salidas, y justificar herramientas gratuitas para realizarlo. Organiza el contenido conforme a la actividad y prepáralo en PDF.

### Resultado y uso

Apoyo para desarrollar el caso de detección de vehículos y preparar Bloque_1_Vision_por_computadora.pdf.

## Registro 007

Fecha de registro: 2026-10-02

Herramienta: Codex

Responsable: Eddie Dacosta Garcia

### Solicitud: Apoyo para desarrollar e integrar mi módulo

Revisa la guía de tareas y los avances del repositorio del equipo. Me corresponde el módulo de modelo e inferencia; ayúdame a implementarlo e integrarlo respetando las funciones acordadas. Necesito cargar COCO-SSD con TensorFlow.js, reutilizar el modelo, manejar errores y filtrar los vehículos por confianza.

### Resultado y uso

Asistencia para implementar e integrar el detector en development conforme al contrato del equipo. El registro de comprobaciones está en [pruebas del detector](pruebas-detector.md).

Las tres etapas de Eddie se reúnen en los registros 005 a 007 de este archivo. La reflexión personal y la selección Top 3 quedan a cargo del integrante y del equipo.


## Notas de alcance del registro aportado por Eddie

Fecha de actualización: 2026-10-02 (America/Mexico_City).
Integrante: Eddie Dacosta Garcia. Herramientas: ChatGPT y Codex.

Redacciones reconstruidas a partir de la conversación y los documentos proporcionados, organizadas para esta bitácora; no son transcripciones literales.

Las solicitudes y resultados de sus apartados 1, 2 y 3 se conservan completos
 en los registros 005, 006 y 007, respectivamente; no se duplican.

### Alcance del apoyo

El proceso comprende la organización de la investigación, el desarrollo del caso
de uso y la asistencia para implementar e integrar el módulo asignado a Eddie.
Los textos anteriores describen esas solicitudes. Los resultados técnicos y las
pruebas realizadas se conservan en la documentación del detector.

La revisión humana de los materiales y del código, la reflexión personal y la
selección Top 3 quedan a cargo del integrante y del equipo.
