# AutoVision

Prototipo académico de visión por computadora para detectar y contar vehículos visibles en fotografías de calles, accesos escolares y estacionamientos.

## Problemática

El conteo manual de vehículos en fotografías requiere tiempo y puede ser difícil cuando existen varias imágenes por revisar. AutoVision automatiza una parte de este trabajo mediante detección de objetos.

## Descripción y alcance

El usuario selecciona una fotografía JPG o PNG almacenada o toma una fotografía desde la cámara en dispositivos compatibles. El sistema ejecuta COCO-SSD en el navegador, marca los vehículos detectados y muestra conteos de automóviles, motocicletas, autobuses y camiones.

El proyecto utiliza un modelo preentrenado. El equipo desarrolló la aplicación, la integración del modelo, el filtrado, el conteo, la visualización y las pruebas. No se entrenó un modelo desde cero. Se analizan fotografías individuales. No se realiza seguimiento, lectura de placas, identificación de personas, conteo de entradas y salidas ni detección de lugares disponibles.

## Rama de inteligencia artificial

Visión por computadora, mediante detección de objetos con una red neuronal preentrenada.

## Caso de uso

Una persona selecciona una fotografía de un acceso escolar, calle o estacionamiento y obtiene una estimación de la cantidad de vehículos visibles por categoría.

Los resultados se comparan con la fotografía original para identificar posibles errores.

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

No se requiere Python ni un entorno virtual. Por ello no se utiliza requirements.txt.

## Configuración del detector

- Modelo base: lite_mobilenet_v2.
- Confianza mínima predeterminada: 0.4.
- Máximo de detecciones solicitadas: 100, considerando todas las clases antes del filtrado.
- Categorías utilizadas: car, motorcycle, bus y truck.

La confianza es una puntuación del modelo; no equivale al porcentaje de exactitud del sistema. El umbral debe evaluarse con fotografías de prueba, considerando omisiones y detecciones incorrectas.

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
- Para pruebas automatizadas: una versión de Node.js que incluya el ejecutor node:test.
- Para insertar una imagen desde la cámara el navegador debe tener permisos para utilizar la camara del dispositivo.

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

La primera carga del modelo puede tardar según la conexión y el dispositivo. Abrir index.html directamente como archivo no sustituye la ejecución mediante un servidor HTTP.

## Ejecución en la web

URL pública: pendiente de publicación.

Después del despliegue, reemplazar esta línea por la URL real y verificarla desde una computadora y un celular.

## Pruebas

Desde la raíz del repositorio:

    node --test tests/counter.test.mjs tests/detector.test.mjs

Las pruebas automatizadas verifican el conteo y el comportamiento del detector con respuestas simuladas. No miden la precisión real del modelo sobre fotografías.

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

El historial de commits y los pull requests documentan las contribuciones del equipo. main contiene la versión estable y development reúne los cambios antes de su publicación. Las ramas de trabajo se integran mediante pull requests.

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

El equipo no creó ni volvió a entrenar los pesos utilizados. Los términos de COCO y las licencias de sus fotografías deben consultarse por separado de las licencias de las bibliotecas.

### Fotografías de prueba

#### Fuentes y permisos de fotografías

Las fotografías siguientes se localizaron en páginas de noticias y publicaciones de Facebook para realizar pruebas exploratorias.

Los créditos identificados no implican autorización para redistribuir las fotografías. A la fecha de este registro no se ha verificado una licencia ni un permiso de inclusión en el repositorio para estos archivos.

#### Inventario

| Archivo | Fuente | Crédito identificado | Fecha de publicación | Licencia o permiso |

|---|---|---|---|---|

| 001_sin_carros.jpg | Facebook: Centro Noticias Tehuacán | Francisco A Castro Ortega, según el crédito de la publicación | 2018-07-20 | No identificado |

| 002_carros_dia.jpg | El Sol de Puebla | Iván Rodríguez, según el crédito de la fotografía | 2025-12-01 | No identificado |

| 003_motos.jpg | UrbanoPuebla | La imagen aparece como “Foto especial”; Carolina Espinoza figura como autora del artículo. Autoría fotográfica por verificar | 2025-05-12 | No identificado |

| 004_estacionamiento.jpg | Meganoticias | Karla Elizabeth Navarrete Robles figura como autora del artículo. Autoría fotográfica por verificar | 2024-01-11 | No identificado |

| 005_carros_noche.jpg | Facebook: Hotel Casa Cantarranas Tehuacán | Francisco A Castro Ortega, según el crédito de la publicación | 12 de enero; año por verificar | No identificado |

| 006_camion.jpg | Milenio | Apolonia Amayo figura como autora del artículo. Autoría fotográfica por verificar | 2024-04-20 | No identificado |

| 007_autobuses.jpg | Meganoticias | Humberto Ramos figura como autor del artículo. Autoría fotográfica por verificar | 2018-10-04 | No identificado |

| 008_mixto.jpg | Pasajero 7 | Autoría no identificada | 2026-05-27 | No identificado |

| 009_sobreexpuesta.jpg | Facebook: Moto Red Tehuacán | Francisco Castro, según el crédito de la publicación | 2020-08-18 | No identificado |

| 010_altocontraste_quemada.jpg | Facebook: Autos Seminuevos Del Valle de Tehuacán | Imagen de perfil; autoría no identificada | Por verificar | No identificado |

#### Enlaces originales

1. https://www.facebook.com/Centro.Noticias.Tehuacan/posts/buenos-d%C3%ADas-tehuac%C3%A1n-calle-1-norte-en-tehuac%C3%A1n-pueblafoto-francisco-a-castro-ort/2173141056046553/

2. https://oem.com.mx/elsoldepuebla/local/incertidumbre-entre-transportistas-provoco-que-rutas-entre-ajalpan-y-tehuacan-dejaran-de-trabajar-27062251

3. https://www.urbanopuebla.com.mx/sociedad/motociclistas-de-tehuacan-se-oponen-a-portar-engomado-en-el-casco-con-informacion-de-la-unidad/

4. https://www.meganoticias.mx/tepic/noticia/abusivas-tarifas-de-los-estacionamientos-p%C3%BAblicos-en-centro-de-tepic/489297

5. https://www.facebook.com/hotelyspacasacantarranastehuacan/posts/vista-nocturna-de-la-avenida-reforma-norte-de-tehuac%C3%A1n-puebla-foto-francisco-a-c/1512159644242976/

6. https://www.milenio.com/politica/comunidad/transportistas-tehuacan-puebla-reportan-inseguridad-carreteras

7. https://www.meganoticias.mx/tehuacan/noticia/piden-retirar-autobuses-estacionados-que-generan-inseguridad/32899

8. https://www.pasajero7.com/autos-motos-disparan-contaminacion-en-valle-mexico-ponen-presion-la-movilidad-sustentable/

9. https://www.facebook.com/MotoRedTehuacann/posts/calles-de-tehuacan-de-nocheyosoydetehuacanfrancisco-castro/3421892077861771/

10. https://www.facebook.com/Autosseminuevosdelvalledetehuacan/

### Iconos y recursos de interfaz

Los ocho iconos PNG se descargaron de Flaticon como recursos gratuitos con atribución. Los créditos siguientes corresponden a las atribuciones facilitadas por quien realizó las descargas.

Licencia: **Licencia de Flaticon, modalidad gratuita con atribución**.
No se presentan como recursos de dominio público ni bajo Apache-2.0.

- [Condiciones de uso de Flaticon](https://www.flaticon.com/legal/).
- [Certificado general de licencia gratuita](https://www.flaticon.com/media/license/license.pdf).
- [Atribución para páginas web](https://support.flaticon.com/articles/en_US/Knowledge/Blogs-and-websites-FI).

| Archivo | Autor indicado en la atribución | Página original | Licencia |
|---|---|---|---|
| subir.png | ghufronagustian | [Subir](https://www.flaticon.es/icono-gratis/subir_3496100) | Flaticon gratuita con atribución |
| imagen.png | Gregor Cresnar | [Foto](https://www.flaticon.es/icono-gratis/imagen_159716) | Flaticon gratuita con atribución |
| informacion.png | Magnific | [Info](https://www.flaticon.es/icono-gratis/informacion_471662) | Flaticon gratuita con atribución |
| escanear.png | Grand Iconic | [Código qr](https://www.flaticon.es/icono-gratis/escanear_11967651) | Flaticon gratuita con atribución |
| coche.png | Magnific | [Coche](https://www.flaticon.es/icono-gratis/coche_2111861) | Flaticon gratuita con atribución |
| moto.png | Magnific | [Motocicleta](https://www.flaticon.es/icono-gratis/moto_1768191) | Flaticon gratuita con atribución |
| autobus-escolar.png | Magnific | [Autobús](https://www.flaticon.es/icono-gratis/autobus-escolar_2554966) | Flaticon gratuita con atribución |
| camion.png | Magnific | [Camión](https://www.flaticon.es/icono-gratis/camion_819438) | Flaticon gratuita con atribución |

La página web debe mostrar los créditos con enlaces visibles en su pie o sección de créditos. Este registro del README documenta los recursos, pero no sustituye esa atribución visible.

Los iconos se utilizan como elementos de la interfaz de AutoVision; no se ofrecen como un paquete independiente de recursos. Se mantienen bajo las condiciones de Flaticon, separadas de la licencia del código. Conservar los comprobantes de descarga y licencia que facilite la plataforma.

### Uso de inteligencia artificial generativa

Se utilizó ChatGPT y Codex para apoyar la planificación, las explicaciones técnicas, las propuestas de código, la revisión y la redacción.

Las propuestas utilizadas fueron revisadas, adaptadas e integradas por el equipo. El detalle de los archivos y cambios asistidos se encuentra en docs/bitacora-prompts.md.

La bitácora debe identificar qué contenido fue generado con IA y qué modificaciones y verificaciones realizó cada integrante.

### Código del equipo

Licencia del código propio: pendiente de definición por el equipo.

Las licencias y condiciones de los recursos de terceros se

mantienen independientes de la licencia del código propio.
