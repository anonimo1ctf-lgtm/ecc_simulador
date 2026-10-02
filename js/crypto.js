// js/crypto.js

//Ahora este

/**
 * Función auxiliar para calcular el módulo real matemático.
 * En JS, el operador % falla con números negativos (-1 % 17 = -1, pero debería ser 16).
 */
export function mod(n, p) {
    return ((n % p) + p) % p;
}

/**
 * Encuentra todos los puntos válidos (x, y) de la curva sobre el campo finito F_p.
 * Ecuación: y^2 ≡ x^3 + ax + b (mod p)
 * 
 * @param {number} a - Coeficiente a
 * @param {number} b - Coeficiente b
 * @param {number} p - Número primo (módulo)
 * @returns {Array} Un arreglo de coordenadas [[x1, y1], [x2, y2], ...]
 */
export function findPoints(a, b, p) {
    const points = [];

    // Iteramos sobre todos los valores posibles de x (de 0 a p-1)
    for (let x = 0; x < p; x++) {
        // Lado derecho de la ecuación: x^3 + ax + b (mod p)
        let rhs = mod(Math.pow(x, 3) + (a * x) + b, p);

        // Iteramos sobre todos los valores posibles de y (de 0 a p-1)
        // Buscamos si existe algún y tal que y^2 ≡ rhs (mod p)
        for (let y = 0; y < p; y++) {
            let lhs = mod(Math.pow(y, 2), p);
            
            if (lhs === rhs) {
                points.push([x, y]);
            }
        }
    }

    return points;
}

// Agrega esto al final de js/crypto.js

/**
 * Calcula el inverso multiplicativo modular usando el Algoritmo Extendido de Euclides.
 * Resuelve: (a * x) ≡ 1 (mod m)
 */
export function modInverse(a, m) {
    let m0 = m;
    let y = 0, x = 1;

    if (m === 1) return 0;

    // Aseguramos que 'a' esté dentro del rango positivo del módulo
    let a_mod = mod(a, m); 

    while (a_mod > 1) {
        // División entera
        let q = Math.floor(a_mod / m);
        let t = m;

        // Paso del algoritmo de Euclides
        m = a_mod % m;
        a_mod = t;
        t = y;

        // Actualizamos x y y
        y = x - q * y;
        x = t;
    }

    // Aseguramos que el resultado sea positivo
    if (x < 0) x += m0;
    
    return x;
}

/**
 * Suma dos puntos P y Q en la curva elíptica sobre F_p.
 * @param {Array|null} P - Coordenadas [x1, y1] del primer punto
 * @param {Array|null} Q - Coordenadas [x2, y2] del segundo punto
 * @param {number} a - Coeficiente 'a' de la curva
 * @param {number} p - Campo finito (módulo p)
 * @returns {Array|null} El punto resultante R [x3, y3], o null si es el punto al infinito O
 */
export function addPoints(P, Q, a, p) {
    // Regla de Identidad: P + O = P
    if (P === null) return Q;
    if (Q === null) return P;

    let [x1, y1] = P;
    let [x2, y2] = Q;

    // Regla de Inversos: P + (-P) = O (Punto al infinito)
    if (x1 === x2 && mod(y1 + y2, p) === 0) {
        return null; // El punto al infinito lo representamos como null
    }

    let m;
    if (x1 === x2 && y1 === y2) {
        // Regla de Duplicación (P = Q): Tangente a la curva
        // m = (3x^2 + a) / (2y) mod p
        let num = mod(3 * Math.pow(x1, 2) + a, p);
        let den = modInverse(2 * y1, p);
        m = mod(num * den, p);
    } else {
        // Regla de Suma (P ≠ Q): Secante entre los puntos
        // m = (y2 - y1) / (x2 - x1) mod p
        let num = mod(y2 - y1, p);
        let den = modInverse(x2 - x1, p);
        m = mod(num * den, p);
    }

    // Calculamos las coordenadas del punto resultante R = P + Q
    let x3 = mod(Math.pow(m, 2) - x1 - x2, p);
    let y3 = mod(m * (x1 - x3) - y1, p);

    return [x3, y3];
}