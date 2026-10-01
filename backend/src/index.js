const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

// Cada quien registra aqui sus rutas, por ejemplo:
// app.use('/api/pruebas', require('./routes/pruebas'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/observaciones', require('./routes/observaciones'));

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));