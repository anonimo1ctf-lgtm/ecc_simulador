import {
    initBoard,
    drawContinuousCurve,
    drawDiscretePoints,
    drawAdditionResult,
    clearAddition,
    drawECDHPoints,
    clearECDH,
    drawElGamalPoints,
    clearElGamal,
    drawMasseyOmuraPoints,
    clearMasseyOmura
} from './graph.js';
import { renderStaticFormulas, updateWeierstrassEquation, showAdditionResult, showECDHResult } from './ui.js';
import {
    findPoints,
    addPoints,
    multiplyPoint,
    validateCurve,
    pointOrder,
    encryptElGamal,
    decryptElGamal,
    simulateMasseyOmura
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

    <h5 class="text-primary mt-4">
        ¿Qué es un campo finito?
    </h5>

    <p>
        Un campo finito Fp es un conjunto de números
        enteros sobre los cuales realizamos operaciones
        utilizando aritmética modular.
    </p>

    <p>
        En nuestro simulador, p debe ser un número primo
        mayor que 3. Las coordenadas de los puntos
        toman valores enteros entre 0 y p - 1.
    </p>

    <h5 class="text-primary mt-4">
        Puntos de una curva elíptica
    </h5>

    <p>
        Un punto P = (x, y) pertenece a la curva
        cuando sus coordenadas satisfacen
        la ecuación de Weierstrass módulo p.
    </p>

    <p>
        Por ejemplo, para a = -1, b = 1 y p = 17,
        existen 13 puntos con coordenadas finitas.
        Al incluir el punto al infinito,
        el grupo contiene 14 elementos.
    </p>

    <h5 class="text-primary mt-4">
        El punto al infinito
    </h5>

    <p>
        El punto al infinito, representado por O,
        funciona como elemento neutro de la suma.
        Esto significa que sumar O a cualquier
        punto P no modifica su valor.
    </p>

    <div class="text-center my-3">
        $$ P + O = P $$
    </div>

    <p>
        Cada punto P también tiene un punto opuesto.
        Cuando sumamos ambos, obtenemos O.
    </p>

    <div class="text-center my-3">
        $$ P + (-P) = O $$
    </div>


    <h5 class="text-primary mt-4">
        Suma de dos puntos diferentes
    </h5>

    <p>
        Para sumar dos puntos diferentes
        P = (x1, y1) y Q = (x2, y2),
        calculamos una pendiente modular.
        Cuando sus coordenadas x son diferentes,
        utilizamos:
    </p>

    <div class="text-center my-3">
        $$ \\lambda = (y_2-y_1)(x_2-x_1)^{-1} \\pmod{p} $$
    </div>

    <p>
        El exponente -1 representa el inverso
        multiplicativo modular del denominador.
        No es una división convencional.
    </p>

    <h5 class="text-primary mt-4">
        Duplicación de un punto
    </h5>

    <p>
        Cuando sumamos un punto consigo mismo,
        P + P = 2P, utilizamos la pendiente
        de duplicación, siempre que y1 sea
        diferente de cero:
    </p>

    <div class="text-center my-3">
        $$ \\lambda = (3x_1^2+a)(2y_1)^{-1} \\pmod{p} $$
    </div>

    <h5 class="text-primary mt-4">
        Coordenadas del resultado
    </h5>

    <p>
        Una vez calculada la pendiente,
        obtenemos las coordenadas del punto
        resultante R = (x3, y3).
    </p>

    <div class="text-center my-3">
        $$ x_3 = \\lambda^2-x_1-x_2 \\pmod{p} $$
    </div>

    <div class="text-center my-3">
        $$ y_3 = \\lambda(x_1-x_3)-y_1 \\pmod{p} $$
    </div>

    <p>
        Si los puntos son opuestos, su suma
        es el punto al infinito O.
        También obtenemos O al duplicar
        un punto cuya coordenada y es cero.
    </p>


    <h5 class="text-primary mt-4">
        Ejemplo numérico: suma de dos puntos
    </h5>

    <p>
        Consideremos la curva con a = -1,
        b = 1 y p = 17. Queremos sumar:
    </p>

    <div class="text-center my-3">
        $$ P = (0,1), \\quad Q = (1,1) $$
    </div>

    <h6 class="mt-3">Paso 1: Calcular la pendiente</h6>

    <p>
        Como las coordenadas x son diferentes,
        aplicamos la fórmula de suma de puntos.
        El denominador es 1 y su inverso
        modular respecto a 17 también es 1.
    </p>

    <div class="text-center my-3">
        $$ \\lambda = (1-1)(1-0)^{-1} = 0 $$
    </div>

    <h6 class="mt-3">Paso 2: Calcular x3</h6>

    <div class="text-center my-3">
        $$ x_3 = 0^2-0-1 = -1 \\equiv 16 \\pmod{17} $$
    </div>

    <h6 class="mt-3">Paso 3: Calcular y3</h6>

    <div class="text-center my-3">
        $$ y_3 = 0(0-16)-1 = -1 \\equiv 16 \\pmod{17} $$
    </div>

    <div class="alert alert-success mt-3">
        <strong>Resultado:</strong>
        P + Q = (16, 16).
        El punto obtenido pertenece a la misma
        curva elíptica sobre el campo finito.
    </div>


    <div class="alert alert-info mt-3">
        <strong>Importante:</strong>
        Los puntos del campo finito son discretos.
        La curva continua que aparece en la gráfica
        sirve como referencia visual y no representa
        las operaciones modulares del campo.
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

    <h5 class="text-primary mt-4">
        ¿Qué información intercambian Alice y Bob?
    </h5>

    <p>
        Antes de comenzar, ambos participantes
        acuerdan utilizar la misma curva elíptica
        y el mismo punto base G.
    </p>

    <p>
        Alice selecciona una clave privada dA
        y calcula su clave pública QA.
        Bob selecciona una clave privada dB
        y calcula su clave pública QB.
    </p>

    <div class="text-center my-3">
        $$ Q_A = d_A G $$
    </div>

    <div class="text-center my-3">
        $$ Q_B = d_B G $$
    </div>

    <p>
        Alice envía QA a Bob y Bob envía QB
        a Alice. Las claves privadas dA y dB
        nunca deben transmitirse.
    </p>

    <h5 class="text-primary mt-4">
        ¿Por qué coinciden los secretos?
    </h5>

    <p>
        Alice multiplica la clave pública
        de Bob por su clave privada.
        Bob realiza la operación equivalente
        utilizando la clave pública de Alice.
    </p>

    <p>
        Como ambas operaciones equivalen a
        multiplicar el punto G por el producto
        de las claves privadas, Alice y Bob
        obtienen el mismo punto de la curva.
    </p>


    <h5 class="text-primary mt-4">
        Ejemplo numérico de ECDH
    </h5>

    <p>
        Utilizaremos la curva con a = -1, b = 1
        y p = 17. El punto base seleccionado
        es G = (0, 1), cuyo orden es 14.
    </p>

    <div class="table-responsive">
        <table class="table table-bordered table-sm">
            <thead class="table-light">
                <tr>
                    <th>Parámetro</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Punto base G</td><td>(0, 1)</td></tr>
                <tr><td>Clave privada Alice dA</td><td>3</td></tr>
                <tr><td>Clave privada Bob dB</td><td>5</td></tr>
                <tr><td>Clave pública Alice QA</td><td>(5, 11)</td></tr>
                <tr><td>Clave pública Bob QB</td><td>(1, 16)</td></tr>
            </tbody>
        </table>
    </div>

    <h6 class="mt-3">Cálculo del secreto compartido</h6>

    <p>
        Alice multiplica la clave pública de Bob
        por su clave privada.
    </p>

    <div class="text-center my-3">
        $$ K_A = 3Q_B = (0,1) $$
    </div>

    <p>
        Bob multiplica la clave pública de Alice
        por su propia clave privada.
    </p>

    <div class="text-center my-3">
        $$ K_B = 5Q_A = (0,1) $$
    </div>

    <div class="alert alert-success mt-3">
        <strong>Resultado:</strong>
        Alice y Bob obtienen el mismo punto
        secreto K = (0, 1), sin transmitir
        sus claves privadas.
    </div>


    <div class="alert alert-warning mt-3">
        <strong>Uso educativo:</strong>
        Este simulador utiliza parámetros
        pequeños para mostrar las operaciones.
        En aplicaciones reales se necesitan
        curvas seguras, validación de claves
        y una función de derivación de claves
        para obtener una clave simétrica
        a partir del secreto compartido.
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

content: `
    <h5 class="text-primary">
        ¿Qué es ElGamal elíptico?
    </h5>

    <p>
        ElGamal es un criptosistema de clave pública
        que permite cifrar y descifrar mensajes.
        Su versión elíptica utiliza operaciones
        entre puntos de una curva elíptica.
    </p>

    <p>
        En nuestro simulador, el mensaje se representa
        mediante un punto M perteneciente a la curva.
        El destinatario utiliza una clave privada d
        y una clave pública Q, calculada a partir
        de un punto base G.
    </p>

    <p>
        Para cifrar, el emisor utiliza la clave pública
        del destinatario y un escalar temporal k.
        El resultado es un par de puntos cifrados
        que el destinatario puede utilizar para
        recuperar el mensaje original.
    </p>


    <h5 class="text-primary mt-4">
        1. Generación de claves
    </h5>

    <p>
        Bob selecciona una clave privada d y calcula
        su clave pública Q multiplicando el punto
        base G por esa clave.
    </p>

    <div class="text-center my-3">
        $$ Q = dG $$
    </div>

    <h5 class="text-primary mt-4">
        2. Cifrado del mensaje
    </h5>

    <p>
        Alice representa el mensaje mediante un punto M,
        selecciona un escalar temporal k y calcula
        dos componentes cifrados.
    </p>

    <div class="text-center my-3">
        $$ C_1 = kG $$
    </div>

    <div class="text-center my-3">
        $$ C_2 = M + kQ $$
    </div>

    <p>
        Alice envía el par de puntos (C1, C2) a Bob.
        La clave privada d permanece secreta.
    </p>

    <h5 class="text-primary mt-4">
        3. Descifrado del mensaje
    </h5>

    <p>
        Bob utiliza su clave privada d para eliminar
        del segundo componente la transformación
        aplicada durante el cifrado.
    </p>

    <div class="text-center my-3">
        $$ M = C_2 - dC_1 $$
    </div>

    <p>
        Como Q = dG, se cumple que dC1 = kQ.
        Al restar ese punto, Bob recupera el
        mensaje original M.
    </p>


    <h5 class="text-primary mt-4">
        4. Ejemplo numérico paso a paso
    </h5>

    <p>
        Consideremos la curva con a = -1, b = 1
        y p = 17. El mensaje original se
        representa mediante el punto M = (1, 1).
    </p>

    <div class="table-responsive">
        <table class="table table-bordered table-sm">
            <thead class="table-light">
                <tr>
                    <th>Parámetro</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Punto base G</td><td>(0, 1)</td></tr>
                <tr><td>Clave privada de Bob d</td><td>3</td></tr>
                <tr><td>Clave pública Q = 3G</td><td>(5, 11)</td></tr>
                <tr><td>Mensaje M</td><td>(1, 1)</td></tr>
                <tr><td>Escalar temporal k</td><td>2</td></tr>
            </tbody>
        </table>
    </div>

    <h6 class="mt-3">Proceso de cifrado</h6>

    <p>
        Alice calcula la primera componente C1 = kG
        y el secreto temporal S = kQ.
        Después obtiene C2 = M + S.
    </p>

    <div class="table-responsive">
        <table class="table table-striped table-bordered table-sm">
            <thead class="table-light">
                <tr>
                    <th>Operación</th>
                    <th>Resultado</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>C1 = 2G</td><td>(13, 14)</td></tr>
                <tr><td>S = 2Q</td><td>(3, 5)</td></tr>
                <tr><td>C2 = M + S</td><td>(0, 1)</td></tr>
            </tbody>
        </table>
    </div>

    <h6 class="mt-3">Proceso de descifrado</h6>

    <p>
        Bob calcula dC1 = 3C1 = (3, 5).
        A continuación obtiene el punto opuesto
        -dC1 = (3, 12) y lo suma con C2.
    </p>

    <div class="alert alert-success mt-3">
        <strong>Resultado:</strong>
        M = (0, 1) + (3, 12) = (1, 1).
        Bob recupera exactamente el mensaje original.
    </div>


    <div class="alert alert-warning mt-3">
        <strong>Uso educativo:</strong>
        Las curvas y claves pequeñas utilizadas
        en esta plataforma no ofrecen seguridad
        criptográfica para aplicaciones reales.
    </div>
`

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
                content: `
    <h5 class="text-primary">¿Qué es Massey-Omura?</h5>

    <p>
        Massey-Omura es un protocolo criptográfico
        de tres transmisiones que permite intercambiar
        un mensaje sin compartir previamente las
        claves privadas de Alice y Bob.
    </p>

    <p>
        En nuestra implementación, el mensaje se
        representa mediante un punto M perteneciente
        a una curva elíptica sobre un campo finito.
    </p>

    <p>
        Alice y Bob utilizan exponentes privados
        y sus respectivos inversos modulares
        para transformar y recuperar el mensaje.
    </p>

    <h5 class="text-primary mt-4">
        Preparación de las claves privadas
    </h5>

    <p>
        Alice y Bob seleccionan exponentes privados
        que tengan inverso modular respecto a N,
        el número total de puntos de la curva,
        incluyendo el punto al infinito.
    </p>

    <p>
        Alice utiliza los valores eA y dA:
    </p>

    <div class="text-center my-3">
        $$ e_A d_A \\equiv 1 \\pmod{N} $$
    </div>

    <p>
        Bob utiliza los valores eB y dB:
    </p>

    <div class="text-center my-3">
        $$ e_B d_B \\equiv 1 \\pmod{N} $$
    </div>

    <h5 class="text-primary mt-4">
        Las tres transmisiones del protocolo
    </h5>

    <p>
        Alice y Bob aplican sus exponentes privados
        sobre el mensaje M siguiendo estos pasos:
    </p>

    <h6 class="mt-3">Paso 1: Alice envía a Bob</h6>
    <p>
        Alice multiplica el mensaje M por su exponente eA.
    </p>
    <div class="text-center my-3">
        $$ M_1 = e_A M $$
    </div>

    <h6 class="mt-3">Paso 2: Bob devuelve a Alice</h6>
    <p>
        Bob multiplica el punto recibido por su exponente eB.
    </p>
    <div class="text-center my-3">
        $$ M_2 = e_B M_1 $$
    </div>

    <h6 class="mt-3">Paso 3: Alice envía a Bob</h6>
    <p>
        Alice utiliza su inverso modular dA para
        eliminar su transformación del mensaje.
    </p>
    <div class="text-center my-3">
        $$ M_3 = d_A M_2 $$
    </div>

    <h5 class="text-success mt-4">
        Recuperación del mensaje original
    </h5>

    <p>
        Finalmente, Bob aplica su inverso modular dB
        y recupera el punto M enviado inicialmente.
    </p>

    <div class="text-center my-3">
        $$ M = d_B M_3 $$
    </div>

    <h5 class="text-primary mt-4">
        Ejemplo numérico paso a paso
    </h5>

    <p>
        Consideremos la curva elíptica con
        a = -1, b = 1 y p = 17.
        Esta curva tiene 14 puntos en total,
        incluyendo el punto al infinito.
    </p>

    <p>
        Alice desea enviar el mensaje M = (0, 1).
        Para ello utiliza los siguientes valores:
    </p>

    <table class="table table-bordered table-sm">
        <thead class="table-light">
            <tr>
                <th>Parámetro</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Orden del grupo N</td><td>14</td></tr>
            <tr><td>Exponente Alice eA</td><td>3</td></tr>
            <tr><td>Inverso Alice dA</td><td>5</td></tr>
            <tr><td>Exponente Bob eB</td><td>9</td></tr>
            <tr><td>Inverso Bob dB</td><td>11</td></tr>
        </tbody>
    </table>

    <h6 class="mt-3">Resultados de las transmisiones</h6>

    <div class="table-responsive">
        <table class="table table-striped table-bordered table-sm">
            <thead class="table-light">
                <tr>
                    <th>Operación</th>
                    <th>Punto obtenido</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Mensaje original M</td><td>(0, 1)</td></tr>
                <tr><td>M1 = 3M</td><td>(5, 11)</td></tr>
                <tr><td>M2 = 9M1</td><td>(0, 16)</td></tr>
                <tr><td>M3 = 5M2</td><td>(1, 1)</td></tr>
                <tr><td>M = 11M3</td><td>(0, 1)</td></tr>
            </tbody>
        </table>
    </div>

    <div class="alert alert-success mt-3">
        <strong>Resultado:</strong>
        Bob recupera el punto original M = (0, 1),
        demostrando que las transformaciones
        realizadas por Alice y Bob se cancelan.
    </div>
    <div class="alert alert-warning mt-3">
        <strong>Uso educativo:</strong>
        Este simulador utiliza parámetros pequeños
        para explicar las operaciones matemáticas.
        No debe utilizarse para proteger información real.
    </div>`
            },
            {
                id: 'massey-simulador',
                title: 'Simulador: Massey-Omura',
                hasSimulator: true,
                content: `<p>Selecciona un punto M de la curva y utiliza los exponentes privados de Alice y Bob para simular las tres transmisiones de Massey-Omura y recuperar el mensaje original.</p>`
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

    } else if (subtopicId === 'massey-simulador') {
        extraControls.innerHTML = `
            <div class="border rounded p-2 bg-light mb-3">
                <h6 class="text-primary mb-2">
                    Parámetros Massey-Omura
                </h6>

                <div class="mb-2">
                    <label for="massey-ea" class="form-label small">
                        Exponente privado de Alice (eA)
                    </label>
                    <input type="number"
                           class="form-control form-control-sm"
                           id="massey-ea"
                           value="3" min="2" step="1" required>
                </div>

                <div class="mb-2">
                    <label for="massey-eb" class="form-label small">
                        Exponente privado de Bob (eB)
                    </label>
                    <input type="number"
                           class="form-control form-control-sm"
                           id="massey-eb"
                           value="9" min="2" step="1" required>
                </div>

                <p class="small text-muted mb-0">
                    Selecciona el punto M que representa
                    el mensaje en la gráfica.
                    Los exponentes deben tener inverso
                    módulo el orden del grupo.
                </p>
            </div>
        `;

        btnSubmit.innerText =
            "Reiniciar selección Massey-Omura";

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


    } else if (currentSubtopicId === 'massey-simulador') {

        // En Massey-Omura solo seleccionamos el mensaje M.
        selectedP = coord;
        selectedQ = null;

        const salida = document.getElementById('theory-output');

        salida.textContent =
            "Mensaje M = (" + coord.join(", ") + "). " +
            "Punto seleccionado correctamente. " +
            "Preparado para ejecutar Massey-Omura.";
            runMasseyOmuraSimulation();

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


/**
 * Ejecuta el protocolo Massey-Omura y muestra
 * las tres transmisiones y la recuperación del mensaje.
 */
const runMasseyOmuraSimulation = () => {
    const salida = document.getElementById('theory-output');
    const inputEA = document.getElementById('massey-ea');
    const inputEB = document.getElementById('massey-eb');

    if (!parametrosValidos || !selectedP ||
        !inputEA || !inputEB) {
        return;
    }

    const M = selectedP;
    const eA = inputEA.valueAsNumber;
    const eB = inputEB.valueAsNumber;

    // Mostrar un punto en formato legible.
    const puntoTexto = (P) => {
        return P === null
            ? "O (infinito)"
            : "(" + P[0] + ", " + P[1] + ")";
    };

    // Mostrar resultados o errores de forma segura.
    const mostrarMensaje = (mensaje, esError = false) => {
        salida.innerHTML = '';

        const cuadro = document.createElement('div');

        cuadro.className = esError
            ? 'alert alert-warning mt-2 small'
            : 'alert alert-info mt-2 small';

        cuadro.style.whiteSpace = 'pre-line';
        cuadro.textContent = mensaje;

        salida.appendChild(cuadro);
    };

    try {
        // Ejecutar las operaciones matemáticas.
        const resultado = simulateMasseyOmura(
            M, eA, eB,
            currentA, currentB, currentP
        );

        const {
            N, dA, dB,
            paso1, paso2, paso3, recuperado
        } = resultado;

        // Mostrar cada fase del protocolo.
        const procedimiento = [
            "MASSEY-OMURA — CIFRADO EN TRES PASOS",
            "",
            "MENSAJE ORIGINAL",
            "M = " + puntoTexto(M),
            "Orden del grupo N = " + N,
            "",
            "CLAVES PRIVADAS",
            "Alice: eA = " + eA,
            "Alice: dA = " + dA,
            "Bob: eB = " + eB,
            "Bob: dB = " + dB,
            "",
            "Verificación de inversos:",
            "eA × dA mod N = " + ((eA * dA) % N),
            "eB × dB mod N = " + ((eB * dB) % N),
            "",
            "PASO 1 — ALICE ENVÍA A BOB",
            "M1 = eA × M",
            "M1 = " + puntoTexto(paso1),
            "",
            "PASO 2 — BOB DEVUELVE A ALICE",
            "M2 = eB × M1",
            "M2 = " + puntoTexto(paso2),
            "",
            "PASO 3 — ALICE ENVÍA A BOB",
            "M3 = dA × M2",
            "M3 = " + puntoTexto(paso3),
            "",
            "RECUPERACIÓN — BOB",
            "M recuperado = dB × M3",
            "M recuperado = " + puntoTexto(recuperado),
            "",
            "CORRECTO: Bob recuperó el mensaje original."
        ].join('\n');

        mostrarMensaje(procedimiento);
        drawMasseyOmuraPoints(
            M,
            paso1,
            paso2,
            paso3,
            currentP,
            handlePointClick
        );

    } catch (error) {
        clearMasseyOmura();

        mostrarMensaje(
            "No fue posible completar Massey-Omura:\n" +
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
    clearMasseyOmura();

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

    } else if (currentSubtopicId === 'massey-simulador') {
        clearMasseyOmura();
        document.getElementById('theory-output').textContent =
            "Massey-Omura: selecciona un punto M " +
            "de la gráfica para representar el mensaje.";

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