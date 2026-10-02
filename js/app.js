import { initBoard, drawContinuousCurve, drawDiscretePoints, drawAdditionResult, clearAddition } from './graph.js';
import { renderStaticFormulas, updateWeierstrassEquation, showAdditionResult } from './ui.js';
import { findPoints, addPoints } from './crypto.js';

// ==========================================
// 1. BASE DE DATOS DE CONTENIDO (Escalable)
// ==========================================
const contentData = {
    'suma': {
        title: "1. Fundamentos Matemáticos: Suma de Puntos",
        subtopics: [
            {
                id: 'suma-teoria',
                title: 'Teoría: Ecuación de Weierstrass',
                hasSimulator: false,
                content: `
                    <p>Una curva elíptica sobre un campo finito $\\mathbb{F}_p$ se define mediante la ecuación de Weierstrass reducida:</p>
                    <div class="text-center my-3">
                        $$ y^2 \\equiv x^3 + ax + b \\pmod{p} $$
                    </div>
                    <p>Para que la curva no sea singular (es decir, no tenga bucles ni picos), su discriminante debe ser distinto de cero:</p>
                    <div class="text-center my-3">
                        $$ 4a^3 + 27b^2 \\not\\equiv 0 \\pmod{p} $$
                    </div>
                    <p><em>Nota: Puedes agregar toda la teoría que quieras aquí, el sistema renderizará el LaTeX automáticamente.</em></p>
                `
            },
            {
                id: 'suma-simulador',
                title: 'Simulador: Suma Geométrica',
                hasSimulator: true,
                content: `
                    <p>En este simulador puedes interactuar con los puntos discretos generados sobre el campo finito $\\mathbb{F}_p$.</p>
                    <p><strong>Instrucciones:</strong> Modifica los coeficientes y haz clic en dos puntos de la gráfica para observar la línea secante y el resultado matemático.</p>
                `
            }
        ]
    },
    'ecdh': {
        title: "2. Protocolo Diffie-Hellman (ECDH)",
        subtopics: [
            {
                id: 'ecdh-intro',
                title: 'Introducción a ECDH',
                hasSimulator: false,
                content: '<p>Teoría sobre el intercambio de claves...</p>'
            },
            {
                id: 'ecdh-sim',
                title: 'Simulación ECDH',
                hasSimulator: true,
                content: '<p>Simulador en construcción.</p>'
            }
        ]
    }
};

// ==========================================
// 2. ENRUTADOR Y CONTROL DE VISTAS
// ==========================================
window.appRouter = {
    navigateHome: function() {
        document.getElementById('view-content').classList.add('d-none');
        document.getElementById('view-topic-index').classList.add('d-none');
        document.getElementById('view-main-index').classList.remove('d-none');
    },

    navigateToTopic: function(topicKey) {
        document.getElementById('view-main-index').classList.add('d-none');
        document.getElementById('view-content').classList.add('d-none');
        
        const topic = contentData[topicKey];
        if (!topic) return;

        document.getElementById('topic-title').innerText = topic.title;
        
        // Generar subtemas dinámicamente
        const listContainer = document.getElementById('subtopic-list');
        listContainer.innerHTML = '';
        
        topic.subtopics.forEach(sub => {
            const btn = document.createElement('button');
            btn.className = 'list-group-item list-group-item-action p-3';
            btn.innerHTML = `<h5 class="mb-1 text-secondary">${sub.title}</h5>`;
            btn.onclick = () => this.navigateToSubtopic(topicKey, sub);
            listContainer.appendChild(btn);
        });

        document.getElementById('view-topic-index').classList.remove('d-none');
    },

    navigateToSubtopic: function(parentTopicKey, subtopicData) {
        document.getElementById('view-topic-index').classList.add('d-none');
        
        document.getElementById('subtopic-title').innerText = subtopicData.title;
        document.getElementById('btn-back-topic').onclick = () => this.navigateToTopic(parentTopicKey);

        const theoryContainer = document.getElementById('static-theory-container');
        theoryContainer.innerHTML = subtopicData.content;

        // Elementos de la interfaz
        const theoryColumn = document.getElementById('theory-column');
        const simControls = document.getElementById('simulator-controls');
        const graphicArea = document.getElementById('graphic-area');
        
        if (subtopicData.hasSimulator) {
            // MODO SIMULADOR: Columna angosta
            theoryColumn.className = 'col-lg-4 col-md-5 mb-4';
            simControls.classList.remove('d-none');
            graphicArea.classList.remove('d-none');
            
            if (!document.getElementById('jxgbox').hasChildNodes()) {
                initBoard('jxgbox');
                updateAll();
            }
        } else {
            // MODO LECTURA: Columna ancha centrada
            theoryColumn.className = 'col-lg-8 col-md-10 mx-auto mb-4';
            simControls.classList.add('d-none');
            graphicArea.classList.add('d-none');
        }

        document.getElementById('view-content').classList.remove('d-none');

        if (window.renderMathInElement) {
            window.renderMathInElement(theoryContainer, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false
            });
        }
    }
};

// ==========================================
// 3. LÓGICA DEL SIMULADOR 
// ==========================================
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

    // Actualizamos la fórmula visible en la interfaz
    updateWeierstrassEquation(currentA, b);

    drawContinuousCurve(currentA, b);
    
    const validPoints = findPoints(currentA, b, currentP);
    drawDiscretePoints(validPoints, handlePointClick);
};

// Event Listener robusto para el formulario
const initForm = () => {
    const form = document.getElementById('ecc-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            updateAll();
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
} else {
    initForm();
}