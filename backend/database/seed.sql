-- =====================================================================
--  Kebracho — Datos de prueba
--  Catálogo de la marca (bebida + merchandising) y un usuario administrador.
--  La contraseña del admin se carga desde las pruebas; acá no hay ninguna real.
-- =====================================================================

INSERT INTO categorias (nombre) VALUES ('Bebidas'), ('Packs'), ('Merchandising');

INSERT INTO productos (categoria_id, nombre, descripcion, precio, precio_anterior, stock, volumen_ml, graduacion_alcoholica, activo) VALUES
 (1, 'Kebracho Lata 473 ml',   'La bebida original de Kebracho en lata.',            2800,  NULL, 10,  473, 5.0, TRUE),
 (1, 'Kebracho Botella 1 L',   'La bebida original de Kebracho en botella de litro.', 5200,  5600, 25, 1000, 5.0, TRUE),
 (2, 'Pack x6 Latas',          'Seis latas de 473 ml para la previa.',                15500, 16800, 12, NULL, NULL, TRUE),
 (3, 'Buzo canguro Kebracho',  'Buzo blanco con el isologo en el pecho.',             38000, NULL,  8, NULL, NULL, TRUE),
 (3, 'Remera Kebracho',        'Remera blanca de algodón con el isologo.',            16000, NULL, 20, NULL, NULL, TRUE),
 (3, 'Gorra Kebracho',         'Gorra blanca con el isologo bordado.',                12500, NULL, 15, NULL, NULL, TRUE),
 (3, 'Mate Kebracho',          'Mate de acero con bombilla y el isologo.',            14000, NULL, 10, NULL, NULL, TRUE),
 (3, 'Termo Kebracho 1 L',     'Termo de acero inoxidable con manija.',               32000, NULL,  6, NULL, NULL, TRUE),
 (3, 'Riñonera Kebracho',      'Riñonera blanca con el isologo.',                     18500, NULL,  9, NULL, NULL, TRUE),
 (3, 'Mochila Kebracho',       'Mochila blanca con el isologo.',                      42000, NULL,  5, NULL, NULL, TRUE),
 (3, 'Tote bag + cartuchera',  'Tote bag de lienzo con cartuchera.',                  13500, NULL,  0, NULL, NULL, TRUE);
