const express = require('express');
const router = express.Router();
const pool = require('../db');
const verificarToken = require('../middleware/auth');
const { enviarAlertaCompra } = require('../utils/email.js');

router.use(verificarToken);

// Crear un pedido a partir del carrito actual del usuario.
// Todo se hace dentro de una transacción: si algo falla (por ejemplo, falta stock),
// no queda un pedido a medias ni se descuenta stock de más.
router.post('/', async (req, res) => {
  const direccion_entrega = (req.body.direccion_entrega || '').trim();

  if (!direccion_entrega) {
    return res.status(400).json({ error: 'Ingresá la dirección de entrega' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const carrito = await client.query('SELECT * FROM carritos WHERE usuario_id = $1', [req.usuario.id]);
    if (carrito.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    const carritoId = carrito.rows[0].id;

    // FOR UPDATE bloquea las filas de productos mientras dura la compra,
    // así dos personas no se llevan la última unidad al mismo tiempo
    const items = await client.query(
      `SELECT carrito_items.producto_id, carrito_items.cantidad, productos.precio,
              productos.nombre, productos.stock
       FROM carrito_items
       JOIN productos ON carrito_items.producto_id = productos.id
       WHERE carrito_items.carrito_id = $1
       FOR UPDATE OF productos`,
      [carritoId]
    );

    if (items.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const sinStock = items.rows.find((item) => item.stock != null && item.cantidad > item.stock);
    if (sinStock) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `No hay stock suficiente de "${sinStock.nombre}" (quedan ${sinStock.stock})`,
      });
    }

    const subtotal = items.rows.reduce(
      (acc, item) => acc + Number(item.precio) * item.cantidad,
      0
    );
    const total = subtotal;

    const pedido = await client.query(
      `INSERT INTO pedidos (usuario_id, estado, subtotal, total, direccion_entrega)
       VALUES ($1, 'pendiente', $2, $3, $4)
       RETURNING *`,
      [req.usuario.id, subtotal, total, direccion_entrega]
    );
    const pedidoId = pedido.rows[0].id;

    for (const item of items.rows) {
      await client.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedidoId, item.producto_id, item.cantidad, item.precio]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock IS NOT NULL',
        [item.cantidad, item.producto_id]
      );
    }

    await client.query('DELETE FROM carrito_items WHERE carrito_id = $1', [carritoId]);

    await client.query('COMMIT');

    // Respondemos el pedido ya confirmado. El mail se manda aparte,
    // sin bloquear la respuesta, para que si Gmail tarda o falla
    // no le cuelgue la compra al usuario.
    res.status(201).json(pedido.rows[0]);

    pool.query(
      'SELECT nombre, apellido, email FROM usuarios WHERE id = $1',
      [req.usuario.id]
    ).then((usuarioResultado) => {
      const usuario = usuarioResultado.rows[0];

      const itemsParaMail = items.rows.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      }));

      return enviarAlertaCompra({
        pedido: pedido.rows[0],
        items: itemsParaMail,
        usuario,
      });
    }).catch((errorMail) => {
      console.error('No se pudo enviar el mail de alerta de compra:', errorMail);
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(error);
    res.status(500).json({ error: 'No se pudo confirmar el pedido' });
  } finally {
    client.release();
  }
});

// Ver historial de pedidos del usuario logueado
router.get('/', async (req, res) => {
  try {
    const pedidos = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY creado_en DESC',
      [req.usuario.id]
    );
    res.json(pedidos.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los pedidos' });
  }
});

// Ver el detalle de un pedido puntual (con sus productos)
router.get('/:id', async (req, res) => {
  try {
    const pedido = await pool.query(
      'SELECT * FROM pedidos WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.usuario.id]
    );
    if (pedido.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const items = await pool.query(
      `SELECT pedido_items.cantidad, pedido_items.precio_unitario, productos.nombre
       FROM pedido_items
       JOIN productos ON pedido_items.producto_id = productos.id
       WHERE pedido_items.pedido_id = $1`,
      [req.params.id]
    );

    const itemsFormateados = items.rows.map((item) => ({
      ...item,
      precio_unitario: Number(item.precio_unitario),
    }));

    res.json({ ...pedido.rows[0], items: itemsFormateados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cargar el pedido' });
  }
});

module.exports = router;
