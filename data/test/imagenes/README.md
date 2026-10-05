# Imágenes de prueba

Agregar fotografías con:
- Varios tipos de vehículos.
- Ningún vehículo.
- Vehículos pequeños o lejanos.
- Vehículos parcialmente ocultos.

Para cada imagen, registrar el conteo manual en
../expected_counts.csv.

Utilizar imágenes propias o con autorización/licencia adecuada.
Registrar su origen y condiciones de uso.

# Fotografías de prueba

Esta carpeta contiene imágenes reales utilizadas para evaluar
AutoVision. No constituye un conjunto de entrenamiento.

## Propósito

Comprobar el funcionamiento completo del prototipo y comparar
sus resultados con conteos manuales de vehículos visibles.

## Selección de imágenes

Incluir fotografías que permitan revisar diferentes casos:

- Imagen sin vehículos.
- Una sola categoría de vehículo.
- Varias categorías en una fotografía.
- Varios vehículos de la misma categoría.
- Vehículos parcialmente ocultos o lejanos.
- Diferentes condiciones de iluminación, si están disponibles.

No se afirma que el sistema funcione correctamente en todas
las condiciones por incluirlas como casos de prueba.

## Nombres de archivos

Utilizar nombres sin espacios ni acentos, por ejemplo:

- sin_vehiculos.jpg
- automoviles_dia.jpg
- vehiculos_mixtos.jpg
- estacionamiento.jpg
- iluminacion_baja.jpg

Los nombres deben coincidir exactamente con filename en
../expected_counts.csv.

## Conteos de referencia

Una persona del equipo cuenta los vehículos visibles y otra
revisa el resultado cuando sea posible.

Los valores de expected_counts.csv son conteos manuales.
No deben copiarse de la salida del detector.

Las categorías son:

- car: automóviles.
- motorcycle: motocicletas.
- bus: autobuses.
- truck: camiones.

En imágenes con vehículos ambiguos, como combis, registrar
el criterio de clasificación en notes. Si no existe un criterio
acordado, no utilizar esa imagen para comparar categorías;
puede conservarse como prueba exploratoria.

## Fuentes y permisos

Registrar por fotografía:

- Nombre del archivo.
- Autor o fuente.
- URL original, si corresponde.
- Licencia o autorización de uso.
- Observaciones relevantes.

Preferir fotografías propias o recursos con permiso claro
para su redistribución en el repositorio.

## Ejecución

1. Abrir AutoVision.
2. Seleccionar una fotografía de esta carpeta.
3. Ejecutar el análisis.
4. Comparar los conteos con expected_counts.csv.
5. Revisar los recuadros para identificar omisiones y errores.
6. Registrar el resultado en docs/pruebas.md.

Los errores observados también se documentan; no se modifican
los conteos manuales para hacerlos coincidir con el modelo.