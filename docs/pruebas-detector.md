# Pruebas del detector de Eddie

Ejecución: 2026-10-02, 21:47, America/Mexico_City
(inicio de prueba real: `2026-10-03T03:47:32.724Z`).
Entorno: Windows, navegador integrado Chromium 154.0.0.0, backend WebGL,
TensorFlow.js 4.22.0, COCO-SSD 2.2.3, `lite_mobilenet_v2`.
Pruebas unitarias: Node.js 24.19.0. Trabajo asistido por Codex.

## Cómo repetir

1. Desde la raíz, ejecutar `node --test tests/detector.test.mjs` (sin instalar paquetes).
2. Servir la raíz con Live Server y abrir `tests/detector-browser.html`.
3. Pulsar **Ejecutar prueba real** y esperar el mensaje de finalización.
4. Conservar el JSON mostrado: incluye versiones, backend, fuentes, dimensiones,
   tiempos, clases, scores y coordenadas. Comparar los objetos con las imágenes.

La página de prueba es independiente del contador y del renderer del producto.
Descarga fotos públicas desde sus fuentes; no envía fotografías locales.
La aplicación normal se abre en `app/index.html`, no en `frontend/index.html`.

## Pruebas unitarias: 10 de 10 aprobadas

Los modelos y fotografías de estos casos son dobles de prueba explícitos.
Comprueban el contrato del módulo, no la calidad de las predicciones reales.

| ID | Caso | Resultado esperado y obtenido | Estado |
| --- | --- | --- | --- |
| D01 | Dos cargas concurrentes y una posterior | Misma promesa/modelo, una carga, backend listo primero | Aprobado |
| D02 | Descarga simulada fallida y reintento | Ambas llamadas reciben el fallo; siguiente carga funciona | Aprobado |
| D03 | Scripts ausentes y backend fallido | Error propagado; caché liberada y recuperación posterior | Aprobado |
| D04 | Clases mezcladas y score en el límite | Solo cuatro categorías, incluye 0.5; conserva campos sin mutar origen | Aprobado |
| D05 | Dos análisis a 0.3 y 0.7 | Una carga; pasa imagen original, límite 100 y umbral correcto | Aprobado |
| D06 | 75 autos simulados | Devuelve 75; no aplica un corte oculto en 20 | Aprobado |
| D07 | Lista vacía / perro y persona | Lista vacía en ambos casos | Aprobado |
| D08 | Inferencia simulada interrumpida | Error llega al coordinador; siguiente análisis reutiliza modelo | Aprobado |
| D09 | Imagen no cargada o umbral inválido | Rechazo antes de descargar el modelo | Aprobado |
| D10 | Umbrales 0 y 1 | Ambos extremos aceptados | Aprobado |

Resumen: 10 ejecutadas, 10 aprobadas, 0 fallidas. El fallo de descarga se inyectó
en la prueba unitaria; no se afirma que se haya cortado físicamente la red.

## Inferencia real: comparación sobre las mismas fotografías

| Imagen | Dimensiones | Umbral | Autos | Motos | Autobuses | Camiones | Total | Tiempo de inferencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Trafficjam.jpg | 1600 x 1200 | 0.3 | 8 | 0 | 0 | 0 | 8 | 813 ms |
| Trafficjam.jpg | 1600 x 1200 | 0.5 | 6 | 0 | 0 | 0 | 6 | 107 ms |
| Trafficjam.jpg | 1600 x 1200 | 0.7 | 4 | 0 | 0 | 0 | 4 | 100 ms |
| image2.jpg (perros) | 600 x 399 | 0.3 | 0 | 0 | 0 | 0 | 0 | 595 ms |
| image2.jpg (perros) | 600 x 399 | 0.5 | 0 | 0 | 0 | 0 | 0 | 92 ms |
| image2.jpg (perros) | 600 x 399 | 0.7 | 0 | 0 | 0 | 0 | 0 | 93 ms |

Los tiempos son observaciones de una sola ejecución, no un benchmark. La primera
inferencia para cada tamaño puede incluir preparación del backend. No incluyen
la descarga inicial del modelo y pueden cambiar con el equipo o el navegador.

Resultados adicionales comprobados en el JSON:

- `sharedPromise: true` y `sameModel: true`: carga concurrente y posterior compartida.
- `repeatMatches: true`: repetir la foto de tráfico a 0.5 devuelve los mismos
  resultados completos, incluidas las coordenadas y puntuaciones.
- La fotografía de perros fue revisada visualmente: no contiene vehículos y
  las tres ejecuciones devuelven `[]` sin error.

### Límite de recuadros en la escena de tráfico

| maxNumBoxes | Detecciones de todas las clases a 0.5 | Vehículos filtrados |
| --- | --- | --- |
| 20 | 6 | 6 |
| 100 | 6 | 6 |
| 200 | 6 | 6 |

En esta fotografía congestionada el límite no fue el factor que redujo el
resultado: aumentar 20 a 100 o 200 no añadió detecciones. La inspección visual
muestra vehículos parciales y solapados, incluidos algunos del borde izquierdo
que no aparecen entre los seis recuadros de 0.5. Subir el límite no elimina esas
omisiones. No se asignó un conteo manual definitivo a la foto por las oclusiones.

Se conserva **100** como límite inicial explícito para evitar truncar en 20
escenas con más propuestas. D06 confirma el contrato con 75 propuestas simuladas;
esta foto real no demuestra rendimiento con más de 20 detecciones. La evaluación
con varias escenas de ese tipo sigue pendiente con el conjunto del equipo.

### Elección inicial de umbral

Se mantiene **0.5** como punto de partida acordado. En la foto, 0.7 descartó dos
detecciones adicionales y 0.3 añadió dos de menor confianza; no se decidió una
calibración final con solo dos imágenes. La versión 2.2.3 también usa este valor
en NMS, como se explica en `dependencias.md`.

No se calculan precisión ni recall a partir de esta tabla. Para ajustar el
umbral definitivo, David y Eddie deben comparar los objetos con las fotografías
del equipo, anotar omisiones, falsos positivos y categorías erróneas, y revisar
conteos manuales. No basta con que coincida el total.

## Fuentes de fotografías

- [Trafficjam.jpg](https://commons.wikimedia.org/wiki/File:Trafficjam.jpg):
  U.S. Census Bureau, dominio público según su ficha. Original:
  https://upload.wikimedia.org/wikipedia/commons/8/8f/Trafficjam.jpg
- [image2.jpg](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/demo/image2.jpg):
  fotografía de perros usada en la demo oficial. Se consulta remotamente para
  esta prueba; no se redistribuye ni se atribuye una licencia propia a la foto.

## Estado del repositorio y alcance de la verificación

Base revisada: `development` en `a202dc5` (PR #2 de Angélica integrado).
El detector, contador y renderer de esa base eran archivos pendientes.
Se revisó también `origin/Emir` en `aff0c43`, con una implementación del renderer
todavía fuera de `development`. No se sustituyeron aportaciones de compañeros.

Este PR añade el detector y las etiquetas de dependencias necesarias en HTML.
No certifica el flujo completo: `counter.js` sigue pendiente en la base y falta
integrar el renderer. El coordinador muestra `MODULES_PENDING` mientras falten
esas exportaciones, antes de llamar al modelo. La página de prueba permite
verificar el detector real sin fingir que esos módulos están listos.

Revisión humana, pruebas con fotos del equipo (incluidas motos, autobuses y
camiones reales), prueba de extremo a extremo y revisión del PR: pendientes.
Las cuatro clases sí están verificadas en D04 con datos controlados.
