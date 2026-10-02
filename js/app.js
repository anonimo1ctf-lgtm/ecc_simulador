// js/app.js
//Esta es una prueba a ver como es el guardado de los caambios

import { initBoard, drawContinuousCurve, drawDiscretePoints, drawAdditionResult, clearAddition } from './graph.js';
import { renderStaticFormulas, updateWeierstrassEquation, showAdditionResult } from './ui.js';
import { findPoints, addPoints } from './crypto.js';

document.addEventListener('DOMContentLoaded', () => {
    
    initBoard('jxgbox');
    renderStaticFormulas();

    const inputA = document.getElementById('param-a');
    const inputB = document.getElementById('param-b');
    const inputP = document.getElementById('param-p');

    if (!inputA || !inputB || !inputP) return;

    // Variables para manejar la interacción de suma
    let selectedP = null;
    let selectedQ = null;
    let currentA, currentP;

    // Lógica al hacer clic en un punto
    const handlePointClick = (coord) => {
        // Si ya había una suma completa, reiniciamos
        if (selectedP && selectedQ) {
            selectedP = null;
            selectedQ = null;
            clearAddition();
        }

        if (!selectedP) {
            selectedP = coord;
        } else {
            selectedQ = coord;
        }

        // Si ya tenemos P y Q, calculamos R
        if (selectedP && selectedQ) {
            let R = addPoints(selectedP, selectedQ, currentA, currentP);
            showAdditionResult(selectedP, selectedQ, R);
            drawAdditionResult(selectedP, selectedQ, R);
        } else {
            // Mostramos progreso en la UI
            showAdditionResult(selectedP, null, null);
        }
    };

    const updateAll = () => {
        currentA = inputA.valueAsNumber;
        const b = inputB.valueAsNumber;
        currentP = inputP.valueAsNumber;

        // Reiniciamos selecciones
        selectedP = null;
        selectedQ = null;
        clearAddition();
        showAdditionResult(null, null, null);

        drawContinuousCurve(currentA, b);
        updateWeierstrassEquation(currentA, b);
        
        const validPoints = findPoints(currentA, b, currentP);
        // Pasamos el callback de interacción
        drawDiscretePoints(validPoints, handlePointClick);
    };

    updateAll();

    document.getElementById('ecc-form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateAll();
    });
});