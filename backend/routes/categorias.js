const express = require('express');
const router = express.Router();
const pool = require('../db');
const verificarToken = require('../middleware/auth');

// Obtener todas las categorías (público)
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM categorias ORDER BY id');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las categorías' });
  }
});

// Crear una categoría nueva (solo administradores)
router.post('/', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tenés permiso para crear categorías' });
  }

  const nombre = (req.body.nombre || '').trim();
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  try {
    const resultado = await pool.query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear la categoría' });
  }
});

module.exports = router;
