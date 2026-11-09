// =====================================================================
//  Validaciones que usa el servidor.
//  Están separadas de las rutas para poder probarlas solas
//  (pruebas unitarias en tests/unit/validaciones.test.js).
// =====================================================================

// Devuelve la edad en años, o null si la fecha no es válida (ej: 2007-02-31).
// "hoy" se puede pasar para probar casos puntuales (por ejemplo, el día del cumpleaños).
function calcularEdad(fechaNacimiento, hoy = new Date()) {
  const coincide = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fechaNacimiento));
  if (!coincide) return null;

  const anio = Number(coincide[1]);
  const mesNac = Number(coincide[2]);
  const dia = Number(coincide[3]);
  const nacimiento = new Date(anio, mesNac - 1, dia);

  // Si la fecha no existe, JavaScript la "corre" (31/02 pasa a 03/03), así que la comparo
  if (
    nacimiento.getFullYear() !== anio ||
    nacimiento.getMonth() !== mesNac - 1 ||
    nacimiento.getDate() !== dia
  ) {
    return null;
  }

  if (nacimiento > hoy) return null;

  let edad = hoy.getFullYear() - anio;
  const mes = hoy.getMonth() - (mesNac - 1);
  if (mes < 0 || (mes === 0 && hoy.getDate() < dia)) {
    edad--;
  }
  if (edad > 120) return null;
  return edad;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// La cantidad tiene que ser un número entero mayor a 0
function cantidadValida(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1;
}

module.exports = { calcularEdad, emailValido, cantidadValida };
