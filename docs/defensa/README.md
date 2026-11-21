# Defensa del Proyecto Final — Kebracho

**Aplicaciones Móviles** · Prof. Pablo Facundo Gareis · Defensa: 25 o 26 de noviembre de 2026
Tobias Juárez · 7° 3ª · E.E.S. Técnica N°1

## Archivos

| Archivo | Para qué |
|---|---|
| [`Kebracho-Defensa.pptx`](Kebracho-Defensa.pptx) | La presentación, editable. Cada diapositiva tiene en las **notas del orador** lo que digo |
| [`Kebracho-Defensa.pdf`](Kebracho-Defensa.pdf) | La misma presentación en PDF, por si la compu no tiene PowerPoint |

## Orden de la exposición

21 diapositivas: unos 15 a 20 minutos, y después la demo en vivo. Las diapositivas de código dicen en qué archivo está cada parte, para abrirlo en VS Code si el profesor lo pide.

| # | Diapositiva | Sección del documento |
|---|---|---|
| 1 | Portada | — |
| 2 | La empresa | 10.1 Identidad general |
| 3 | La problemática | 1 y 2 |
| 4 | La solución | 2.1 a 2.3 |
| 5 | Arquitectura | 3 |
| 6 | Base de datos | 4 |
| 7 | Una compra, paso a paso | 5 |
| 8 | Código: registro +18 (`routes/usuarios.js`, `utils/validaciones.js`) | 5.2 y 5.3 |
| 9 | Código: login y token (`routes/usuarios.js`, `middleware/auth.js`) | 5.2 y 6.3 |
| 10 | Código: la compra en una transacción (`routes/pedidos.js`) | 4.3 y 5.1 |
| 11 | Código: Face ID (`app/src/utils/biometria.ts`) | 5.1 |
| 12 | Seguridad y normativa | 6 |
| 13 | Pruebas | 7 |
| 14 | Código: una prueba por dentro (`tests/unit/validaciones.test.js`) | 7.1 |
| 15 | Cambio en vivo: ordenar el catálogo por precio (`routes/productos.js`) | — |
| 16 | Despliegue | 8 |
| 17 | Ciclo de vida | 9 |
| 18 | Marketing e identidad | 10 |
| 19 | Lo que funciona y lo que sigue | 8.5 (pendientes) |
| 20 | Uso de IA | Anexo A |
| 21 | Gracias, demo y preguntas | — |

## La consigna, punto por punto

El índice que pidió el profesor (material "Proyecto Final", 4/11) está completo en [`Kebracho-Proyecto-Final.docx`](../Kebracho-Proyecto-Final.docx):

| Sección pedida | Estado |
|---|---|
| 1. Introducción (1.1 a 1.4) | ✅ |
| 2. Descripción del sistema (2.1 a 2.4) | ✅ |
| 3. Arquitectura (3.1 a 3.4) | ✅ |
| 4. Diseño de datos (4.1 a 4.4) | ✅ |
| 5. Comportamiento del sistema (5.1 a 5.4) | ✅ |
| 6. Restricciones del diseño (6.1 a 6.5) | ✅ |
| 7. Pruebas y validaciones (7.1 a 7.5) | ✅ |
| 8. Despliegue y operación (8.1 a 8.5) | ✅ |
| 9. Ciclo de vida (9.1 y 9.2) | ✅ |
| 10. Marketing e identidad institucional (10.1 a 10.16) | ✅ |
| Presentación de diapositivas para la defensa | ✅ esta carpeta |

## Antes de exponer

- Abrir la web unos minutos antes, porque Render apaga la API cuando no se usa.
- Tener la app abierta en el celular, con una cuenta de prueba ya creada.
- Para la demo: registro (probar con una fecha de un menor), catálogo, carrito y una compra completa.

## Uso de Inteligencia Artificial

Claude (la IA de Anthropic) me guió en gran parte de este proyecto: el código del servidor, las pruebas automáticas, la corrección de errores, la documentación, las piezas de marketing, Git y GitHub, y también el armado de esta presentación. Lo que hice yo fue probar cada cambio, ejecutar los comandos y controlar que lo escrito coincida con el sistema real. El detalle está en el Anexo A del documento final.
