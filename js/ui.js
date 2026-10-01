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

    let eq = "y^2 = x^3 ";
    
    // Lógica para formatear el coeficiente 'a' limpiamente
    if (a === 1) {
        eq += "+ x ";
    } else if (a === -1) {
        eq += "- x ";
    } else if (a > 0) {
        eq += `+ ${a}x `;
    } else if (a < 0) {
        eq += `- ${Math.abs(a)}x `;
    }

    // Lógica para formatear el coeficiente 'b' limpiamente
    if (b > 0) {
        eq += `+ ${b}`;
    } else if (b < 0) {
        eq += `- ${Math.abs(b)}`;
    }

    const container = document.getElementById('formula-weierstrass');
    
    if (container) {
        try {
            window.katex.render(eq, container, { 
                throwOnError: false,
                displayMode: true 
            });
        } catch (error) {
            console.error("Error al renderizar la ecuación de Weierstrass:", error);
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