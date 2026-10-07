// js/graph.js
//Y este
// Mantendremos la referencia global del tablero y los elementos dibujados
let board = null;
let currentElements = [];

/**
 * Inicializa el plano cartesiano interactivo de JSXGraph.
 * @param {string} containerId - El ID del contenedor en el DOM (ej. 'jxgbox')
 * @returns {Object} La instancia del tablero de JSXGraph
 */
export function initBoard(containerId) {
    board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [-10, 10, 10, -10], // [izq, arriba, der, abajo]
        axis: true,
        showNavigation: true,
        showCopyright: false,
        zoom: {
            factorX: 1.25,
            factorY: 1.25,
            wheel: true,
            needshift: false
        },
        pan: {
            enabled: true,
            needshift: false
        }
    });
    
    return board;
}

/**
 * Dibuja la curva elíptica continua sobre los números reales.
 * @param {number} a - Coeficiente 'a' de la curva
 * @param {number} b - Coeficiente 'b' de la curva
 */
export function drawContinuousCurve(a, b) {
    if (!board) {
        console.error("El plano no ha sido inicializado. Llama a initBoard primero.");
        return;
    }

    // Suspendemos la actualización visual para mejorar el rendimiento al borrar/dibujar
    board.suspendUpdate();

    // Limpiamos los elementos dibujados anteriormente
    currentElements.forEach(el => board.removeObject(el));
    currentElements = [];

    // Definimos la función matemática: y = sqrt(x^3 + ax + b)
    // JSXGraph grafica y = f(x), por lo que necesitamos graficar la parte positiva y negativa.
    const curveFunctionPos = function(x) {
        let val = Math.pow(x, 3) + (a * x) + b;
        return val >= 0 ? Math.sqrt(val) : NaN; // NaN evita que dibuje en zonas complejas
    };

    const curveFunctionNeg = function(x) {
        let val = Math.pow(x, 3) + (a * x) + b;
        return val >= 0 ? -Math.sqrt(val) : NaN;
    };

    // Trazamos la mitad superior
    let graphPos = board.create('functiongraph', [curveFunctionPos], {
        strokeColor: '#0d6efd', // Azul de Bootstrap para mantener coherencia visual
        strokeWidth: 2.5,
        highlight: false
    });

    // Trazamos la mitad inferior
    let graphNeg = board.create('functiongraph', [curveFunctionNeg], {
        strokeColor: '#0d6efd',
        strokeWidth: 2.5,
        highlight: false
    });

    // Guardamos las referencias para borrarlas cuando el usuario cambie los parámetros
    currentElements.push(graphPos, graphNeg);

    board.unsuspendUpdate();
}

/**
 * (Placeholder) Función para dibujar los puntos discretos del campo finito F_p.
 * La conectaremos con crypto.js más adelante.
 */
// Reemplaza drawDiscretePoints y añade lo siguiente en js/graph.js

let discretePoints = []; 
let additionElements = []; // Guardará las líneas y puntos de la suma

/**
 * Dibuja los puntos discretos y les añade un evento de clic.
 */
export function drawDiscretePoints(points, onPointClick) {
    if (!board) return;

    board.suspendUpdate();
    discretePoints.forEach(p => board.removeObject(p));
    discretePoints = [];

    points.forEach(coord => {
        let p = board.create('point', coord, {
            name: '',
            size: 4,
            fillColor: '#dc3545', // Rojo
            strokeColor: '#dc3545',
            fixed: true
        });

        // Evento de clic en JSXGraph
        p.on('down', function() {
            if (onPointClick) onPointClick(coord);
        });

        discretePoints.push(p);
    });

    board.unsuspendUpdate();
}

/**
 * Limpia los trazos de una suma anterior.
 */
export function clearAddition() {
    if (!board) return;
    board.suspendUpdate();
    additionElements.forEach(el => board.removeObject(el));
    additionElements = [];
    board.unsuspendUpdate();
}

/**
 * Dibuja la línea geométrica y resalta los puntos involucrados.
 */
export function drawAdditionResult(P, Q, R) {
    if (!board) return;
    board.suspendUpdate();

    // Dibujamos una línea secante verde si los puntos son diferentes
    if (P && Q && (P[0] !== Q[0] || P[1] !== Q[1])) {
        let line = board.create('line', [P, Q], {
            strokeColor: '#198754', // Verde Bootstrap
            strokeWidth: 2,
            dash: 2 // Línea punteada
        });
        additionElements.push(line);
    }

    // Resaltamos el punto resultante R en amarillo
    if (R) {
        let rPoint = board.create('point', R, {
            name: 'R',
            size: 6,
            fillColor: '#ffc107', // Amarillo warning
            strokeColor: '#000',
            fixed: true
        });
        additionElements.push(rPoint);
    }

    board.unsuspendUpdate();
}

// Almacena los elementos visuales creados para ECDH
let ecdhElements = [];

/**
 * Limpia las marcas de ECDH en el tablero.
 */
export function clearECDH() {
    if (typeof board !== 'undefined' && board) {
        ecdhElements.forEach(el => board.removeObject(el));
    }
    ecdhElements = [];
}

/**
 * Dibuja y resalta en la gráfica los puntos clave de ECDH con colores distintivos.
 */
export function drawECDHPoints(G, QA, QB, K) {
    clearECDH();
    if (!board) return;

    // 1. Punto Base G (Naranja)
    if (G) {
        let pG = board.create('point', [G[0], G[1]], {
            name: 'G (Base)',
            size: 8,                  // Un poco más grande para que sobresalga
            fillColor: '#ffc107',     // Amarillo puro
            strokeColor: '#000000',   // Borde negro para máximo contraste
            strokeWidth: 2,
            fixed: true,
            label: { offset: [10, 10], color: '#d39e00' }
        });
        ecdhElements.push(pG);
    }

    // 2. Clave Pública QA - Alice (Púrpura)
    if (QA) {
        let pQA = board.create('point', [QA[0], QA[1]], {
            name: 'Q_A (Alice)',
            size: 6,
            fillColor: '#6f42c1',
            strokeColor: '#3c1880',
            fixed: true,
            label: { offset: [-25, -15], color: '#6f42c1' }
        });
        ecdhElements.push(pQA);
    }

    // 3. Clave Pública QB - Bob (Cian)
    if (QB) {
        let pQB = board.create('point', [QB[0], QB[1]], {
            name: 'Q_B (Bob)',
            size: 6,
            fillColor: '#0dcaf0',
            strokeColor: '#087990',
            fixed: true,
            label: { offset: [10, -15], color: '#0dcaf0' }
        });
        ecdhElements.push(pQB);
    }

    // 4. Secreto Compartido K (Verde)
    if (K) {
        let pK = board.create('point', [K[0], K[1]], {
            name: 'K (Secreto)',
            size: 7,
            fillColor: '#198754',
            strokeColor: '#0a3622',
            fixed: true,
            label: { offset: [0, 18], color: '#198754' }
        });
        ecdhElements.push(pK);
    }
}