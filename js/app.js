import { initBoard, drawContinuousCurve, drawDiscretePoints, drawAdditionResult, clearAddition } from './graph.js';
import { renderStaticFormulas, updateWeierstrassEquation, showAdditionResult } from './ui.js';
import { findPoints, addPoints } from './crypto.js';

// Objeto Global para manejar la navegación desde el HTML
window.appRouter = {
    navigateTo: function(topic) {
        document.getElementById('view-index').classList.add('d-none');
        document.getElementById('view-simulator').classList.remove('d-none');
        loadTopicData(topic);
        
        // Inicializamos la gráfica solo si no existe
        if (!document.getElementById('jxgbox').hasChildNodes()) {
            initBoard('jxgbox');
            updateAll();
        }
    },
    navigateHome: function() {
        document.getElementById('view-simulator').classList.add('d-none');
        document.getElementById('view-index').classList.remove('d-none');
    }
};

// Carga la teoría y ajusta la interfaz según el tema elegido
function loadTopicData(topic) {
    const theoryContainer = document.getElementById('theory-description');
    const panelTitle = document.getElementById('panel-title');

    switch(topic) {
        case 'suma':
            panelTitle.innerText = "Suma de Puntos";
            theoryContainer.innerHTML = `
                <p class="small text-muted"><strong>Fundamento:</strong> En criptografía de curvas elípticas, la operación fundamental es la suma de puntos. Selecciona dos puntos en la gráfica para visualizar cómo se traza la secante y se obtiene el punto resultante.</p>
            `;
            break;
        case 'ecdh':
            panelTitle.innerText = "Protocolo ECDH";
            theoryContainer.innerHTML = `
                <p class="small text-muted"><strong>ECDH:</strong> Permite a dos partes generar una clave secreta compartida multiplicando un punto base por sus claves privadas. (Simulación en construcción).</p>
            `;
            break;
        case 'elgamal':
            panelTitle.innerText = "Cifrado ElGamal";
            theoryContainer.innerHTML = `
                <p class="small text-muted"><strong>ElGamal:</strong> Cifra un mensaje sumándolo con una clave pública temporal. (Simulación en construcción).</p>
            `;
            break;
        case 'massey':
            panelTitle.innerText = "Massey-Omura";
            theoryContainer.innerHTML = `
                <p class="small text-muted"><strong>Massey-Omura:</strong> Protocolo de tres pasos donde el mensaje viaja cifrado en todo momento. (Simulación en construcción).</p>
            `;
            break;
    }
}

// Variables para la lógica interactiva
let selectedP = null;
let selectedQ = null;
let currentA, currentP;

const handlePointClick = (coord) => {
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
    if (selectedP && selectedQ) {
        let R = addPoints(selectedP, selectedQ, currentA, currentP);
        showAdditionResult(selectedP, selectedQ, R);
        drawAdditionResult(selectedP, selectedQ, R);
    } else {
        showAdditionResult(selectedP, null, null);
    }
};

const updateAll = () => {
    const inputA = document.getElementById('param-a');
    const inputB = document.getElementById('param-b');
    const inputP = document.getElementById('param-p');
    
    if (!inputA || !inputB || !inputP) return;

    currentA = inputA.valueAsNumber;
    const b = inputB.valueAsNumber;
    currentP = inputP.valueAsNumber;

    selectedP = null;
    selectedQ = null;
    clearAddition();
    showAdditionResult(null, null, null);

    drawContinuousCurve(currentA, b);
    
    const validPoints = findPoints(currentA, b, currentP);
    drawDiscretePoints(validPoints, handlePointClick);
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ecc-form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateAll();
    });
});