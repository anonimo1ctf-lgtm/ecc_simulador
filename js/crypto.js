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

    // El escalar debe ser un entero seguro no negativo.
    if (!Number.isSafeInteger(k) || k < 0) {
        throw new RangeError(
            "El escalar k debe ser un entero no negativo."
        );
    }

    // El producto por cero es el punto al infinito.
    if (P === null || k === 0) {
        return null;
    }


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


/**
 * Calcula el orden de un punto P en E(Fp).
 * El orden es el menor n > 0 tal que nP = O.
 */
export function pointOrder(P, a, b, p) {

    // Validar los parámetros de la curva.
    validateCurve(a, b, p);

    // Verificar que P tenga coordenadas válidas.
    if (!Array.isArray(P) || P.length !== 2 ||
        !P.every(v => Number.isSafeInteger(v) &&
                      v >= 0 && v < p)) {
        throw new RangeError(
            "El punto debe tener coordenadas enteras en Fp."
        );
    }

    const [x, y] = P;

    // Comprobar que el punto pertenezca a la curva.
    const lhs = mod(y * y, p);
    const rhs = mod(
        x * x * x + mod(a, p) * x + mod(b, p),
        p
    );

    if (lhs !== rhs) {
        throw new RangeError(
            "El punto no pertenece a la curva elíptica."
        );
    }

    // Número total de puntos, incluyendo O.
    const totalPuntos = findPoints(a, b, p).length + 1;

    let resultado = null;

    // Sumar P repetidamente hasta llegar a O.
    for (let n = 1; n <= totalPuntos; n++) {
        resultado = addPoints(resultado, P, a, p);

        if (resultado === null) {
            return n;
        }
    }

    throw new Error(
        "No se pudo determinar el orden del punto."
    );
}


/**
 * Calcula el punto opuesto de P en un campo finito.
 * Si P = (x,y), entonces -P = (x, -y mod p).
 * El punto al infinito es su propio opuesto.
 */
export function negatePoint(P, p) {
    if (!Number.isSafeInteger(p) ||
        p <= 3 || p > 211 || !isPrime(p)) {
        throw new RangeError(
            "El módulo debe ser primo, mayor que 3 y máximo 211."
        );
    }

    if (P === null) {
        return null;
    }

    if (!Array.isArray(P) || P.length !== 2 ||
        !P.every(v => Number.isSafeInteger(v) &&
                      v >= 0 && v < p)) {
        throw new RangeError(
            "El punto debe tener coordenadas enteras en Fp."
        );
    }

    return [P[0], mod(-P[1], p)];
}


/**
 * Cifra un punto M mediante ElGamal elíptico.
 *
 * G: punto base
 * Q: clave pública del destinatario (Q = dG)
 * k: escalar temporal de cifrado
 *
 * Devuelve el par cifrado (C1, C2).
 */
export function encryptElGamal(M, G, Q, k, a, b, p) {

    // Validar la curva.
    validateCurve(a, b, p);

    // Validar G y obtener su orden.
    const n = pointOrder(G, a, b, p);

    if (n <= 2) {
        throw new RangeError(
            "El punto base debe tener orden mayor que 2."
        );
    }

    // Validar el escalar temporal k.
    if (!Number.isSafeInteger(k) || k < 1 || k >= n) {
        throw new RangeError(
            "El escalar k debe ser un entero entre 1 y " +
            (n - 1) + "."
        );
    }

    // Verificar que M y Q pertenezcan a la curva.
    pointOrder(M, a, b, p);
    pointOrder(Q, a, b, p);

    // Primera componente: C1 = kG.
    const C1 = multiplyPoint(G, k, a, p);

    // Secreto temporal: S = kQ.
    const S = multiplyPoint(Q, k, a, p);

    if (C1 === null || S === null) {
        throw new RangeError(
            "El cifrado produjo un secreto temporal " +
            "en el punto al infinito. Selecciona otro k."
        );
    }

    // Segunda componente: C2 = M + S.
    const C2 = addPoints(M, S, a, p);

    return { C1, C2 };
}


/**
 * Descifra un mensaje ElGamal elíptico.
 *
 * C1, C2: componentes del mensaje cifrado.
 * G: punto base utilizado en el cifrado.
 * d: clave privada del destinatario.
 *
 * Devuelve el punto original M.
 */
export function decryptElGamal(C1, C2, G, d, a, b, p) {

    // 1. Validar los parámetros de la curva.
    validateCurve(a, b, p);

    // 2. Calcular el orden del punto base.
    const n = pointOrder(G, a, b, p);

    if (n <= 2) {
        throw new RangeError(
            "El punto base debe tener orden mayor que 2."
        );
    }

    // 3. Validar la clave privada.
    if (!Number.isSafeInteger(d) ||
        d < 1 || d >= n) {
        throw new RangeError(
            "La clave privada debe ser un entero entre 1 y " +
            (n - 1) + "."
        );
    }

    // 4. Comprobar que C1 pertenezca a la curva.
    pointOrder(C1, a, b, p);

    // C1 debe ser compatible con el orden del punto base.
    if (multiplyPoint(C1, n, a, p) !== null) {
        throw new RangeError(
            "C1 no pertenece al subgrupo esperado."
        );
    }

    // 5. C2 también debe pertenecer a la curva,
    // salvo cuando representa el punto al infinito.
    if (C2 !== null) {
        pointOrder(C2, a, b, p);
    }

    // 6. Bob calcula el secreto S = dC1.
    const S = multiplyPoint(C1, d, a, p);

    if (S === null) {
        throw new RangeError(
            "El secreto de descifrado es el punto al infinito."
        );
    }

    // 7. Obtener el punto opuesto de S.
    const menosS = negatePoint(S, p);

    // 8. Recuperar M = C2 + (-S).
    const M = addPoints(C2, menosS, a, p);

    return M;
}
