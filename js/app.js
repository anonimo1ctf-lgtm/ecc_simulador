import {
    initBoard,
    drawContinuousCurve,
    drawDiscretePoints,
    drawAdditionResult,
    clearAddition,
    drawECDHPoints,
    clearECDH,
    drawElGamalPoints,
    clearElGamal
} from './graph.js';
import { renderStaticFormulas, updateWeierstrassEquation, showAdditionResult, showECDHResult } from './ui.js';
import {
    findPoints,
    addPoints,
    multiplyPoint,
    validateCurve,
    pointOrder,
    encryptElGamal,
    decryptElGamal
} from './crypto.js';

// 1. Datos
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
                content: `<p>Selecciona un punto base G y un mensaje M sobre la curva. Después utilizaremos las claves d y k para demostrar el cifrado y descifrado ElGamal.</p>`
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


// 2. Enrutador y control de vistas
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
    } else if (subtopicId === 'elgamal-simulador') {
        extraControls.innerHTML = `
            <div class="border rounded p-2 bg-light mb-3">
                <h6 class="text-primary mb-2">
                    Parámetros ElGamal
                </h6>

                <div class="mb-2">
                    <label for="elgamal-d" class="form-label small">
                        Clave privada de Bob (d)
                    </label>
                    <input type="number"
                           class="form-control form-control-sm"
                           id="elgamal-d"
                           value="3" min="1" step="1" required>
                </div>

                <div class="mb-2">
                    <label for="elgamal-k" class="form-label small">
                        Escalar temporal de cifrado (k)
                    </label>
                    <input type="number"
                           class="form-control form-control-sm"
                           id="elgamal-k"
                           value="2" min="1" step="1" required>
                </div>

                <p class="small text-muted mb-0">
                    Selecciona primero el punto base G
                    y después el mensaje M en la gráfica.
                </p>
            </div>
        `;

        btnSubmit.innerText = "Reiniciar selección ElGamal";
    } else {
        extraControls.innerHTML = '';
        btnSubmit.innerText = "Graficar Curva";
    }

}


// Logica del simulador
let selectedP = null;
let selectedQ = null;
let currentA, currentB, currentP;
let parametrosValidos = false;

const handlePointClick = (coord) => {
    if (!parametrosValidos) return;
    if (currentSubtopicId === 'ecdh-sim') {
        // En ECDH, el clic establece el punto base G.
        selectedP = coord;
        runECDHSimulation();

    } else if (currentSubtopicId === 'elgamal-simulador') {
        const salida = document.getElementById('theory-output');
        // Eliminar el resultado visual anterior
        // cuando comienza una nueva selección.
        if (!selectedP || selectedQ) {
            clearElGamal();
        }

        if (!selectedP || selectedQ) {
            // Primer clic: seleccionar G.
            selectedP = coord;
            selectedQ = null;

            salida.textContent =
                "Punto base G = (" + coord.join(", ") + "). " +
                "Ahora selecciona el mensaje M.";
        } else {
            // Segundo clic: seleccionar M.
            selectedQ = coord;

            salida.textContent =
                "Punto base G = (" + selectedP.join(", ") + "). " +
                "Mensaje M = (" + selectedQ.join(", ") + "). " +
                "Puntos preparados para ElGamal.";
                runElGamalSimulation();
        }

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
            showAdditionResult(selectedP, selectedQ, R, currentA, currentP);
            drawAdditionResult(selectedP, selectedQ, R);
        } else {
            showAdditionResult(selectedP, null, null);
        }
    }
};


const runECDHSimulation = () => {
    const inputDa = document.getElementById('key-da');
    const inputDb = document.getElementById('key-db');
    const salida = document.getElementById('theory-output');

    // Mostrar errores sin dejar resultados anteriores.
    const mostrarError = (mensaje) => {
        clearECDH();
        salida.innerHTML = '';

        const aviso = document.createElement('div');
        aviso.className = 'alert alert-warning mt-2';
        aviso.textContent = mensaje;

        salida.appendChild(aviso);
    };

    // No ejecutar si la curva actual es inválida.
    if (!parametrosValidos) return;

    if (!inputDa || !inputDb || !selectedP) {
        mostrarError("Selecciona un punto base válido.");
        return;
    }

    const dA = inputDa.valueAsNumber;
    const dB = inputDb.valueAsNumber;
    const G = selectedP;

    try {
        // 1. Calcular el orden del punto base.
        const n = pointOrder(
            G, currentA, currentB, currentP
        );

        // 2. Rechazar puntos de orden demasiado pequeño.
        if (n <= 2) {
            mostrarError(
                "El punto G tiene orden " + n +
                ". Selecciona un punto de orden mayor que 2."
            );
            return;
        }

        // 3. Validar las claves privadas.
        if (!Number.isSafeInteger(dA) ||
            !Number.isSafeInteger(dB) ||
            dA < 1 || dA >= n ||
            dB < 1 || dB >= n) {

            mostrarError(
                "Las claves privadas deben ser enteros " +
                "entre 1 y " + (n - 1) +
                ". El orden de G es " + n + "."
            );
            return;
        }

        // 4. Calcular las claves públicas.
        const QA = multiplyPoint(
            G, dA, currentA, currentP
        );

        const QB = multiplyPoint(
            G, dB, currentA, currentP
        );

        // 5. Calcular los secretos compartidos.
        const KA = multiplyPoint(
            QB, dA, currentA, currentP
        );

        const KB = multiplyPoint(
            QA, dB, currentA, currentP
        );

        // 6. Rechazar resultados al infinito.
        if (QA === null || QB === null ||
            KA === null || KB === null) {
            mostrarError(
                "El intercambio produjo el punto al infinito. " +
                "Selecciona otras claves o un punto base diferente."
            );
            return;
        }

        // 7. Verificar que los secretos coincidan.
        const coinciden =
            KA[0] === KB[0] &&
            KA[1] === KB[1];

        if (!coinciden) {
            mostrarError(
                "Error: Alice y Bob obtuvieron secretos distintos."
            );
            return;
        }

        // 8. Mostrar resultados y actualizar gráfica.
        showECDHResult(G, dA, dB, QA, QB, KA, KB);
        drawECDHPoints(G, QA, QB, KA);

        // 9. Mostrar información del subgrupo.
        const informacion = document.createElement('p');
        informacion.className = 'small text-muted mt-2';

        informacion.textContent =
            "Orden del punto G: " + n +
            ". Rango de claves privadas: 1 a " + (n - 1) +
            ". Secretos compartidos verificados.";

        salida.appendChild(informacion);

    } catch (error) {
        mostrarError(
            "No fue posible completar ECDH: " + error.message
        );
    }
};


/**
 * Ejecuta el cifrado y descifrado ElGamal elíptico.
 */
const runElGamalSimulation = () => {
    const salida = document.getElementById('theory-output');
    const inputD = document.getElementById('elgamal-d');
    const inputK = document.getElementById('elgamal-k');

    if (!parametrosValidos || !selectedP || !selectedQ ||
        !inputD || !inputK) {
        return;
    }

    const G = selectedP;
    const M = selectedQ;

    const d = inputD.valueAsNumber;
    const k = inputK.valueAsNumber;

    // Permite representar el punto al infinito.
    const puntoTexto = (P) => {
        return P === null
            ? "O (infinito)"
            : "(" + P[0] + ", " + P[1] + ")";
    };

    // Muestra mensajes sin alterar las otras simulaciones.
    const mostrarMensaje = (mensaje, esError = false) => {
        salida.innerHTML = '';

        const cuadro = document.createElement('div');
        cuadro.className = esError
            ? 'alert alert-warning mt-2 small'
            : 'alert alert-success mt-2 small';

        cuadro.style.whiteSpace = 'pre-line';
        cuadro.textContent = mensaje;

        salida.appendChild(cuadro);
    };

    try {
        // 1. Calcular el orden del punto base.
        const n = pointOrder(
            G, currentA, currentB, currentP
        );

        if (n <= 2) {
            throw new RangeError(
                "Selecciona un punto base de orden mayor que 2."
            );
        }

        // 2. Validar la clave privada y el escalar temporal.
        if (!Number.isSafeInteger(d) ||
            !Number.isSafeInteger(k) ||
            d < 1 || d >= n ||
            k < 1 || k >= n) {

            throw new RangeError(
                "Las claves d y k deben ser enteros " +
                "entre 1 y " + (n - 1) + "."
            );
        }

        // 3. Generar la clave pública de Bob.
        const Q = multiplyPoint(
            G, d, currentA, currentP
        );

        // 4. Cifrar el mensaje.
        const { C1, C2 } = encryptElGamal(
            M, G, Q, k,
            currentA, currentB, currentP
        );

        // 5. Calcular el secreto temporal para explicarlo.
        const S = multiplyPoint(
            Q, k, currentA, currentP
        );

        // 6. Bob calcula su secreto de descifrado.
        const secretoBob = multiplyPoint(
            C1, d, currentA, currentP
        );

        // 7. Recuperar el mensaje original.
        const recuperado = decryptElGamal(
            C1, C2, G, d,
            currentA, currentB, currentP
        );

        // 8. Comprobar que coincida con el mensaje original.
        const coincide = recuperado !== null &&
            recuperado[0] === M[0] &&
            recuperado[1] === M[1];

        if (!coincide) {
            throw new Error(
                "El mensaje recuperado no coincide con el original."
            );
        }

        // 9. Mostrar el procedimiento completo.
        const procedimiento = [
            "ELGAMAL ELÍPTICO — CIFRADO Y DESCIFRADO",
            "",
            "1. Punto base G = " + puntoTexto(G),
            "   Orden de G = " + n,
            "",
            "2. Mensaje original M = " + puntoTexto(M),
            "",
            "3. Clave privada de Bob d = " + d,
            "   Clave pública Q = dG = " + puntoTexto(Q),
            "",
            "4. Escalar temporal k = " + k,
            "   Secreto S = kQ = " + puntoTexto(S),
            "",
            "5. Primera componente C1 = kG",
            "   C1 = " + puntoTexto(C1),
            "",
            "6. Segunda componente C2 = M + kQ",
            "   C2 = " + puntoTexto(C2),
            "",
            "7. Bob calcula dC1",
            "   dC1 = " + puntoTexto(secretoBob),
            "",
            "8. Recuperación M = C2 - dC1",
            "   M recuperado = " + puntoTexto(recuperado),
            "",
            "CORRECTO: el mensaje fue recuperado."
        ].join('\n');

        mostrarMensaje(procedimiento);
        drawElGamalPoints(
            G, M, C1, C2, currentP, handlePointClick
        );

    } catch (error) {
        clearElGamal();

        mostrarMensaje(
            "No fue posible completar ElGamal:\n" +
            error.message,
            true
        );
    }
};


const updateAll = () => {
    const inputA = document.getElementById('param-a');
    const inputB = document.getElementById('param-b');
    const inputP = document.getElementById('param-p');
    
    if (!inputA || !inputB || !inputP) return;


    // Leer parámetros introducidos por el usuario.
    const a = inputA.valueAsNumber;
    const b = inputB.valueAsNumber;
    const p = inputP.valueAsNumber;

    // Validar la curva antes de realizar operaciones.
    try {
        validateCurve(a, b, p);
    } catch (error) {
        parametrosValidos = false;

        const salida = document.getElementById('theory-output');

        salida.textContent =
            "Parámetros inválidos: " + error.message +
            " Se conserva la gráfica anterior, pero la selección " +
            "de puntos queda deshabilitada hasta corregir los valores.";

        salida.classList.add('text-danger');

        return;
    }

    // Si la validación fue correcta, actualizar parámetros.
    currentA = a;
    currentB = b;
    currentP = p;
    parametrosValidos = true;

    document.getElementById('theory-output')
        .classList.remove('text-danger');


    selectedP = null;
    selectedQ = null;

 
    clearAddition(); 
    clearECDH(); 
    clearElGamal();

    updateWeierstrassEquation(currentA, b);
    drawContinuousCurve(currentA, b);
    
    const validPoints = findPoints(currentA, b, currentP);
    drawDiscretePoints(validPoints, handlePointClick);

    if (currentSubtopicId === 'ecdh-sim') {
        if (validPoints.length > 0) {
            selectedP = validPoints[0];
            runECDHSimulation();
        }
    } else if (currentSubtopicId === 'elgamal-simulador') {
        document.getElementById('theory-output').textContent =
            "ElGamal: selecciona primero el punto base G " +
            "y después el mensaje M en la gráfica.";
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