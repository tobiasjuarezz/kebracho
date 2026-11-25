# Tablero de tareas — Kebracho

Planificación del Proyecto Integrador por revisión. El proyecto lo hago de forma individual, así que todas las tareas están a mi cargo (Tobias Juárez); cada una lleva el área del sistema a la que pertenece.

**Referencias:** ✅ terminada · 🔄 en curso · ⬜ pendiente

**Estado actualizado al 25/11/2026**, revisado contra el código del repositorio. Lo que sigue pendiente está también en la sección 8.5 del documento final.

---

## Revisión 7/10 — GitHub, tareas, identidad, problemática y resolución

| Estado | Tarea | Área |
|:---:|---|---|
| ✅ | Crear el repositorio en GitHub (el `.env` queda afuera; se sube el `.env.example`) | Documentación |
| ✅ | README con identidad de la empresa, problemática y posible resolución | Documentación |
| ✅ | Subir el manual de identidad y el documento del Proyecto Integrador a `docs/` | Documentación |
| ✅ | Asignación de tareas y planificación por revisión (este archivo) | Documentación |

## Revisión 15/10 — Diseño, diagramas y organización de la solución

| Estado | Tarea | Área |
|:---:|---|---|
| ✅ | Arreglar el error al confirmar pedido en la app ("No se pudo confirmar el pedido") — lo verifica la prueba IT-15 | App · Backend |
| ⬜ | Panel de administrador: ABM de productos con baja lógica y cambio de estado de pedidos. No está en esta versión: hoy se hace desde Neon (el rol admin ya existe en el token) | App · Backend |
| ✅ | Verificar que llega el mail al administrador con cada compra (RF08) | Backend |
| ✅ | Revisar Mis pedidos y el detalle de cada pedido (RF07) | App |
| ✅ | Casos de prueba CP-01, CP-02 y CP-03: quedaron como pruebas automáticas de integración, en vez de Postman | Pruebas |

## Revisión 21/10 — Base de datos, servidor y parte visual

| Estado | Tarea | Área |
|:---:|---|---|
| ✅ | Cambiar el fondo azul marino por el carbón `#2B2B2B` del manual | App · Web |
| ✅ | Íconos de la app y favicon de la web con los del manual | App · Web |
| ⬜ | Fotos reales de los productos (`imagen_url`) en vez del emoji. Pendiente: las pantallas ya muestran la foto si la hay | App · Web · Base de datos |
| ✅ | Leyendas legales de la Ley 24.788 en la ficha de cada producto | App · Web |

## Revisión 29/10 — Base de datos, servidor y parte visual

| Estado | Tarea | Área |
|:---:|---|---|
| ✅ | Revisar las páginas Nosotros, Contacto, Términos y Privacidad | Web |
| ✅ | Verificación de identidad en el checkout: Face ID / huella o contraseña (RF04) | App |
| ✅ | Sesión de 7 días, indicadores de carga y mensajes de error claros | App · Web |

## Entrega final 13/11 — Integración, IA, pruebas y documentación

| Estado | Tarea | Área |
|:---:|---|---|
| ⬜ | Asistente de compras con Inteligencia Artificial. No entró en esta versión | IA · App · Backend |
| ✅ | Pruebas automáticas: 48 en total (12 unitarias, 24 de integración, 8 de la web y 4 del frontend). El panel admin no tiene pruebas porque todavía no existe | Pruebas |
| ✅ | Manual de usuario y registro de uso de IA (sección 10.11 y Anexo A del documento final) | Documentación |
| ✅ | Preparar la presentación final (`docs/defensa/`) | Documentación |
| ⬜ | Blog (opcional). No se hizo | Web |
