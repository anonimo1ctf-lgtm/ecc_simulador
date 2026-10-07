import { initBoard, drawContinuousCurve, drawDiscretePoints, drawAdditionResult, clearAddition, drawECDHPoints, clearECDH } from './graph.js';
import { renderStaticFormulas, updateWeierstrassEquation, showAdditionResult, showECDHResult } from './ui.js';
import { findPoints, addPoints, multiplyPoint } from './crypto.js';

// ==========================================
// 1. BASE DE DATOS DE CONTENIDO
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
                    <p>Para que la curva no sea singular, su discriminante debe ser distinto de cero:</p>
                    <div class="text-center my-3">
                        $$ 4a^3 + 27b^2 \\not\\equiv 0 \\pmod{p} $$
                    </div>
                `
            },
            {
                id: 'suma-simulador',
                title: 'Simulador: Suma Geométrica',
                hasSimulator: true,
                content: `
                    <p>En este simulador puedes interactuar con los puntos discretos generados sobre el campo finito $\\mathbb{F}_p$.</p>
                    <p><strong>Instrucciones:</strong> Modifica los coeficientes y haz clic en dos puntos de la gráfica para observar la suma $P + Q$.</p>
                `
            }
        ]
    },
    'ecdh': {
        title: "2. Protocolo Diffie-Hellman (ECDH)",
        subtopics: [
            {
                id: 'ecdh-intro',
                title: 'Teoría: Intercambio de Claves',
                hasSimulator: false,
                content: `
                    <p>El protocolo ECDH permite a Alice y Bob derivar un secreto compartido $K$ en un canal inseguro.</p>
                    <p>Ambos acuerdan un punto generador $G$. Alice elige $d_A$ y envía $Q_A = d_A G$. Bob elige $d_B$ y envía $Q_B = d_B G$.</p>
                    <p>El secreto compartido se obtiene calculando:</p>
                    <div class="text-center my-3">
                        $$ K = d_A Q_B = d_A (d_B G) = d_B (d_A G) = d_B Q_A $$
                    </div>
                `
            },
            {
                id: 'ecdh-sim',
                title: 'Simulador: Protocolo ECDH',
                hasSimulator: true,
                content: `
                    <p><strong>Instrucciones:</strong> Haz clic en un punto de la gráfica para establecerlo como Punto Base $G$. Ingresa las claves privadas de Alice ($d_A$) y Bob ($d_B$) para calcular sus claves públicas y la clave secreta compartida.</p>
                `
            }
        ]
    },
    'elgamal': {
        title: "3. Cifrado Asimétrico ElGamal",
        subtopics: [
            {
                id: 'elgamal-teoria',
                title: 'Teoría: Cifrado y Descifrado',
                hasSimulator: false,
                content: `<p>El criptosistema ElGamal cifra mensajes mapeados a puntos $M$ en la curva.</p>`
            },
            {
                id: 'elgamal-simulador',
                title: 'Simulador: ElGamal',
                hasSimulator: true,
                content: `<p>Simulador en construcción.</p>`
            }
        ]
    },
    'massey': {
        title: "4. Protocolo Massey-Omura",
        subtopics: [
            {
                id: 'massey-teoria',
                title: 'Teoría: Cifrado en tres pasos',
                hasSimulator: false,
                content: `<p>Cifrado de tres pasos sin intercambio previo de claves.</p>`
            },
            {
                id: 'massey-simulador',
                title: 'Simulador: Massey-Omura',
                hasSimulator: true,
                content: `<p>Simulador en construcción.</p>`
            }
        ]
    }
};

// ==========================================
// 2. ENRUTADOR Y CONTROL DE VISTAS
// ==========================================
let currentSubtopicId = null;

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
        currentSubtopicId = subtopicData.id;
        document.getElementById('view-topic-index').classList.add('d-none');
        
        document.getElementById('subtopic-title').innerText = subtopicData.title;
        document.getElementById('btn-back-topic').onclick = () => this.navigateToTopic(parentTopicKey);

        const theoryContainer = document.getElementById('static-theory-container');
        theoryContainer.innerHTML = subtopicData.content;

        const theoryColumn = document.getElementById('theory-column');
        const simControls = document.getElementById('simulator-controls');
        const graphicArea = document.getElementById('graphic-area');
        
        if (subtopicData.hasSimulator) {
            theoryColumn.className = 'col-lg-4 col-md-5 mb-4';
            simControls.classList.remove('d-none');
            graphicArea.classList.remove('d-none');
            
            // Configurar controles específicos del protocolo activo
            setupProtocolControls(subtopicData.id);

            if (!document.getElementById('jxgbox').hasChildNodes()) {
                initBoard('jxgbox');
            }
            updateAll();
        } else {
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

// Inyecta controles de interfaz dinámicos en el formulario según el tema
function setupProtocolControls(subtopicId) {
    const extraControls = document.getElementById('protocol-extra-controls');
    const btnSubmit = document.getElementById('btn-submit-sim');

    if (subtopicId === 'ecdh-sim') {
        extraControls.innerHTML = `
            <div class="border rounded p-2 bg-light mb-3">
                <h6 class="text-primary mb-2">Parámetros ECDH</h6>
                <div class="mb-2">
                    <label class="form-label small mb-1">Clave Privada Alice ($d_A$)</label>
                    <input type="number" class="form-control form-control-sm" id="key-da" value="3" min="1" required>
                </div>
                <div class="mb-1">
                    <label class="form-label small mb-1">Clave Privada Bob ($d_B$)</label>
                    <input type="number" class="form-control form-control-sm" id="key-db" value="5" min="1" required>
                </div>
            </div>
        `;
        btnSubmit.innerText = "Simular ECDH";
    } else {
        extraControls.innerHTML = '';
        btnSubmit.innerText = "Graficar Curva";
    }
}

// ==========================================
// 3. LÓGICA DEL SIMULADOR
// ==========================================
let selectedP = null;
let selectedQ = null;
let currentA, currentP;

const handlePointClick = (coord) => {
    if (currentSubtopicId === 'ecdh-sim') {
        // En ECDH, el clic establece el Punto Base G
        selectedP = coord;
        runECDHSimulation();
    } else {
        // En Suma Geométrica, selecciona P y Q
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
    }
};

const runECDHSimulation = () => {
    const inputDa = document.getElementById('key-da');
    const inputDb = document.getElementById('key-db');

    if (!inputDa || !inputDb || !selectedP) {
        clearECDH();
        showECDHResult(null, null, null, null, null, null, null);
        return;
    }

    const dA = inputDa.valueAsNumber;
    const dB = inputDb.valueAsNumber;
    const G = selectedP;

    // Aritmética ECDH usando multiplicación escalar k * P
    const QA = multiplyPoint(G, dA, currentA, currentP);
    const QB = multiplyPoint(G, dB, currentA, currentP);
    const KA = multiplyPoint(QB, dA, currentA, currentP);
    const KB = multiplyPoint(QA, dB, currentA, currentP);

    // 1. Mostrar resultados numéricos
    showECDHResult(G, dA, dB, QA, QB, KA, KB);

    // 2. Dibujar y resaltar puntos en la gráfica
    drawECDHPoints(G, QA, QB, KA);
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
    clearECDH(); 

    updateWeierstrassEquation(currentA, b);
    drawContinuousCurve(currentA, b);
    
    const validPoints = findPoints(currentA, b, currentP);
    drawDiscretePoints(validPoints, handlePointClick);

    if (currentSubtopicId === 'ecdh-sim') {
        if (validPoints.length > 0) {
            selectedP = validPoints[0];
            runECDHSimulation();
        }
    } else {
        showAdditionResult(null, null, null);
    }
};

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