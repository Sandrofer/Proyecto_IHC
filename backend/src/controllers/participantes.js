const pool = require('../db');

const EXPERIENCIAS = ['baja', 'media', 'alta'];

// Devuelve un mensaje de error, o null si todo está bien
function validar(body) {
  const { nombre, edad, experiencia, email } = body;

  if (!nombre || !String(nombre).trim()) {
    return 'nombre es obligatorio';
  }
  if (edad !== undefined && edad !== null && edad !== '') {
    const n = Number(edad);
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      return 'edad debe ser un número entero entre 1 y 120';
    }
  }
  if (experiencia && !EXPERIENCIAS.includes(experiencia)) {
    return 'experiencia inválida (baja, media o alta)';
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'email con formato inválido';
  }
  return null;
}

// Convierte el body en los valores para el SQL
function valores(body) {
  const { nombre, edad, ocupacion, experiencia, email } = body;
  return [
    String(nombre).trim(),
    edad === undefined || edad === null || edad === '' ? null : Number(edad),
    ocupacion || null,
    experiencia || 'media',
    email || null,
  ];
}

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM participantes ORDER BY id DESC');
    res.json(rows);
  } catch (e) { next(e); }
};

exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM participantes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Participante no encontrado' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const [r] = await pool.query(
      'INSERT INTO participantes (nombre, edad, ocupacion, experiencia, email) VALUES (?, ?, ?, ?, ?)',
      valores(req.body)
    );
    const [rows] = await pool.query('SELECT * FROM participantes WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const [r] = await pool.query(
      'UPDATE participantes SET nombre = ?, edad = ?, ocupacion = ?, experiencia = ?, email = ? WHERE id = ?',
      [...valores(req.body), req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Participante no encontrado' });
    const [rows] = await pool.query('SELECT * FROM participantes WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM participantes WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Participante no encontrado' });
    res.json({ mensaje: 'Participante eliminado' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'No se puede eliminar: el participante tiene observaciones relacionadas' });
    }
    next(e);
  }
};