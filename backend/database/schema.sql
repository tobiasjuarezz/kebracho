-- =====================================================================
--  Kebracho — Esquema de la base de datos (PostgreSQL / Neon)
--  Es la misma estructura que tiene la base real en Neon (relevada el
--  9/11/2026 desde information_schema y pg_constraint).
--  Sirve para crear una base igual desde cero (por ejemplo, la de prueba).
--  Uso: psql "$DATABASE_URL" -f schema.sql
--  Es seguro correrlo sobre una base que ya tiene las tablas: usa
--  CREATE TABLE IF NOT EXISTS, así que no borra ni pisa nada.
-- =====================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE         NOT NULL,
  rol              VARCHAR(20)  NOT NULL DEFAULT 'cliente',
  creado_en        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS productos (
  id                    SERIAL PRIMARY KEY,
  nombre                VARCHAR(150) NOT NULL,
  descripcion           TEXT,
  categoria_id          INT REFERENCES categorias(id),
  precio                NUMERIC(12,2) NOT NULL,
  precio_anterior       NUMERIC(12,2),
  stock                 INT NOT NULL DEFAULT 0,
  volumen_ml            INT,
  graduacion_alcoholica NUMERIC(4,1),
  imagen_url            TEXT,
  activo                BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS carritos (
  id         SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  creado_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carrito_items (
  id          SERIAL PRIMARY KEY,
  carrito_id  INT REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id INT REFERENCES productos(id),
  cantidad    INT NOT NULL
);

CREATE TABLE IF NOT EXISTS favoritos (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en   TIMESTAMP DEFAULT NOW(),
  UNIQUE (usuario_id, producto_id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id                SERIAL PRIMARY KEY,
  usuario_id        INT REFERENCES usuarios(id),
  estado            VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  subtotal          NUMERIC(12,2) NOT NULL,
  total             NUMERIC(12,2) NOT NULL,
  direccion_entrega TEXT,
  creado_en         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- pedido_items -> productos NO tiene ON DELETE: un producto que ya se vendió
-- no se puede borrar (la base lo impide); se da de baja con activo = FALSE.
CREATE TABLE IF NOT EXISTS pedido_items (
  id              SERIAL PRIMARY KEY,
  pedido_id       INT REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id     INT REFERENCES productos(id),
  cantidad        INT NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL
);
