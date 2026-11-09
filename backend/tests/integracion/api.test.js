// =====================================================================
//  Pruebas de integración de la API.
//  Levantan el servidor de verdad (index.js) contra una base de PRUEBA,
//  y prueban que las rutas, el middleware y la base funcionen juntos.
//
//  Se corren con: npm run test:integracion
//  Necesitan la variable DATABASE_URL_TEST apuntando a una base local
//  (nunca a Neon: la prueba borra y vuelve a crear las tablas).
// =====================================================================
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DB_URL = process.env.DATABASE_URL_TEST;
const PUERTO = 3999;
const URL = `http://localhost:${PUERTO}`;

if (!DB_URL || !/localhost|127\.0\.0\.1/.test(DB_URL)) {
  console.error('DATABASE_URL_TEST tiene que apuntar a una base local de prueba.');
  process.exit(1);
}

let servidor;
let pool;

// ---------- helpers ----------
async function api(metodo, ruta, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(URL + ruta, {
    method: metodo,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  let datos = null;
  try { datos = await r.json(); } catch { /* sin cuerpo */ }
  return { status: r.status, datos };
}

let contador = 0;
async function crearCliente() {
  contador++;
  const r = await api('POST', '/usuarios/registro', {
    nombre: 'Cliente', apellido: `Prueba${contador}`,
    email: `cliente${contador}@prueba.com`, password: 'clave123',
    fecha_nacimiento: '2000-01-01',
  });
  assert.equal(r.status, 201, JSON.stringify(r.datos));
  return r.datos.token;
}

async function stockDe(productoId) {
  const r = await pool.query('SELECT stock FROM productos WHERE id = $1', [productoId]);
  return r.rows[0].stock;
}

async function esperarServidor() {
  for (let i = 0; i < 50; i++) {
    try { await fetch(URL + '/'); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error('El servidor no arrancó');
}

// ---------- preparación ----------
before(async () => {
  pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await pool.query(fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8'));
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, fecha_nacimiento, rol)
     VALUES ('Admin', 'Kebracho', 'admin@kebracho.com', $1, '1990-01-01', 'admin')`,
    [hash]
  );

  servidor = spawn(process.execPath, ['index.js'], {
    cwd: path.join(__dirname, '../..'),
    env: {
      ...process.env,
      DATABASE_URL: DB_URL,
      JWT_SECRET: 'secreto_solo_para_pruebas',
      PORT: String(PUERTO),
      EMAIL_USER: '', EMAIL_PASS: '', EMAIL_TO: '', // sin mail: prueba que la compra no depende de Gmail
    },
    stdio: 'ignore',
  });
  await esperarServidor();
});

after(async () => {
  if (servidor) servidor.kill();
  if (pool) await pool.end();
});

// ---------- registro e inicio de sesión ----------
describe('Registro e inicio de sesión', () => {
  test('IT-01 registro de un mayor de edad: crea la cuenta y devuelve token', async () => {
    const r = await api('POST', '/usuarios/registro', {
      nombre: 'Tobias', apellido: 'Juárez', email: 'TOBIAS@Prueba.com',
      password: 'clave123', fecha_nacimiento: '2007-05-15',
    });
    assert.equal(r.status, 201);
    assert.ok(r.datos.token);
    assert.equal(r.datos.usuario.rol, 'cliente');
    assert.equal(r.datos.usuario.email, 'tobias@prueba.com'); // se guarda en minúsculas
    const fila = await pool.query("SELECT password_hash FROM usuarios WHERE email = 'tobias@prueba.com'");
    assert.notEqual(fila.rows[0].password_hash, 'clave123'); // nunca en texto plano
    assert.match(fila.rows[0].password_hash, /^\$2[aby]\$10\$/); // hash bcrypt
  });

  test('IT-02 registro de un menor de 18: se rechaza con 403', async () => {
    const r = await api('POST', '/usuarios/registro', {
      nombre: 'Menor', apellido: 'Prueba', email: 'menor@prueba.com',
      password: 'clave123', fecha_nacimiento: '2010-03-01',
    });
    assert.equal(r.status, 403);
    assert.match(r.datos.error, /mayor de 18/);
  });

  test('IT-03 email repetido (aunque cambien mayúsculas): 409', async () => {
    const r = await api('POST', '/usuarios/registro', {
      nombre: 'Otro', apellido: 'Usuario', email: 'tobias@PRUEBA.com',
      password: 'clave123', fecha_nacimiento: '2000-01-01',
    });
    assert.equal(r.status, 409);
  });

  test('IT-04 datos inválidos: contraseña corta, email mal, fecha inexistente, campos vacíos → 400', async () => {
    const base = { nombre: 'A', apellido: 'B', email: 'ab@prueba.com', password: 'clave123', fecha_nacimiento: '2000-01-01' };
    assert.equal((await api('POST', '/usuarios/registro', { ...base, password: '123' })).status, 400);
    assert.equal((await api('POST', '/usuarios/registro', { ...base, email: 'sin-arroba' })).status, 400);
    assert.equal((await api('POST', '/usuarios/registro', { ...base, fecha_nacimiento: '2001-02-30' })).status, 400);
    assert.equal((await api('POST', '/usuarios/registro', { ...base, nombre: '   ' })).status, 400);
  });

  test('IT-05 login correcto devuelve token y datos sin la contraseña', async () => {
    const r = await api('POST', '/usuarios/login', { email: 'tobias@prueba.com', password: 'clave123' });
    assert.equal(r.status, 200);
    assert.ok(r.datos.token);
    assert.equal(r.datos.usuario.password_hash, undefined);
  });

  test('IT-06 login con contraseña o email incorrectos: 401 con el mismo mensaje', async () => {
    const a = await api('POST', '/usuarios/login', { email: 'tobias@prueba.com', password: 'mal' });
    const b = await api('POST', '/usuarios/login', { email: 'noexiste@prueba.com', password: 'clave123' });
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.datos.error, b.datos.error); // no revela si el email existe
  });

  test('IT-07 rutas protegidas sin token o con token falso: 401', async () => {
    assert.equal((await api('GET', '/carrito')).status, 401);
    assert.equal((await api('GET', '/pedidos', undefined, 'token.falso.123')).status, 401);
  });

  test('IT-08 verificar contraseña antes de comprar: correcta 200, incorrecta 401', async () => {
    const token = await crearCliente();
    assert.equal((await api('POST', '/usuarios/verificar-password', { password: 'clave123' }, token)).status, 200);
    assert.equal((await api('POST', '/usuarios/verificar-password', { password: 'otra' }, token)).status, 401);
  });
});

// ---------- catálogo ----------
describe('Catálogo', () => {
  test('IT-09 el catálogo es público y devuelve precios como número', async () => {
    const r = await api('GET', '/productos');
    assert.equal(r.status, 200);
    assert.ok(r.datos.length >= 10);
    assert.equal(typeof r.datos[0].precio, 'number');
  });

  test('IT-10 filtro por categoría y producto inexistente (404)', async () => {
    const r = await api('GET', '/productos?categoriaId=3');
    assert.ok(r.datos.every((p) => p.categoria_id === 3));
    assert.equal((await api('GET', '/productos/9999')).status, 404);
  });

  test('IT-11 solo el administrador puede crear categorías', async () => {
    const cliente = await crearCliente();
    const admin = (await api('POST', '/usuarios/login', { email: 'admin@kebracho.com', password: 'admin123' })).datos.token;
    assert.equal((await api('POST', '/categorias', { nombre: 'Ediciones limitadas' }, cliente)).status, 403);
    assert.equal((await api('POST', '/categorias', { nombre: 'Ediciones limitadas' }, admin)).status, 201);
  });
});

// ---------- carrito (CP-01 a CP-03 del documento) ----------
describe('Carrito', () => {
  test('CP-01 agregar 5 unidades con stock 10: se agrega', async () => {
    const token = await crearCliente();
    const r = await api('POST', '/carrito/items', { producto_id: 1, cantidad: 5 }, token);
    assert.equal(r.status, 201);
    assert.equal(r.datos.cantidad, 5);
  });

  test('CP-02 agregar exactamente 10 unidades con stock 10: se agrega (límite)', async () => {
    const token = await crearCliente();
    const r = await api('POST', '/carrito/items', { producto_id: 1, cantidad: 10 }, token);
    assert.equal(r.status, 201);
    assert.equal(r.datos.cantidad, 10);
  });

  test('CP-03 agregar 11 unidades con stock 10: se rechaza y no se agrega nada', async () => {
    const token = await crearCliente();
    const r = await api('POST', '/carrito/items', { producto_id: 1, cantidad: 11 }, token);
    assert.equal(r.status, 400);
    assert.equal(r.datos.error, 'Solo hay 10 unidades disponibles');
    const carrito = await api('GET', '/carrito', undefined, token);
    assert.equal(carrito.datos.items.length, 0);
  });

  test('IT-12 sumar al mismo producto acumula y respeta el stock', async () => {
    const token = await crearCliente();
    await api('POST', '/carrito/items', { producto_id: 1, cantidad: 6 }, token);
    const r = await api('POST', '/carrito/items', { producto_id: 1, cantidad: 5 }, token); // 6 + 5 = 11 > 10
    assert.equal(r.status, 400);
  });

  test('IT-13 producto sin stock y cantidades inválidas se rechazan', async () => {
    const token = await crearCliente();
    const sinStock = await api('POST', '/carrito/items', { producto_id: 11, cantidad: 1 }, token);
    assert.equal(sinStock.status, 400);
    assert.equal(sinStock.datos.error, 'Este producto no tiene stock');
    for (const cantidad of [0, -1, 1.5, 'dos']) {
      assert.equal((await api('POST', '/carrito/items', { producto_id: 2, cantidad }, token)).status, 400);
    }
  });

  test('IT-14 un cliente no puede tocar el carrito de otro (404)', async () => {
    const a = await crearCliente();
    const b = await crearCliente();
    const item = (await api('POST', '/carrito/items', { producto_id: 2, cantidad: 1 }, a)).datos;
    assert.equal((await api('PUT', `/carrito/items/${item.id}`, { cantidad: 3 }, b)).status, 404);
    assert.equal((await api('DELETE', `/carrito/items/${item.id}`, undefined, b)).status, 404);
    const carritoA = await api('GET', '/carrito', undefined, a);
    assert.equal(carritoA.datos.items[0].cantidad, 1); // no cambió
  });
});

// ---------- pedidos ----------
describe('Pedidos', () => {
  test('IT-15 confirmar pedido: lo guarda, descuenta stock, vacía el carrito y guarda el precio', async () => {
    const token = await crearCliente();
    const stockAntes = await stockDe(2);
    await api('POST', '/carrito/items', { producto_id: 2, cantidad: 2 }, token);
    const r = await api('POST', '/pedidos', { direccion_entrega: 'Av. Siempre Viva 742, Monte Grande' }, token);
    assert.equal(r.status, 201); // y eso que el mail no está configurado
    assert.equal(r.datos.estado, 'pendiente');
    assert.equal(Number(r.datos.total), 10400);
    assert.equal(await stockDe(2), stockAntes - 2);
    assert.equal((await api('GET', '/carrito', undefined, token)).datos.items.length, 0);
    const detalle = await api('GET', `/pedidos/${r.datos.id}`, undefined, token);
    assert.equal(detalle.datos.items[0].precio_unitario, 5200);
  });

  test('IT-16 el precio guardado en el pedido no cambia si después cambia el catálogo', async () => {
    const token = await crearCliente();
    await api('POST', '/carrito/items', { producto_id: 5, cantidad: 1 }, token);
    const pedido = (await api('POST', '/pedidos', { direccion_entrega: 'Calle 1' }, token)).datos;
    await pool.query('UPDATE productos SET precio = 99999 WHERE id = 5');
    const detalle = await api('GET', `/pedidos/${pedido.id}`, undefined, token);
    assert.equal(detalle.datos.items[0].precio_unitario, 16000);
    await pool.query('UPDATE productos SET precio = 16000 WHERE id = 5');
  });

  test('IT-17 sin dirección o con el carrito vacío no se crea el pedido', async () => {
    const token = await crearCliente();
    assert.equal((await api('POST', '/pedidos', { direccion_entrega: '   ' }, token)).status, 400);
    assert.equal((await api('POST', '/pedidos', { direccion_entrega: 'Calle 1' }, token)).status, 400);
  });

  test('IT-18 si el stock bajó después de armar el carrito, no se vende y no se toca nada', async () => {
    const token = await crearCliente();
    await api('POST', '/carrito/items', { producto_id: 4, cantidad: 3 }, token);
    await pool.query('UPDATE productos SET stock = 2 WHERE id = 4');
    const r = await api('POST', '/pedidos', { direccion_entrega: 'Calle 1' }, token);
    assert.equal(r.status, 400);
    assert.match(r.datos.error, /No hay stock suficiente/);
    assert.equal(await stockDe(4), 2);
    const pedidos = await api('GET', '/pedidos', undefined, token);
    assert.equal(pedidos.datos.length, 0);
  });

  test('IT-19 dos clientes compran la última unidad al mismo tiempo: se vende una sola', async () => {
    await pool.query('UPDATE productos SET stock = 1 WHERE id = 6');
    const a = await crearCliente();
    const b = await crearCliente();
    await api('POST', '/carrito/items', { producto_id: 6, cantidad: 1 }, a);
    await api('POST', '/carrito/items', { producto_id: 6, cantidad: 1 }, b);
    const [ra, rb] = await Promise.all([
      api('POST', '/pedidos', { direccion_entrega: 'Calle A' }, a),
      api('POST', '/pedidos', { direccion_entrega: 'Calle B' }, b),
    ]);
    const estados = [ra.status, rb.status].sort();
    assert.deepEqual(estados, [201, 400]);
    assert.equal(await stockDe(6), 0); // nunca negativo
  });

  test('IT-20 cada cliente ve solo sus pedidos', async () => {
    const a = await crearCliente();
    const b = await crearCliente();
    await api('POST', '/carrito/items', { producto_id: 7, cantidad: 1 }, a);
    const pedidoA = (await api('POST', '/pedidos', { direccion_entrega: 'Calle A' }, a)).datos;
    assert.equal((await api('GET', '/pedidos', undefined, b)).datos.length, 0);
    assert.equal((await api('GET', `/pedidos/${pedidoA.id}`, undefined, b)).status, 404);
  });
});

// ---------- favoritos y errores generales ----------
describe('Favoritos y manejo de errores', () => {
  test('IT-21 favoritos: agregar dos veces el mismo no lo duplica', async () => {
    const token = await crearCliente();
    await api('POST', '/favoritos', { producto_id: 3 }, token);
    await api('POST', '/favoritos', { producto_id: 3 }, token);
    assert.equal((await api('GET', '/favoritos', undefined, token)).datos.length, 1);
  });

  test('IT-22 ruta que no existe: 404 en JSON', async () => {
    const r = await api('GET', '/no-existe');
    assert.equal(r.status, 404);
    assert.equal(r.datos.error, 'Ruta no encontrada');
  });

  test('IT-23 JSON mal formado: 400 sin que se caiga el servidor', async () => {
    const r = await api('POST', '/usuarios/login', '{"email": ');
    assert.equal(r.status, 400);
    assert.equal((await api('GET', '/')).status, 200); // sigue andando
  });

  test('IT-24 la base no deja borrar un producto que ya se vendió', async () => {
    await assert.rejects(pool.query('DELETE FROM productos WHERE id = 2'), /foreign key/);
  });
});
