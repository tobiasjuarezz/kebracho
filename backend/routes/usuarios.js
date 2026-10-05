const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

// Devuelve la edad en años, o null si la fecha no es válida (ej: 2007-02-31)
function calcularEdad(fechaNacimiento) {
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

  const hoy = new Date();
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

// Registro de usuario
router.post('/registro', async (req, res) => {
  const nombre = (req.body.nombre || '').trim();
  const apellido = (req.body.apellido || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const { password, fecha_nacimiento } = req.body;

  if (!nombre || !apellido || !email || !password || !fecha_nacimiento) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!emailValido(email)) {
    return res.status(400).json({ error: 'El email no es válido' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña tiene que tener al menos 6 caracteres' });
  }

  const edad = calcularEdad(fecha_nacimiento);
  if (edad === null) {
    return res.status(400).json({ error: 'La fecha de nacimiento no es válida' });
  }
  if (edad < 18) {
    return res.status(403).json({ error: 'Debés ser mayor de 18 años para registrarte' });
  }

  try {
    const existente = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, fecha_nacimiento, rol)
       VALUES ($1,$2,$3,$4,$5,'cliente')
       RETURNING id, nombre, apellido, email, rol`,
      [nombre, apellido, email, password_hash, fecha_nacimiento]
    );

    const usuario = resultado.rows[0];
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ usuario, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor, probá de nuevo' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const usuario = resultado.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor, probá de nuevo' });
  }
});

// Verificar contraseña (para confirmar acciones sensibles, como una compra)
router.post('/verificar-password', verificarToken, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Falta la contraseña' });
  }

  try {
    const resultado = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [req.usuario.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordValida = await bcrypt.compare(password, resultado.rows[0].password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor, probá de nuevo' });
  }
});

module.exports = router;