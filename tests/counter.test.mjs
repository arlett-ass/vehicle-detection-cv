import test from "node:test";
import assert from "node:assert/strict";

import { countVehicles } from "../app/src/js/counter.js";

test("devuelve todos los conteos en cero cuando la lista está vacía", () => {
    const result = countVehicles([]);

    assert.deepEqual(result, {
        car: 0,
        motorcycle: 0,
        bus: 0,
        truck: 0,
        total: 0,
    });
});

test("cuenta correctamente una sola categoría", () => {
    const detections = [
        {
            class: "car",
            score: 0.91,
            bbox: [10, 20, 100, 60],
        },
    ];

    const result = countVehicles(detections);

    assert.deepEqual(result, {
        car: 1,
        motorcycle: 0,
        bus: 0,
        truck: 0,
        total: 1,
    });
});

test("cuenta correctamente una mezcla de categorías", () => {
    const detections = [
        {
            class: "car",
            score: 0.92,
            bbox: [10, 20, 100, 60],
        },
        {
            class: "motorcycle",
            score: 0.88,
            bbox: [30, 40, 80, 50],
        },
        {
            class: "bus",
            score: 0.95,
            bbox: [50, 60, 180, 100],
        },
        {
            class: "truck",
            score: 0.90,
            bbox: [70, 80, 160, 90],
        },
    ];

    const result = countVehicles(detections);

    assert.deepEqual(result, {
        car: 1,
        motorcycle: 1,
        bus: 1,
        truck: 1,
        total: 4,
    });
});

test("cuenta varios objetos de una misma categoría", () => {
    const detections = [
        {
            class: "car",
            score: 0.95,
            bbox: [10, 20, 100, 60],
        },
        {
            class: "car",
            score: 0.87,
            bbox: [120, 40, 90, 55],
        },
        {
            class: "car",
            score: 0.79,
            bbox: [230, 80, 110, 65],
        },
    ];

    const result = countVehicles(detections);

    assert.deepEqual(result, {
        car: 3,
        motorcycle: 0,
        bus: 0,
        truck: 0,
        total: 3,
    });
});

test("no modifica la lista de detecciones recibida", () => {
    const detection = Object.freeze({
        class: "truck",
        score: 0.93,
        bbox: Object.freeze([25, 30, 140, 85]),
    });

    const detections = Object.freeze([detection]);

    const result = countVehicles(detections);

    assert.deepEqual(result, {
        car: 0,
        motorcycle: 0,
        bus: 0,
        truck: 1,
        total: 1,
    });

    assert.equal(detections.length, 1);
    assert.equal(detections[0].class, "truck");
});