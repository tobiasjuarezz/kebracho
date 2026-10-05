const express = require('express');
const router = express.Router();
const pool = require('../db');
const verificarToken = require('../middleware/auth');

router.use(verificarToken);

// Ver todos los favoritos del usuario logueado, con datos del producto
router.get('/', async (req, res) => {
  try {
    const favoritos = await pool.query(
      `SELECT favoritos.id, productos.id AS producto_id, productos.nombre, productos.precio,
              productos.precio_anterior, productos.imagen_url, productos.categoria_id
       FROM favoritos
       JOIN productos ON favoritos.producto_id = productos.id
       WHERE favoritos.usuario_id = $1
       ORDER BY favoritos.creado_en DESC`,
      [req.usuario.id]
    );
    res.json(
      favoritos.rows.map((f) => ({
        ...f,
        precio: Number(f.precio),
        precio_anterior: f.precio_anterior != null ? Number(f.precio_anterior) : null,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error con los favoritos' });
  }
});

// Marcar un producto como favorito
router.post('/', async (req, res) => {
  const { producto_id } = req.body;

  if (!producto_id) {
    return res.status(400).json({ error: 'Falta el producto_id' });
  }

  try {
    const producto = await pool.query('SELECT id FROM productos WHERE id = $1', [producto_id]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'El producto no existe' });
    }

    const resultado = await pool.query(
      `INSERT INTO favoritos (usuario_id, producto_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, producto_id) DO NOTHING
       RETURNING *`,
      [req.usuario.id, producto_id]
    );
    res.status(201).json(resultado.rows[0] || { mensaje: 'Ya estaba en favoritos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error con los favoritos' });
  }
});

// Sacar un producto de favoritos
router.delete('/:producto_id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
      [req.usuario.id, req.params.producto_id]
    );
    res.json({ mensaje: 'Eliminado de favoritos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error con los favoritos' });
  }
});

module.exports = router;