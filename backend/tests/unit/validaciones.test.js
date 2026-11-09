// =====================================================================
//  Pruebas unitarias de utils/validaciones.js
//  Prueban cada función sola, sin servidor ni base de datos.
//  Se corren con: npm run test:unit
// =====================================================================
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calcularEdad, emailValido, cantidadValida } = require('../../utils/validaciones');

// Fecha fija para que las pruebas den siempre lo mismo
const HOY = new Date(2026, 10, 9); // 9 de noviembre de 2026

describe('calcularEdad', () => {
  test('UT-01 calcula bien la edad de un adulto', () => {
    assert.equal(calcularEdad('2000-05-15', HOY), 26);
  });

  test('UT-02 el día que cumple 18 ya cuenta como 18 (límite)', () => {
    assert.equal(calcularEdad('2008-11-09', HOY), 18);
  });

  test('UT-03 un día antes de cumplir 18 todavía tiene 17 (límite)', () => {
    assert.equal(calcularEdad('2008-11-10', HOY), 17);
  });

  test('UT-04 rechaza una fecha que no existe (31 de febrero)', () => {
    assert.equal(calcularEdad('2007-02-31', HOY), null);
  });

  test('UT-05 acepta el 29 de febrero de un año bisiesto', () => {
    assert.equal(calcularEdad('2004-02-29', HOY), 22);
  });

  test('UT-06 rechaza una fecha futura', () => {
    assert.equal(calcularEdad('2030-01-01', HOY), null);
  });

  test('UT-07 rechaza un formato que no es AAAA-MM-DD', () => {
    assert.equal(calcularEdad('15/05/2000', HOY), null);
    assert.equal(calcularEdad('', HOY), null);
    assert.equal(calcularEdad(undefined, HOY), null);
  });

  test('UT-08 rechaza edades imposibles (más de 120 años)', () => {
    assert.equal(calcularEdad('1890-01-01', HOY), null);
  });
});

describe('emailValido', () => {
  test('UT-09 acepta un email normal', () => {
    assert.equal(emailValido('cliente@kebracho.com'), true);
  });

  test('UT-10 rechaza emails sin @, sin dominio o con espacios', () => {
    assert.equal(emailValido('clientekebracho.com'), false);
    assert.equal(emailValido('cliente@kebracho'), false);
    assert.equal(emailValido('cli ente@kebracho.com'), false);
  });
});

describe('cantidadValida', () => {
  test('UT-11 acepta enteros desde 1 (también si llegan como texto)', () => {
    assert.equal(cantidadValida(1), true);
    assert.equal(cantidadValida('3'), true);
  });

  test('UT-12 rechaza 0, negativos, decimales y texto', () => {
    assert.equal(cantidadValida(0), false);
    assert.equal(cantidadValida(-2), false);
    assert.equal(cantidadValida(1.5), false);
    assert.equal(cantidadValida('dos'), false);
  });
});
