# Kebracho

App móvil y web de **Kebracho**, una marca ficticia de bebidas para un público joven adulto (+18).
Proyecto Integrador de Aplicaciones Móviles — 7° 3ª, E.E.S. Técnica N°1 Esteban Echeverría.

**Autor:** Tobias Juárez

## Problemática

Kebracho es una marca nueva que depende de distribuidores y almacenes para llegar al público.
No tiene un canal propio de venta, no puede mostrar todo su catálogo en un solo lugar y no tiene
contacto directo con sus clientes. Además, al vender alcohol está obligada por la Ley 24.788 a
controlar que no se venda a menores, y en la venta informal por redes o WhatsApp ese control no existe.

## Solución

Una app móvil propia (y una web) con:

- Registro con **verificación de edad** (solo mayores de 18)
- Ingreso con **Face ID / huella**
- **Catálogo** por categorías con precios y stock
- **Carrito** y confirmación del pedido (con Face ID o contraseña)
- **Historial de pedidos** y detalle de cada uno
- **Favoritos**
- Aviso por mail al negocio cada vez que entra una compra
- Leyendas legales obligatorias en todas las pantallas de producto

## Estructura

| Carpeta    | Qué es                          | Tecnología                         |
|------------|---------------------------------|------------------------------------|
| `app/`     | App móvil                       | React Native + Expo (Expo Router)  |
| `backend/` | API REST                        | Node.js + Express + PostgreSQL (Neon) |
| `web/`     | Página web                      | React + Vite                       |

## Cómo correrlo

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # y completar con los datos reales
npm run dev
```

Queda en `http://localhost:3000`.

### 2. App

```bash
cd app
npm install
npx expo start
```

Escaneá el QR con Expo Go. La app detecta sola la IP de la compu para conectarse al backend
(el celular y la compu tienen que estar en la misma red).

### 3. Web

```bash
cd web
npm install
npm run dev
```

## Identidad visual

| Color            | HEX       |
|------------------|-----------|
| Amarillo Kebracho | `#F2C229` |
| Negro carbón     | `#2B2B2B` |
| Crema            | `#FFF8E0` |

---

*Beber con moderación. Prohibida su venta a menores de 18 años.*
