const pool = require('../db');

const ESTADOS = ['planificada', 'en_curso', 'finalizada'];

function validar(body) {
  const { nombre, producto_evaluado, fecha, estado } = body;
  if (!nombre || !producto_evaluado || !fecha) {
    return 'nombre, producto_evaluado y fecha son obligatorios';
  }
  if (isNaN(Date.parse(fecha))) {
    return 'fecha inválida (usa el formato AAAA-MM-DD)';
  }
  if (estado && !ESTADOS.includes(estado)) {
    return 'estado inválido (planificada, en_curso o finalizada)';
  }
  return null;
}

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pruebas ORDER BY id DESC');
    res.json(rows);
  } catch (e) { next(e); }
};

exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pruebas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Prueba no encontrada' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const { nombre, producto_evaluado, descripcion, fecha, estado } = req.body;
    const [r] = await pool.query(
      'INSERT INTO pruebas (nombre, producto_evaluado, descripcion, fecha, estado) VALUES (?, ?, ?, ?, ?)',
      [nombre, producto_evaluado, descripcion || null, fecha, estado || 'planificada']
    );
    const [rows] = await pool.query('SELECT * FROM pruebas WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const { nombre, producto_evaluado, descripcion, fecha, estado } = req.body;
    const [r] = await pool.query(
      'UPDATE pruebas SET nombre = ?, producto_evaluado = ?, descripcion = ?, fecha = ?, estado = ? WHERE id = ?',
      [nombre, producto_evaluado, descripcion || null, fecha, estado || 'planificada', req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Prueba no encontrada' });
    const [rows] = await pool.query('SELECT * FROM pruebas WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM pruebas WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Prueba no encontrada' });
    res.json({ mensaje: 'Prueba eliminada' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'No se puede eliminar: la prueba tiene datos relacionados' });
    }
    next(e);
  }
};