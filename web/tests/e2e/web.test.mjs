// =====================================================================
//  Pruebas de funcionalidades web y del frontend (de punta a punta).
//  Levantan el backend real contra una base de PRUEBA y la web con Vite,
//  y manejan un navegador (Chromium) como lo haría un cliente.
//  Además guardan capturas en tests/e2e/capturas/ (las uso en el documento).
//
//  Se corren con: npm run test:e2e
//  Necesitan: DATABASE_URL_TEST (base local) y, la primera vez,
//  "npx playwright install chromium".
// =====================================================================
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raizWeb = path.join(aqui, '../..');
const raizBackend = path.join(raizWeb, '../backend');
const requireBackend = createRequire(path.join(raizBackend, 'package.json'));
const { Pool } = requireBackend('pg');
const bcrypt = requireBackend('bcryptjs');

const DB_URL = process.env.DATABASE_URL_TEST;
if (!DB_URL || !/localhost|127\.0\.0\.1/.test(DB_URL)) {
  console.error('DATABASE_URL_TEST tiene que apuntar a una base local de prueba.');
  process.exit(1);
}

const PUERTO_API = 3998;
const PUERTO_WEB = 5199;
const WEB = `http://localhost:${PUERTO_WEB}`;
const CAPTURAS = path.join(aqui, 'capturas');
fs.mkdirSync(CAPTURAS, { recursive: true });

let backend, vite, navegador, pool;
const erroresConsola = [];

async function esperar(url) {
  for (let i = 0; i < 100; i++) {
    try { await fetch(url); return; } catch { await new Promise((r) => setTimeout(r, 150)); }
  }
  throw new Error(`No respondió ${url}`);
}

// Página nueva con la verificación de edad ya aceptada (como un cliente que ya entró antes)
async function paginaMayor(opciones = {}) {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 860 }, ...opciones });
  await contexto.addInitScript(() => localStorage.setItem('mayorDeEdad', 'true'));
  const pagina = await contexto.newPage();
  pagina.on('console', (m) => { if (m.type() === 'error') erroresConsola.push(m.text()); });
  return pagina;
}

async function registrar(pagina, email, fecha = '2000-01-01') {
  await pagina.goto(`${WEB}/registro`);
  await pagina.getByPlaceholder('Nombre').fill('Lucía');
  await pagina.getByPlaceholder('Apellido').fill('Gómez');
  await pagina.getByPlaceholder('Email').fill(email);
  await pagina.getByPlaceholder('Contraseña').fill('clave123');
  await pagina.locator('input[type="date"]').fill(fecha);
  await pagina.getByRole('button', { name: /crear|registr/i }).click();
}

const captura = (pagina, nombre) => pagina.screenshot({ path: path.join(CAPTURAS, `${nombre}.png`) });

before(async () => {
  pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await pool.query(fs.readFileSync(path.join(raizBackend, 'database/schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.join(raizBackend, 'database/seed.sql'), 'utf8'));
  const hash = await bcrypt.hash('clave123', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, fecha_nacimiento)
     VALUES ('Martín', 'Ríos', 'martin@prueba.com', $1, '1999-08-20')`,
    [hash]
  );

  backend = spawn(process.execPath, ['index.js'], {
    cwd: raizBackend,
    env: { ...process.env, DATABASE_URL: DB_URL, JWT_SECRET: 'secreto_solo_para_pruebas',
      PORT: String(PUERTO_API), EMAIL_USER: '', EMAIL_PASS: '', EMAIL_TO: '' },
    stdio: 'ignore',
  });
  vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PUERTO_WEB), '--strictPort'], {
    cwd: raizWeb,
    env: { ...process.env, VITE_API_URL: `http://localhost:${PUERTO_API}` },
    stdio: 'ignore',
  });
  await esperar(`http://localhost:${PUERTO_API}/`);
  await esperar(WEB);

  navegador = await chromium.launch(
    process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}
  );
});

after(async () => {
  if (navegador) await navegador.close();
  if (backend) backend.kill();
  if (vite) vite.kill();
  if (pool) await pool.end();
});

describe('Pruebas de funcionalidades web', () => {
  test('WEB-01 al entrar pide confirmar la edad y, si dice que no, no deja pasar', async () => {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 860 } });
    const pagina = await contexto.newPage();
    await pagina.goto(WEB);
    await pagina.getByText('¿Sos mayor de 18 años?').waitFor();
    await captura(pagina, '01-verificacion-edad');
    await pagina.getByRole('button', { name: 'No' }).click();
    await pagina.getByText('Volvé cuando seas mayor').waitFor();
    assert.equal(await pagina.getByText('Comprá por categoría').count(), 0);
    await contexto.close();
  });

  test('WEB-02 si confirma que es mayor, entra y no se lo vuelve a preguntar', async () => {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 860 } });
    const pagina = await contexto.newPage();
    await pagina.goto(WEB);
    await pagina.getByRole('button', { name: 'Sí, soy mayor' }).click();
    await pagina.getByText('Comprá por categoría').waitFor();
    await pagina.reload();
    await pagina.getByText('Comprá por categoría').waitFor();
    assert.equal(await pagina.getByText('¿Sos mayor de 18 años?').count(), 0);
    await captura(pagina, '02-inicio');
    await contexto.close();
  });

  test('WEB-03 el registro de un menor muestra el rechazo del servidor', async () => {
    const pagina = await paginaMayor();
    await registrar(pagina, 'menor@prueba.com', '2011-06-01');
    await pagina.getByText('Debés ser mayor de 18 años para registrarte').waitFor();
    await captura(pagina, '03-registro-menor');
    await pagina.context().close();
  });

  test('WEB-04 el registro de un mayor crea la cuenta y deja la sesión iniciada', async () => {
    const pagina = await paginaMayor();
    await registrar(pagina, 'lucia@prueba.com');
    await pagina.getByText('Hola, Lucía').waitFor();
    await pagina.context().close();
  });

  test('WEB-05 login con contraseña incorrecta muestra un mensaje claro', async () => {
    const pagina = await paginaMayor();
    await pagina.goto(`${WEB}/login`);
    await pagina.getByPlaceholder('Email').fill('martin@prueba.com');
    await pagina.getByPlaceholder('Contraseña').fill('otra-clave');
    await pagina.getByRole('button', { name: 'Ingresar' }).click();
    await pagina.getByText('Email o contraseña incorrectos').waitFor();
    await captura(pagina, '05-login-error');
    await pagina.context().close();
  });

  test('WEB-06 entrar al carrito sin sesión lleva al login', async () => {
    const pagina = await paginaMayor();
    await pagina.goto(`${WEB}/carrito`);
    await pagina.waitForURL(/\/login$/);
    await pagina.context().close();
  });

  test('WEB-07 compra completa: producto → carrito → checkout → pedido confirmado', async () => {
    const pagina = await paginaMayor();
    await pagina.goto(`${WEB}/login`);
    await pagina.getByPlaceholder('Email').fill('martin@prueba.com');
    await pagina.getByPlaceholder('Contraseña').fill('clave123');
    await pagina.getByRole('button', { name: 'Ingresar' }).click();
    await pagina.getByText('Hola, Martín').waitFor();

    await pagina.goto(`${WEB}/producto/2`); // Kebracho Botella 1 L — $5.200
    await pagina.getByText('Kebracho Botella 1 L').first().waitFor();
    await pagina.getByRole('button', { name: '+', exact: true }).click();
    await pagina.getByText('Subtotal: $10.400').waitFor();
    await captura(pagina, '07a-producto');
    await pagina.getByRole('button', { name: '+ Agregar al carrito' }).click();
    await pagina.getByText('se agregó al carrito').waitFor();

    await pagina.goto(`${WEB}/carrito`);
    await pagina.getByText('Tu carrito').waitFor();
    await pagina.getByText('$10.400').first().waitFor();
    await captura(pagina, '07b-carrito');
    await pagina.getByRole('button', { name: 'Finalizar compra' }).click();

    await pagina.waitForURL(/\/checkout$/);
    await pagina.getByRole('button', { name: 'Confirmar pedido' }).click();
    await pagina.getByText('Ingresá dónde querés recibir el pedido').waitFor(); // sin dirección no deja
    await pagina.getByPlaceholder('Calle, número, localidad').fill('Av. Alem 120, Monte Grande');
    await captura(pagina, '07c-checkout');
    await pagina.getByRole('button', { name: 'Confirmar pedido' }).click();
    await pagina.getByText('¡Pedido confirmado!').waitFor();
    await captura(pagina, '07d-pedido-confirmado');

    const stock = await pool.query('SELECT stock FROM productos WHERE id = 2');
    assert.equal(stock.rows[0].stock, 23); // 25 - 2
    await pagina.context().close();
  });

  test('WEB-08 un producto sin stock no se puede agregar', async () => {
    const pagina = await paginaMayor();
    await pagina.goto(`${WEB}/producto/11`);
    const boton = pagina.getByRole('button', { name: 'Sin stock' });
    await boton.waitFor();
    assert.equal(await boton.isDisabled(), true);
    await pagina.context().close();
  });
});

describe('Pruebas del frontend', () => {
  test('FE-01 los logos cargan (no hay imágenes rotas)', async () => {
    const pagina = await paginaMayor();
    await pagina.goto(WEB);
    await pagina.getByText('Comprá por categoría').waitFor();
    const rotas = await pagina.$$eval('img', (imgs) =>
      imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')));
    assert.deepEqual(rotas, []);
    await pagina.context().close();
  });

  test('FE-02 la leyenda legal aparece en el inicio y en la ficha de producto', async () => {
    const pagina = await paginaMayor();
    await pagina.goto(WEB);
    await pagina.getByText(/Prohibida su venta a menores de 18 años/).first().waitFor();
    await pagina.goto(`${WEB}/producto/1`);
    await pagina.getByText(/Prohibida su venta a menores de 18 años/).first().waitFor();
    await pagina.context().close();
  });

  test('FE-03 en un celular (375 px) la página no se sale de la pantalla', async () => {
    const pagina = await paginaMayor({ viewport: { width: 375, height: 812 }, isMobile: true });
    await pagina.goto(WEB);
    await pagina.getByText('Comprá por categoría').waitFor();
    const anchoContenido = await pagina.evaluate(() => document.documentElement.scrollWidth);
    await captura(pagina, 'fe03-celular');
    assert.ok(anchoContenido <= 375, `el contenido mide ${anchoContenido}px de ancho`);
    await pagina.context().close();
  });

  test('FE-04 no hubo errores en la consola del navegador durante las pruebas', async () => {
    // Los 400/401/403 son respuestas esperadas de las pruebas negativas (menor de edad,
    // contraseña mal, carrito sin sesión), no errores de la página.
    const esperados = /status (code )?(of )?(400|401|403)/;
    const reales = erroresConsola.filter((e) => !esperados.test(e));
    assert.deepEqual(reales, []);
  });
});
