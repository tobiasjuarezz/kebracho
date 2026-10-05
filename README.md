# Kebracho

App móvil y página web de **Kebracho**, una marca de bebidas con alcohol y merchandising para un público joven adulto (+18).

**Proyecto Integrador — Aplicaciones Móviles**
Tobias Juárez · 7° 3ª, Técnico en Programación · E.E.S. Técnica N°1 Esteban Echeverría
Profesor: Pablo Facundo Gareis · 2026

---

## 1. Identidad de la empresa

| Dato | Descripción |
|------|-------------|
| Nombre | Kebracho |
| Rubro | Venta de bebidas con alcohol y merchandising de la marca |
| Productos | Bebida en lata de 473 ml y botella de 1 L, y merchandising: buzo, remera, gorra, mate, termo, riñonera, mochila y tote bag |
| Público | Jóvenes adultos, mayores de 18 años, que asocian la bebida con la juntada, la previa y los momentos con amigos |
| Zona | Zona Sur del Gran Buenos Aires, con entrega a domicilio |

<p align="center">
  <img src="web/public/isologo.png" alt="Isologo de Kebracho" width="320">
</p>

**Nombre y logo.** El nombre toma como referencia al quebracho, un árbol autóctono de la Argentina conocido por la dureza de su madera. Cambié la "Qu" por una "K" para darle un tono más urbano. El isotipo es una carita sonriente amarilla que transmite buena onda y momentos compartidos, y el logotipo usa una letra gruesa en cursiva con sombra, con una estética retro-urbana.

### Colores

| Color | HEX | Uso |
|-------|-----|-----|
| Amarillo Kebracho | `#F2C229` | Color principal, botones y precios |
| Negro carbón | `#2B2B2B` | Fondos y contraste |
| Crema | `#FFF8E0` | Textos sobre fondo oscuro y fondos cálidos |

### Organización básica

| Actor | Tipo | Qué hace |
|-------|------|----------|
| Administrador (dueño) | Interno | Carga productos y precios, controla el stock, recibe los pedidos y cambia su estado |
| Encargado de depósito | Interno | Prepara los pedidos y avisa cuando falta mercadería |
| Repartidor | Interno | Lleva el pedido al domicilio y cobra si el pago es en efectivo |
| Clientes | Externo | Personas mayores de 18 años que compran la bebida o el merchandising |
| Proveedores | Externo | Fabrican la bebida, los envases y las prendas |
| Servicio de correo | Externo | Gmail: envía el aviso de cada compra nueva al administrador |

El manual de identidad visual completo está en [`docs/Kebracho-Manual-Identidad.docx`](docs/Kebracho-Manual-Identidad.docx).

---

## 2. Problemática

Hoy Kebracho vende por mensajes de Instagram y WhatsApp, y a través de almacenes y distribuidores de la zona. Una venta directa se hace así:

> El cliente manda un mensaje → el dueño busca el producto en una planilla de Excel → verifica el stock → le pasa el precio → anota la venta → descuenta el stock a mano → coordina la entrega

### Problemas encontrados

- **No hay control de edad.** Por mensaje no hay forma de verificar que el cliente sea mayor de 18 años, y la Ley 24.788 prohíbe vender alcohol a menores.
- **Errores de stock.** Como el stock se descuenta a mano, se venden productos que ya no hay o se olvida actualizar la planilla.
- **Pedidos perdidos.** Los pedidos quedan mezclados entre chats. No hay un historial ordenado ni un estado del pedido (pendiente, confirmado, entregado).
- **Catálogo desparramado.** El cliente no puede ver todos los productos y precios juntos; tiene que preguntar uno por uno.
- **Dependencia de intermediarios.** Gran parte de la venta pasa por almacenes y distribuidores, y la marca no tiene contacto directo con sus clientes.
- **Tiempo del dueño.** Responder precios, confirmar stock y anotar ventas lleva mucho tiempo que podría usar en hacer crecer la marca.

Kebracho necesita un canal de venta propio que muestre el catálogo completo, controle la edad antes de vender, lleve el stock de forma automática y deje registrado cada pedido. Eso no se puede resolver con una planilla y mensajes sueltos.

---

## 3. Posible resolución

La solución que propongo es una aplicación móvil propia de Kebracho (y una página web con el mismo estilo), con un servidor que controle las reglas importantes y una base de datos donde quede guardada toda la información.

### Para el cliente

- Registrarse con verificación de edad: si es menor de 18 años, el sistema no lo deja crear la cuenta.
- Iniciar sesión con email y contraseña, o con Face ID / huella.
- Ver el catálogo por categorías, con fotos, precios y stock disponible.
- Agregar productos al carrito, marcarlos como favoritos y confirmar el pedido.
- Ver el historial de sus pedidos y el estado de cada uno.
- Usar un asistente con Inteligencia Artificial que le recomienda qué llevar a la previa según cuántas personas son y cuánto quiere gastar.

### Para el administrador

- Cargar, editar y dar de baja productos y categorías.
- Ver todos los pedidos y cambiar su estado (pendiente, confirmado, entregado, cancelado).
- Controlar el stock, que se descuenta solo cada vez que se confirma una venta.
- Recibir un mail cada vez que entra una compra nueva.

### Reglas de la empresa

- No se puede vender a menores de 18 años.
- No se puede vender una cantidad superior al stock disponible.
- Un producto que ya fue utilizado en una venta no podrá eliminarse (solo se da de baja).
- Solo el administrador puede cargar productos y cambiar el estado de los pedidos.
- Toda pantalla donde se ofrece producto muestra "Beber con moderación. Prohibida su venta a menores de 18 años."

### Qué no va a hacer el sistema

- No procesa pagos online: el pago se coordina en efectivo o transferencia al confirmar el pedido.
- No calcula envíos ni hace seguimiento del repartidor en tiempo real.
- No maneja la producción de la bebida, la facturación ni la contabilidad de la empresa.
- Kebracho es una marca ficticia: el sistema no tiene ventas reales.

---

## 4. Asignación de tareas

El proyecto lo desarrollo de forma individual, así que tomo todas las responsabilidades del equipo. Igual las separo por rol, para organizar el trabajo y saber qué parte del sistema estoy haciendo en cada momento. Cada tarea está cargada como issue en la pestaña **Issues** y organizada en el tablero de **Projects** de este repositorio.

| Rol | Responsable | Tareas |
|-----|-------------|--------|
| Coordinador | Tobias Juárez | Planificación semanal, issues de GitHub, resúmenes semanales y control de fechas |
| Parte visual | Tobias Juárez | Pantallas de la app y de la web: formularios, menús, navegación, mensajes de error y carga |
| Servidor | Tobias Juárez | API en Express: validaciones, permisos por tipo de usuario, reglas de la empresa |
| Base de datos | Tobias Juárez | Tablas, claves, relaciones y reglas en PostgreSQL (Neon) |
| Pruebas | Tobias Juárez | Casos positivos, negativos y de límite; pruebas en Postman y pruebas integrales app + servidor |
| Documentación | Tobias Juárez | Requisitos, historias de usuario, diagramas, manual de usuario y registro de uso de IA |
| Integración de IA | Tobias Juárez | Asistente de compras con Inteligencia Artificial dentro de la app |

### Planificación

| Período | Actividades | Revisión |
|---------|-------------|----------|
| 1 al 9 de octubre | Empresa, problema, relevamiento, requisitos e historias de usuario | 7 de octubre |
| 10 al 16 de octubre | Diseño, diagramas y organización de la solución | 15 de octubre |
| 17 al 30 de octubre | Base de datos, servidor y parte visual | 21 y 29 de octubre |
| 31 de octubre al 6 de noviembre | Integración, seguridad, IA y corrección de errores | — |
| 7 al 13 de noviembre | Pruebas, documentación y preparación de la presentación | Entrega final: 13 de noviembre |

### Forma de trabajo con Git

- **Ramas:** `main` tiene siempre la versión estable que funciona. `develop` es donde se juntan los avances de la semana. Cada funcionalidad nueva se hace en su propia rama, por ejemplo `feature/checkout` o `feature/asistente-ia`.
- **Commits:** mensajes cortos que dicen qué se cambió, por ejemplo "Agrega control de stock al confirmar pedido".
- **Issues:** cada tarea es un issue, con su etiqueta (app, backend, web, base de datos, documentación, pruebas) y la revisión en la que tiene que estar lista.
- **Pull requests:** cuando termino una rama abro un pull request hacia `develop`, reviso los cambios y recién ahí lo uno. Al final de cada semana `develop` pasa a `main`.
- **Seguridad:** las contraseñas y claves del servidor están en un archivo `.env` que no se sube al repositorio. En su lugar está `backend/.env.example`, con los nombres de las variables y sin los valores reales.

---

## 5. Tecnologías y estructura

| Carpeta | Qué es | Tecnología |
|---------|--------|------------|
| `app/` | App móvil para clientes y administrador | React Native + Expo (Expo Router) |
| `backend/` | API REST: valida los datos, controla permisos y reglas | Node.js + Express |
| `web/` | Página web de la marca con catálogo y carrito | React + Vite + TypeScript |
| `docs/` | Documentación del proyecto | Word |

- **Base de datos:** PostgreSQL alojado en Neon (autorizado por el profesor en lugar de Supabase; los dos usan PostgreSQL).
- **Autenticación:** contraseñas encriptadas con bcrypt y sesiones con JWT.
- **Correo:** Nodemailer con Gmail, para el aviso de compra nueva al administrador.
- **Inteligencia Artificial:** API de un modelo de IA para el asistente de compras.

---

## 6. Cómo correrlo

### Backend

```bash
cd backend
npm install
cp .env.example .env   # y completar con los datos reales
npm run dev
```

Queda en `http://localhost:3000`.

### App

```bash
cd app
npm install
npx expo start
```

Escaneá el QR con Expo Go. El celular y la compu tienen que estar en la misma red Wi-Fi.

### Web

```bash
cd web
npm install
npm run dev
```

---

## 7. Documentación

- [`docs/Kebracho-Manual-Identidad.docx`](docs/Kebracho-Manual-Identidad.docx): manual de identidad visual (logo, colores, tamaños, versiones y mockups).
- [`docs/Kebracho-Proyecto-Integrador.docx`](docs/Kebracho-Proyecto-Integrador.docx): documento del proyecto (GitHub, tareas, identidad, problemática, resolución, requisitos, historias de usuario, diagramas y casos de prueba).

---

*Beber con moderación. Prohibida su venta a menores de 18 años.*
