-- =====================================================================
--  Kebracho — Esquema de la base de datos (PostgreSQL / Neon)
--  Reproduce las tablas del DER del proyecto. Sirve para crear la base
--  desde cero (por ejemplo, una base de prueba) o para restaurarla.
--  Uso: psql "$DATABASE_URL" -f schema.sql
--  Es seguro correrlo sobre una base que ya tiene las tablas: usa
--  CREATE TABLE IF NOT EXISTS IF NOT EXISTS, así que no borra ni pisa nada.
-- =====================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(80)  NOT NULL,
  apellido         VARCHAR(80)  NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  password_hash    TEXT         NOT NULL,
  fecha_nacimiento DATE         NOT NULL,
  rol              VARCHAR(20)  NOT NULL DEFAULT 'cliente'
                   CHECK (rol IN ('cliente', 'admin')),
  creado_en        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS productos (
  id                    SERIAL PRIMARY KEY,
  categoria_id          INT REFERENCES categorias(id),
  nombre                VARCHAR(120)  NOT NULL,
  descripcion           TEXT,
  precio                NUMERIC(12,2) NOT NULL CHECK (precio > 0),
  precio_anterior       NUMERIC(12,2) CHECK (precio_anterior IS NULL OR precio_anterior > 0),
  stock                 INT CHECK (stock IS NULL OR stock >= 0),
  volumen_ml            INT CHECK (volumen_ml IS NULL OR volumen_ml > 0),
  graduacion_alcoholica NUMERIC(4,1) CHECK (graduacion_alcoholica IS NULL
                                            OR graduacion_alcoholica BETWEEN 0 AND 100),
  imagen_url            TEXT,
  activo                BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS carritos (
  id         SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carrito_items (
  id          SERIAL PRIMARY KEY,
  carrito_id  INT NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id),
  cantidad    INT NOT NULL CHECK (cantidad > 0),
  UNIQUE (carrito_id, producto_id)
);

CREATE TABLE IF NOT EXISTS favoritos (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id),
  creado_en   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, producto_id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id                SERIAL PRIMARY KEY,
  usuario_id        INT NOT NULL REFERENCES usuarios(id),
  estado            VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmado', 'entregado', 'cancelado')),
  subtotal          NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  total             NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  direccion_entrega TEXT NOT NULL,
  creado_en         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- pedido_items -> productos NO tiene ON DELETE: un producto que ya se vendió
-- no se puede borrar (la base lo impide); se da de baja con activo = FALSE.
CREATE TABLE IF NOT EXISTS pedido_items (
  id              SERIAL PRIMARY KEY,
  pedido_id       INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id     INT NOT NULL REFERENCES productos(id),
  cantidad        INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario > 0)
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario     ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);
