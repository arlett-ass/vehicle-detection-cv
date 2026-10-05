/**
 * Cuenta los vehículos contenidos en una lista de detecciones.
 *
 * La función espera recibir detecciones que ya fueron filtradas
 * previamente por detector.js. No modifica la lista recibida ni
 * vuelve a aplicar umbrales de confianza.
 *
 * @param {Array<{class: string, score: number, bbox: number[]}>} detections
 * Lista de detecciones de vehículos.
 *
 * @returns {{
 *   car: number,
 *   motorcycle: number,
 *   bus: number,
 *   truck: number,
 *   total: number
 * }} Conteo de vehículos por categoría y total.
 */
export function countVehicles(detections = []) {
    const counts = {
        car: 0,
        motorcycle: 0,
        bus: 0,
        truck: 0,
        total: 0,
    };

    for (const detection of detections) {
        switch (detection.class) {
            case "car":
                counts.car += 1;
                break;

            case "motorcycle":
                counts.motorcycle += 1;
                break;

            case "bus":
                counts.bus += 1;
                break;

            case "truck":
                counts.truck += 1;
                break;

            default:
                break;
        }
    }

    counts.total =
        counts.car +
        counts.motorcycle +
        counts.bus +
        counts.truck;

    return counts;
}