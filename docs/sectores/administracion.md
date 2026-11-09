# Sector Administración

Este QR está en la oficina. Resume las tareas del administrador.

## Qué se hace acá
- Cargar y editar productos, precios y categorías (solo el rol **admin** puede hacerlo).
- Dar de baja productos que ya no se venden: **no se borran**, se marcan como inactivos para no perder el historial de ventas.
- Revisar el mail de aviso que llega con cada compra nueva (cliente, dirección, productos y total).
- Cambiar el estado de los pedidos: pendiente → confirmado → entregado (o cancelado).

## Controles diarios
- Revisar que la base de datos responda (ruta `/test-db` del servidor).
- Mirar los registros del servidor si un cliente reporta un error.
- Una vez por semana, exportar una copia de la base (ver sección 4.4 del documento).
