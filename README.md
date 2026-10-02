# Vehicle Detection CV

Prototipo web de visión por computadora para detectar y contar
vehículos visibles en fotografías individuales.

## Objetivo

Permitir que una persona seleccione una fotografía y consulte
los vehículos detectados, sus recuadros y el conteo por categoría.

## Alcance

Categorías previstas:
- Automóviles.
- Motocicletas.
- Autobuses.
- Camiones.

No incluye video, seguimiento, lectura de placas ni determinación
de entradas y salidas.

Los resultados son estimaciones y deben revisarse contra la imagen.

## Stack

- HTML y CSS: interfaz.
- JavaScript: lógica de la aplicación.
- TensorFlow.js y COCO-SSD: detección en el navegador, pendiente
  de integración.
- Canvas: visualización de detecciones, pendiente de integración.
- Git y GitHub: control de versiones.

No se utiliza backend ni base de datos.

## Estado actual

Disponible:
- Estructura del proyecto.
- Selección y visualización de imágenes JPG y PNG.
- Validación de formato y tamaño máximo de 10 MB.

Pendiente:
- Integración del modelo.
- Conteo y recuadros.
- Pruebas de detección.
- Publicación web.

## Ejecución durante el desarrollo

1. Clonar el repositorio.
2. Abrir la carpeta en Visual Studio Code.
3. Utilizar un servidor estático, por ejemplo Live Server.
4. Abrir frontend/index.html mediante ese servidor.
5. Seleccionar una fotografía JPG o PNG.

La versión inicial solo muestra la imagen; todavía no la analiza.

## Entrega web

URL: pendiente.

Las instrucciones finales y los requisitos de conexión se
actualizarán después de integrar y publicar el modelo.

## Organización

- frontend/: aplicación web.
- data/test/: imágenes y conteos manuales de referencia.
- docs/: documentación, dependencias, pruebas y bitácora.

## Trabajo colaborativo

- main: versión estable.
- development: integración.
- feat/nombre-tarea: trabajo individual.

Los cambios se integran mediante pull requests a development.
Todos los integrantes deben registrar sus aportaciones con commits.

## Integrantes

Pendiente de completar con los cinco nombres.

## Créditos y licencias

Registrar las fuentes y licencias de librerías, modelo e imágenes
en docs/dependencias.md y data/test/images/README.md.

Licencia del código del equipo: pendiente de definir.

## Uso de inteligencia artificial

La estructura y el código base fueron propuestos con asistencia
de ChatGPT. Registrar las revisiones y modificaciones realizadas
por el equipo en docs/bitacora-prompts.md.