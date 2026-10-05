const express = require('express');
const router = express.Router();
const pool = require('../db');
const verificarToken = require('../middleware/auth');

// Todas las rutas de acá requieren estar logueado
router.use(verificarToken);

// Busca el carrito del usuario y, si no tiene, lo crea
async function obtenerOCrearCarrito(usuarioId) {
  let carrito = await pool.query('SELECT * FROM carritos WHERE usuario_id = $1', [usuarioId]);
  if (carrito.rows.length === 0) {
    carrito = await pool.query(
      'INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING *',
      [usuarioId]
    );
  }
  return carrito.rows[0].id;
}

// Valida que la cantidad sea un número entero mayor a 0
function cantidadValida(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1;
}

// Obtener (o crear si no existe) el carrito del usuario logueado, con sus items
router.get('/', async (req, res) => {
  try {
    const carritoId = await obtenerOCrearCarrito(req.usuario.id);

    const items = await pool.query(
      `SELECT carrito_items.id, carrito_items.cantidad, productos.id AS producto_id,
              productos.nombre, productos.precio, productos.imagen_url, productos.stock
       FROM carrito_items
       JOIN productos ON carrito_items.producto_id = productos.id
       WHERE carrito_items.carrito_id = $1
       ORDER BY carrito_items.id`,
      [carritoId]
    );

    // pg devuelve los NUMERIC como texto, los paso a número para el front
    const itemsFormateados = items.rows.map((item) => ({
      ...item,
      precio: Number(item.precio),
    }));

    res.json({ id: carritoId, carrito_id: carritoId, items: itemsFormateados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cargar el carrito' });
  }
});

// Agregar un producto al carrito
router.post('/items', async (req, res) => {
  const { producto_id } = req.body;
  const cantidad = req.body.cantidad === undefined ? 1 : req.body.cantidad;

  if (!producto_id) {
    return res.status(400).json({ error: 'producto_id es obligatorio' });
  }
  if (!cantidadValida(cantidad)) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  try {
    const producto = await pool.query('SELECT id, stock FROM productos WHERE id = $1', [producto_id]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'El producto no existe' });
    }
    const stock = producto.rows[0].stock;

    const carritoId = await obtenerOCrearCarrito(req.usuario.id);

    const existente = await pool.query(
      'SELECT * FROM carrito_items WHERE carrito_id = $1 AND producto_id = $2',
      [carritoId, producto_id]
    );

    const cantidadActual = existente.rows.length > 0 ? existente.rows[0].cantidad : 0;
    const cantidadFinal = cantidadActual + Number(cantidad);

    if (stock != null && cantidadFinal > stock) {
      return res.status(400).json({
        error: stock === 0
          ? 'Este producto no tiene stock'
          : `Solo hay ${stock} unidades disponibles`,
      });
    }

    let resultado;
    if (existente.rows.length > 0) {
      resultado = await pool.query(
        'UPDATE carrito_items SET cantidad = $1 WHERE id = $2 RETURNING *',
        [cantidadFinal, existente.rows[0].id]
      );
    } else {
      resultado = await pool.query(
        'INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES ($1,$2,$3) RETURNING *',
        [carritoId, producto_id, cantidadFinal]
      );
    }

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo agregar al carrito' });
  }
});

// Modificar la cantidad de un item del carrito (solo si el item es del usuario logueado)
router.put('/items/:id', async (req, res) => {
  const { cantidad } = req.body;
  if (!cantidadValida(cantidad)) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }
  try {
    const item = await pool.query(
      `SELECT carrito_items.id, productos.stock
       FROM carrito_items
       JOIN carritos ON carrito_items.carrito_id = carritos.id
       JOIN productos ON carrito_items.producto_id = productos.id
       WHERE carrito_items.id = $1 AND carritos.usuario_id = $2`,
      [req.params.id, req.usuario.id]
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const stock = item.rows[0].stock;
    if (stock != null && Number(cantidad) > stock) {
      return res.status(400).json({ error: `Solo hay ${stock} unidades disponibles` });
    }

    const resultado = await pool.query(
      'UPDATE carrito_items SET cantidad = $1 WHERE id = $2 RETURNING *',
      [Number(cantidad), req.params.id]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar la cantidad' });
  }
});

// Eliminar un item del carrito (solo si el item es del usuario logueado)
router.delete('/items/:id', async (req, res) => {
  try {
    const resultado = await pool.query(
      `DELETE FROM carrito_items
       USING carritos
       WHERE carrito_items.carrito_id = carritos.id
         AND carrito_items.id = $1
         AND carritos.usuario_id = $2
       RETURNING carrito_items.id`,
      [req.params.id, req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json({ mensaje: 'Item eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar el item' });
  }
});

module.exports = router;
