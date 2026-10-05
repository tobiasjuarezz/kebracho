const express = require('express');
const router = express.Router();
const pool = require('../db');

// El catálogo es público: se puede ver sin cuenta (la web lo muestra en el inicio).
// Lo que sí pide cuenta +18 es comprar (carrito y pedidos).

const SELECT_PRODUCTOS = `
  SELECT productos.*, categorias.nombre AS categoria_nombre
  FROM productos
  LEFT JOIN categorias ON productos.categoria_id = categorias.id
`;

// pg devuelve los NUMERIC como texto, los paso a número para el front
function formatearProducto(producto) {
  return {
    ...producto,
    precio: Number(producto.precio),
    precio_anterior: producto.precio_anterior != null ? Number(producto.precio_anterior) : null,
    graduacion_alcoholica:
      producto.graduacion_alcoholica != null ? Number(producto.graduacion_alcoholica) : null,
  };
}

// Listar productos, opcionalmente filtrados por categoría
router.get('/', async (req, res) => {
  const categoriaId = req.query.categoriaId || req.query.categoria_id || req.query.categoria;

  try {
    let resultado;
    if (categoriaId) {
      resultado = await pool.query(
        `${SELECT_PRODUCTOS} WHERE productos.categoria_id = $1 ORDER BY productos.nombre ASC`,
        [categoriaId]
      );
    } else {
      resultado = await pool.query(`${SELECT_PRODUCTOS} ORDER BY productos.nombre ASC`);
    }
    res.json(resultado.rows.map(formatearProducto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los productos' });
  }
});

// Detalle de un producto puntual
router.get('/:id', async (req, res) => {
  try {
    const resultado = await pool.query(`${SELECT_PRODUCTOS} WHERE productos.id = $1`, [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(formatearProducto(resultado.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cargar el producto' });
  }
});

module.exports = router;
