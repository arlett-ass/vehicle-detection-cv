# Aportación de Eddie a la bitácora de prompts

Fecha de inicio: 2026-10-02 (America/Mexico_City).
Integrante: Eddie Dacosta Garcia. Herramienta: Codex.
Registro separado para que Angélica pueda incorporarlo a la bitácora general.

## Prompt original completo

> Usa mi github para hacer mi parte porfa, revisa lo que ya se subió y agrega lo mío

Adjuntos de contexto: captura de la organización del equipo y
`Guia_tareas_equipo_deteccion_vehiculos.pdf`.

Mensaje posterior con el repositorio:

> https://github.com/arlett-ass/vehicle-detection-cv

## Uso y resultado

Código y documentación propuestos con asistencia de IA: carga compartida y
reintento del modelo, inferencia y filtro de vehículos, dependencias fijadas,
pruebas unitarias y una página de prueba real independiente. Se adaptaron a los
contratos y archivos existentes en `development`, sin implementar los módulos
asignados a los otros integrantes.

Uso: modificado y verificado mediante las pruebas descritas en
`pruebas-detector.md`. La verificación automatizada no sustituye la revisión
humana del código ni la evaluación con las fotografías del equipo.

## Correcciones durante la asistencia

- Se verificó la distribución real de COCO-SSD: la ruta ES2017 consultada no
  existía; se usó el bundle oficial `dist/coco-ssd.min.js` de la versión fijada.
- Se comprobó que el límite de recuadros afecta todas las clases antes del
  filtro de vehículos, y que `minScore` también interviene en NMS en esta versión.
- Se añadió un estado de carga a la página de prueba para evitar activarla
  antes de que se registraran sus controles.

Revisión humana por Eddie y revisión del PR por Angélica: pendientes.
Reflexión personal y selección Top 3: pendientes de que el integrante y el equipo
las redacten con base en su experiencia; no se inventan como si ya hubieran ocurrido.
