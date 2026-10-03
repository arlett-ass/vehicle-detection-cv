# Aportación de Eddie a la bitácora de prompts

Fecha de inicio: 2026-10-02 (America/Mexico_City).
Integrante: Eddie Dacosta Garcia. Herramienta: Codex.
Registro separado para que Angélica pueda incorporarlo a la bitácora general.

## Solicitudes reconstruidas

Estas versiones fueron redactadas después de la conversación para explicar con
claridad su alcance. Sintetizan los mensajes, la guía de tareas y las capturas
proporcionadas por Eddie; no son transcripciones literales.

### 1. Implementación del módulo asignado

Revisa el repositorio `arlett-ass/vehicle-detection-cv`, sus ramas y los avances
del equipo. Con base en la guía adjunta, desarrolla la parte asignada a Eddie:
el módulo de modelo e inferencia en `app/src/js/detector.js` y la documentación
de sus dependencias. Respeta las funciones y formatos acordados para que el
detector pueda conectarse con el coordinador, el contador y el dibujo.

Integra TensorFlow.js y COCO-SSD preentrenado en el navegador. Implementa una
carga compartida del modelo con reintento si falla, y una función que devuelva
solo automóviles, motocicletas, autobuses y camiones según el umbral de
confianza. Conserva la clase, la puntuación y las coordenadas de cada detección.
Documenta versiones, fuentes, licencias y límites del modelo. Comprueba el
comportamiento con pruebas reproducibles y registra los resultados reales y
lo que todavía quede pendiente antes de subir mi aportación a GitHub.

Contexto utilizado: `Guia_tareas_equipo_deteccion_vehiculos.pdf`, captura de la
organización del equipo y enlace al repositorio proporcionado por Eddie.

### 2. Corrección del destino de integración

Revisa el acuerdo del equipo que adjunté: mi aportación debe quedar integrada
en `development`; subir únicamente la rama individual y dejar el PR abierto
no completa ese paso. Verifica el estado del PR e integra los cambios en
`development`, conservando los commits de mi aportación. Deja `main` para la
integración final del equipo.

Esta corrección sí ocurrió: después de que la asistencia dejó abierto el PR #3,
Eddie proporcionó la captura `1000469110.jpg` para precisar el flujo de trabajo.
Se verificó que no hubiera conflictos y se integró el PR en `development`,
conservando los commits de la aportación.

## Uso y resultado

Código y documentación propuestos con asistencia de IA: carga compartida y
reintento del modelo, inferencia y filtro de vehículos, dependencias fijadas,
pruebas unitarias y una página de prueba real independiente. Se adaptaron a los
contratos y archivos existentes en `development`, sin implementar los módulos
asignados a los otros integrantes.

Uso: modificado y verificado mediante las pruebas descritas en
`pruebas-detector.md`. La verificación automatizada no sustituye la revisión
humana del código ni la evaluación con las fotografías del equipo.

## Ajustes realizados por la asistencia

Los siguientes ajustes surgieron de la verificación de Codex; se distinguen de
la corrección del flujo de integración indicada por Eddie.

- Se verificó la distribución real de COCO-SSD: la ruta ES2017 consultada no
  existía; se usó el bundle oficial `dist/coco-ssd.min.js` de la versión fijada.
- Se comprobó que el límite de recuadros afecta todas las clases antes del
  filtro de vehículos, y que `minScore` también interviene en NMS en esta versión.
- Se añadió un estado de carga a la página de prueba para evitar activarla
  antes de que se registraran sus controles.

Revisión humana por Eddie y revisión del PR por Angélica: pendientes.
Reflexión personal y selección Top 3: pendientes de que el integrante y el equipo
las redacten con base en su experiencia; no se inventan como si ya hubieran ocurrido.
