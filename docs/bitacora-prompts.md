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
Herramienta: Codex
Responsable: Eddie Dacosta Garcia

### Solicitud reconstruida: implementación del detector

Redacción posterior basada en los mensajes y la guía adjunta; no es una
transcripción literal del chat.

Revisa los avances del repositorio `arlett-ass/vehicle-detection-cv` y desarrolla
el módulo de modelo e inferencia asignado a Eddie. Integra TensorFlow.js y
COCO-SSD preentrenado, comparte la carga del modelo y permite reintentarla si
falla. Filtra automóviles, motocicletas, autobuses y camiones por confianza,
conservando clase, puntuación y coordenadas. Respeta los contratos del equipo,
documenta dependencias y limitaciones, ejecuta pruebas reproducibles y sube mi
aportación a GitHub.

### Resultado y uso

Detector con carga compartida, reintentos y filtro de vehículos; dependencias
con versiones fijas, documentación y pruebas unitarias y reales.
Resultado adaptado al repositorio y verificado mediante las pruebas registradas.
La integración se dirige a `development`, conforme al acuerdo del equipo.

El [registro detallado de Eddie](bitacora-eddie.md) describe los adjuntos de
contexto, los ajustes de la asistencia y los pendientes de revisión humana.
Resultados comprobados: [pruebas del detector](pruebas-detector.md).
Reflexión personal y selección Top 3: pendientes del integrante y del equipo.

## Registro 003

Fecha: 2026-10-02
Herramienta: Codex
Responsable: Eddie Dacosta Garcia

### Solicitud reconstruida: corrección del flujo de integración

Redacción posterior basada en la captura de coordinación que Eddie proporcionó.
La corrección del destino de integración sí ocurrió; el texto no es literal.

Mi aportación debe quedar integrada en `development`, conforme al acuerdo del
equipo. No basta con subir la rama individual y dejar el PR abierto. Revisa su
estado e integra mis cambios en `development`, conservando mis commits, y deja
`main` para la integración final del equipo.

### Resultado y uso

Se revisó el PR #3, se comprobó que no hubiera conflictos y se integró en
`development` mediante el commit `ed94521`. `main` permaneció sin cambios.
La captura adjunta precisó el destino de integración después de la primera
entrega de la asistencia. No se atribuyen al integrante correcciones de código
ni pruebas que hubiera realizado personalmente.
