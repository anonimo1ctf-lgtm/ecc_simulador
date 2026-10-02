// js/ui.js

/**
 * Renderiza las variables estáticas de la interfaz.
 */
export function renderStaticFormulas() {
    // Verificamos de forma segura si KaTeX se cargó correctamente desde el HTML
    if (!window.katex) {
        console.error("KaTeX no está disponible. Revisa las etiquetas <script> en tu index.html.");
        return;
    }
    
    try {
        window.katex.render("a", document.getElementById('label-a'), { throwOnError: false });
        window.katex.render("b", document.getElementById('label-b'), { throwOnError: false });
        window.katex.render("p", document.getElementById('label-p'), { throwOnError: false });
        window.katex.render("E(\\mathbb{F}_p)", document.getElementById('formula-header'), { throwOnError: false });
    } catch (error) {
        console.error("Error al renderizar las variables estáticas:", error);
    }
}

/**
 * Actualiza dinámicamente la ecuación de Weierstrass basada en los coeficientes.
 * @param {number} a - Coeficiente 'a'
 * @param {number} b - Coeficiente 'b'
 */
export function updateWeierstrassEquation(a, b) {
    if (!window.katex) return;

    // Obtenemos el valor de p directamente del DOM
    const pInput = document.getElementById('param-p');
    const p = pInput ? pInput.value : "p";

    // 1. Renderizar Ecuación Estática (Gris, de referencia)
    const staticEq = "y^2 \\equiv x^3 + ax + b \\pmod{p}";
    const staticContainer = document.getElementById('formula-static-weierstrass');
    if (staticContainer) {
        window.katex.render(staticEq, staticContainer, { throwOnError: false, displayMode: true });
    }

    // 2. Construir y Renderizar Ecuación Dinámica (Azul, con valores)
    let eq = "y^2 \\equiv x^3 ";
    
    if (a === 1) {
        eq += "+ x ";
    } else if (a === -1) {
        eq += "- x ";
    } else if (a > 0) {
        eq += `+ ${a}x `;
    } else if (a < 0) {
        eq += `- ${Math.abs(a)}x `;
    }

    if (b > 0) {
        eq += `+ ${b} `;
    } else if (b < 0) {
        eq += `- ${Math.abs(b)} `;
    }

    // Le añadimos el campo finito a la ecuación dinámica
    eq += `\\pmod{${p}}`;

    const dynamicContainer = document.getElementById('formula-dynamic-weierstrass');
    if (dynamicContainer) {
        try {
            window.katex.render(eq, dynamicContainer, { 
                throwOnError: false,
                displayMode: true 
            });
        } catch (error) {
            console.error("Error al renderizar la ecuación dinámica:", error);
        }
    }
}

// Añade esto al final de js/ui.js

/**
 * Muestra el resultado de la suma de puntos en el panel de teoría.
 */
export function showAdditionResult(P, Q, R) {
    const container = document.getElementById('theory-output');
    if (!window.katex || !container) return;

    if (!P) {
        container.innerHTML = '<p class="text-muted text-center mt-3">Haz clic en un punto rojo de la gráfica para iniciar.</p>';
        return;
    }
    
    if (P && !Q) {
        container.innerHTML = `<p class="text-primary text-center mt-3">Punto <strong>P (${P[0]}, ${P[1]})</strong> seleccionado. Haz clic en otro punto (Q).</p>`;
        return;
    }

    // Formateamos las coordenadas para KaTeX
    let pStr = `(${P[0]}, ${P[1]})`;
    let qStr = `(${Q[0]}, ${Q[1]})`;
    let rStr = R ? `(${R[0]}, ${R[1]})` : "\\mathcal{O} \\text{ (Infinito)}";

    let eq = `P + Q = R \\\\ ${pStr} + ${qStr} = ${rStr}`;
    
    // Limpiamos el contenedor y renderizamos
    container.innerHTML = "";
    try {
        window.katex.render(eq, container, { 
            displayMode: true, 
            throwOnError: false 
        });
    } catch (error) {
        console.error("Error al renderizar la suma:", error);
    }
}