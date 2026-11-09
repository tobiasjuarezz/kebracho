-- =====================================================================
--  Migración 002 — Restricciones e índices (PENDIENTE: todavía no se corrió en Neon)
--  Hoy estas reglas las controla solo el servidor. Con esta migración
--  la base también las exige, aunque alguien escriba directo en ella.
--
--  Antes de correrla: hacer un snapshot de la base en Neon.
--  Uso: psql "$DATABASE_URL" -f migraciones/002_restricciones.sql
--  Va todo dentro de una transacción: si alguna regla falla porque hay
--  datos que no la cumplen, no se aplica nada.
-- =====================================================================
BEGIN;

ALTER TABLE productos
  ADD CONSTRAINT productos_precio_positivo   CHECK (precio > 0),
  ADD CONSTRAINT productos_stock_no_negativo CHECK (stock >= 0),
  ADD CONSTRAINT productos_graduacion_valida CHECK (graduacion_alcoholica IS NULL OR graduacion_alcoholica BETWEEN 0 AND 100);

ALTER TABLE carritos
  ADD CONSTRAINT carritos_un_carrito_por_usuario UNIQUE (usuario_id);

ALTER TABLE carrito_items
  ADD CONSTRAINT carrito_items_cantidad_positiva CHECK (cantidad > 0),
  ADD CONSTRAINT carrito_items_producto_unico    UNIQUE (carrito_id, producto_id);

ALTER TABLE pedidos
  ADD CONSTRAINT pedidos_estado_valido CHECK (estado IN ('pendiente', 'confirmado', 'entregado', 'cancelado')),
  ADD CONSTRAINT pedidos_totales_validos CHECK (subtotal >= 0 AND total >= 0);

ALTER TABLE pedido_items
  ADD CONSTRAINT pedido_items_cantidad_positiva CHECK (cantidad > 0),
  ADD CONSTRAINT pedido_items_precio_positivo   CHECK (precio_unitario > 0);

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_valido CHECK (rol IN ('cliente', 'admin'));

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario     ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);

COMMIT;
