# AutoVision

Prototipo académico de visión por computadora para detectar y contar
vehículos visibles en fotografías de calles, accesos escolares y
estacionamientos.

## Problemática

El conteo manual de vehículos en fotografías requiere tiempo y puede
ser difícil cuando existen varias imágenes por revisar. AutoVision
automatiza una parte de este trabajo mediante detección de objetos.

## Descripción y alcance

El usuario selecciona una fotografía JPG o PNG. El sistema ejecuta
COCO-SSD en el navegador, marca los vehículos detectados y muestra
conteos de automóviles, motocicletas, autobuses y camiones.

El proyecto utiliza un modelo preentrenado. El equipo desarrolló
la aplicación, la integración del modelo, el filtrado, el conteo,
la visualización y las pruebas. No se entrenó un modelo desde cero.

Se analizan fotografías individuales. No se realiza seguimiento,
lectura de placas, identificación de personas, conteo de entradas
y salidas ni detección de lugares disponibles.

## Rama de inteligencia artificial

Visión por computadora, mediante detección de objetos con una
red neuronal preentrenada.

## Caso de uso

Una persona selecciona una fotografía de un acceso escolar, calle
o estacionamiento y obtiene una estimación de la cantidad de
vehículos visibles por categoría.

Los resultados se comparan con la fotografía original para
identificar posibles errores.

## Herramientas y dependencias

- HTML5: estructura de la interfaz.
- CSS3: diseño y adaptación a diferentes pantallas.
- JavaScript: coordinación de la aplicación.
- TensorFlow.js 4.22.0: ejecución del modelo en el navegador.
- COCO-SSD 2.2.3: detección de objetos.
- Canvas API: dibujo de la imagen y recuadros.
- Git y GitHub: control de versiones.
- Node.js: ejecución de pruebas automatizadas.
- Visual Studio Code y Live Server: desarrollo y ejecución local.

Las dependencias y su configuración se describen en
[docs/dependencias.md](docs/dependencias.md).

No se requiere Python ni un entorno virtual. Por ello no se utiliza
requirements.txt.

## Configuración del detector

- Modelo base: lite_mobilenet_v2.
- Confianza mínima predeterminada: 0.4.
- Máximo de detecciones solicitadas: 100, considerando todas las
  clases antes del filtrado.
- Categorías utilizadas: car, motorcycle, bus y truck.

La confianza es una puntuación del modelo; no equivale al porcentaje
de exactitud del sistema. El umbral debe evaluarse con fotografías
de prueba, considerando omisiones y detecciones incorrectas.

## Estructura

- app/index.html: interfaz principal.
- app/src/css/styles.css: estilos.
- app/src/js/app.js: carga de imágenes, estados e integración.
- app/src/js/detector.js: carga del modelo y detección.
- app/src/js/counter.js: conteo por categoría.
- app/src/js/renderer.js: dibujo de resultados.
- app/public/assets/: recursos visuales.
- data/test/: fotografías y conteos manuales de referencia.
- tests/: pruebas automatizadas y de navegador.
- docs/: documentación, dependencias y bitácora.

## Requisitos

- Navegador actualizado con JavaScript habilitado.
- Conexión a internet para descargar las bibliotecas y el modelo.
- Fotografías JPG o PNG de hasta 10 MB.
- Para desarrollo local: Git, Visual Studio Code y Live Server.
- Para pruebas automatizadas: una versión de Node.js que incluya
  el ejecutor node:test.

Registrar en docs/dependencias.md la versión de Node.js utilizada.

## Instalación y ejecución local

1. Clonar el repositorio:

   git clone https://github.com/arlett-ass/vehicle-detection-cv.git

2. Abrir la carpeta vehicle-detection-cv en Visual Studio Code.
3. Instalar la extensión Live Server, si no está instalada.
4. Abrir app/index.html con Open with Live Server.
5. Seleccionar una fotografía.
6. Pulsar Analizar vehículos.
7. Revisar los recuadros, conteos y detalles de detección.

La primera carga del modelo puede tardar según la conexión y
el dispositivo. Abrir index.html directamente como archivo no
sustituye la ejecución mediante un servidor HTTP.

## Ejecución en la web

URL pública: pendiente de publicación.

Después del despliegue, reemplazar esta línea por la URL real
y verificarla desde una computadora y un celular.

## Pruebas

Desde la raíz del repositorio:

    node --test tests/counter.test.mjs tests/detector.test.mjs

Las pruebas automatizadas verifican el conteo y el comportamiento
del detector con respuestas simuladas. No miden la precisión real
del modelo sobre fotografías.

Los datos de prueba se encuentran en data/test/imagenes/.
Los conteos manuales se registran en data/test/expected_counts.csv.
Las pruebas y observaciones se documentan en docs/pruebas.md.

## Limitaciones

- Puede omitir vehículos pequeños, lejanos, ocultos o poco iluminados.
- Puede confundir categorías, especialmente vehículos como combis.
- Reducir el umbral puede aumentar las detecciones y también los errores.
- Los conteos corresponden únicamente a objetos detectados.
- El tiempo de análisis depende del dispositivo y del navegador.

## Equipo y participación

- Angélica Arlett Santiago Serrano: integración, estados de la aplicación y seguimiento.
- Eddie Dacosta García: detector y dependencias.
- Kevin Alejandro Salazar Conde: interfaz y diseño.
- Cristian Emir Torres Prieto: visualización de detecciones.
- Nicolás David Juárez Mendoza: conteo y pruebas.

El historial de commits y los pull requests documentan las
contribuciones del equipo.

main contiene la versión estable y development reúne los cambios
antes de su publicación. Las ramas de trabajo se integran mediante
pull requests.

## Créditos y licencias

### Bibliotecas y modelo

- TensorFlow.js 4.22.0:
  https://github.com/tensorflow/tfjs
  Licencia Apache-2.0.
- COCO-SSD 2.2.3:
  https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
  Licencia Apache-2.0.
- COCO, conjunto de datos utilizado para el entrenamiento del
  modelo preentrenado:
  https://cocodataset.org/

El equipo no creó ni volvió a entrenar los pesos utilizados.
Los términos de COCO y las licencias de sus fotografías deben
consultarse por separado de las licencias de las bibliotecas.

### Recursos visuales

Los autores, fuentes y licencias de los iconos y otras imágenes
se registran en app/public/assets/README.md.

Las fuentes y permisos de las fotografías de prueba se registran
en data/test/expected_counts.csv.

### Uso de inteligencia artificial generativa

Se utilizó ChatGPT y Codex para apoyar la planificación, las explicaciones
técnicas, las propuestas de código, la revisión y la redacción.

Las propuestas utilizadas fueron revisadas, adaptadas e integradas
por el equipo. El detalle de los archivos y cambios asistidos
se encuentra en docs/bitacora-prompts.md.

La bitácora debe identificar qué contenido fue generado con IA
y qué modificaciones y verificaciones realizó cada integrante.

### Código del equipo

Licencia del código propio: pendiente de definición por el equipo.

Las licencias y condiciones de los recursos de terceros se
mantienen independientes de la licencia del código propio.