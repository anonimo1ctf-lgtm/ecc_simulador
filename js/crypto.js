// js/crypto.js

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


/**
 * Verifica si un número es primo.
 */
export function isPrime(n) {
    if (!Number.isSafeInteger(n) || n < 2) {
        return false;
    }

    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
            return false;
        }
    }

    return true;
}

/**
 * Valida los parámetros de una curva elíptica.
 * Ecuación: y² = x³ + ax + b (mod p)
 */
export function validateCurve(a, b, p) {

    // Verificar que p sea un primo válido.
    // Limitamos p a 211 para mantener pequeñas
    // las simulaciones educativas.
    if (!Number.isSafeInteger(p) ||
        p <= 3 || p > 211 || !isPrime(p)) {
        throw new RangeError(
            "El campo p debe ser primo, mayor que 3 y máximo 211."
        );
    }

    // Verificar coeficientes enteros.
    if (!Number.isSafeInteger(a) ||
        !Number.isSafeInteger(b)) {
        throw new RangeError(
            "Los coeficientes a y b deben ser enteros."
        );
    }

    // Normalizar los coeficientes en Fp.
    const aa = mod(a, p);
    const bb = mod(b, p);

    // Comprobar el discriminante.
    const discriminante = mod(
        4 * Math.pow(aa, 3) +
        27 * Math.pow(bb, 2),
        p
    );

    if (discriminante === 0) {
        throw new RangeError(
            "Curva singular: el discriminante es cero módulo p."
        );
    }

    return true;
}




export function findPoints(a, b, p) {
    // Validamos los parámetros antes de calcular puntos.
    validateCurve(a, b, p);

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


/**
 * Calcula el inverso multiplicativo modular usando el Algoritmo Extendido de Euclides.
 * Resuelve: (a * x) ≡ 1 (mod m)
 */


export function modInverse(a, m) {
    if (!Number.isSafeInteger(a) ||
        !Number.isSafeInteger(m) || m <= 1) {
        throw new RangeError(
            "El inverso modular requiere enteros y módulo mayor que 1."
        );
    }

    let oldR = mod(a, m);
    let r = m;
    let oldT = 1;
    let t = 0;

    while (r !== 0) {
        const q = Math.floor(oldR / r);

        [oldR, r] = [r, oldR - q * r];
        [oldT, t] = [t, oldT - q * t];
    }

    if (oldR !== 1) {
        throw new RangeError(
            "No existe inverso modular porque el MCD es distinto de 1."
        );
    }

    return mod(oldT, m);
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
        // Si y1 === 0, la recta tangente es vertical y el punto resultante es el punto al infinito
        if (y1 === 0) return null;

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


/**
 * Multiplica un punto P por un escalar k sobre E(F_p) usando el algoritmo Double-and-Add.
 * @param {Array<number>|null} P - Punto inicial [x, y]
 * @param {number} k - Escalar (entero positivo / clave privada)
 * @param {number} a - Coeficiente 'a' de la curva
 * @param {number} p - Campo finito primo
 * @returns {Array<number>|null} Punto resultante [x, y] o null si cae al Infinito (O)
 */
export function multiplyPoint(P, k, a, p) {
    if (!P || k <= 0) return null;

    let result = null; // Representa el Punto al Infinito (Elemento Neutro)
    let addend = P;
    let scalar = Math.floor(k);

    while (scalar > 0) {
        // Si el bit menos significativo es 1, sumamos
        if (scalar % 2 === 1) {
            result = addPoints(result, addend, a, p);
        }
        // Duplicamos el punto para la siguiente posición binaria
        addend = addPoints(addend, addend, a, p);
        // Desplazamos los bits a la derecha
        scalar = Math.floor(scalar / 2);
    }

    return result;
}