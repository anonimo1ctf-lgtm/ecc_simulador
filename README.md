
# Simulador Educativo de Criptografía de Curvas Elípticas

Aplicación web interactiva desarrollada con fines educativos
para comprender las operaciones matemáticas y algunos
protocolos criptográficos basados en curvas elípticas.

## Módulos disponibles

- **Fundamentos matemáticos:** curvas elípticas sobre campos
  finitos, suma y duplicación de puntos.
- **ECDH:** intercambio de claves y cálculo del secreto compartido.
- **ElGamal elíptico:** cifrado y descifrado de puntos.
- **Massey-Omura:** protocolo criptográfico de tres transmisiones.

Cada módulo incluye explicaciones teóricas y un simulador interactivo.

## Tecnologías utilizadas

- HTML, CSS y JavaScript
- Bootstrap
- KaTeX
- JSXGraph
- Snap.svg

## Ejecución local

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Abrir `index.html` mediante la extensión Live Server.
4. Seleccionar un módulo desde el menú principal.

La aplicación funciona en el navegador y no requiere Node.js.


## Ejemplo de uso

Para comenzar, se puede utilizar la siguiente curva elíptica:

- Coeficiente a = -1
- Coeficiente b = 1
- Número primo p = 17

Esta curva contiene 13 puntos con coordenadas finitas
y el punto al infinito, para un total de 14 elementos.

En el módulo de fundamentos matemáticos, selecciona:

- Punto P = (0, 1)
- Punto Q = (1, 1)

Al realizar la suma, el resultado esperado es:

**P + Q = (16, 16)**

Los módulos ECDH, ElGamal y Massey-Omura también
incluyen ejemplos numéricos en sus respectivas
secciones teóricas.

## Pruebas del proyecto

El repositorio incluye el archivo `prueba-inverso.html`,
que permite ejecutar las pruebas matemáticas
desde el navegador.

Para utilizarlo:

1. Iniciar el proyecto con Live Server.
2. Abrir `prueba-inverso.html`.
3. Ejecutar las pruebas y revisar los resultados.

La versión actual cuenta con 38 pruebas matemáticas.


## Aviso de seguridad

Este simulador utiliza curvas y parámetros pequeños
con fines didácticos. No está diseñado para proteger
información real ni para utilizarse en sistemas de producción.

## Propósito académico

Proyecto educativo desarrollado como parte de un trabajo
de titulación en la Universidad Autónoma Metropolitana,
Unidad Azcapotzalco.
