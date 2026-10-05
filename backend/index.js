const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());

// Muestra en la consola cada pedido que llega y cómo terminó.
// Sirve para saber si la app realmente está llegando al servidor.
app.use((req, res, next) => {
  const inicio = Date.now();
  console.log(`→ ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`← ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
});

app.use(express.json());

app.use('/categorias', require('./routes/categorias'));
app.use('/productos', require('./routes/productos'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/carrito', require('./routes/carrito'));
app.use('/favoritos', require('./routes/favoritos'));
app.use('/pedidos', require('./routes/pedidos'));

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend de Kebracho funcionando' });
});

app.get('/test-db', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ conectado: true, hora_servidor: resultado.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ conectado: false, error: error.message });
  }
});

// Ruta inexistente
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Cualquier error que no se haya atajado (ej: JSON mal formado en el body)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Error en la solicitud' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});