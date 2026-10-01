const pool = require('../db');

const SELECT_BASE = `
  SELECT t.*, p.nombre AS prueba_nombre
  FROM tareas t
  JOIN pruebas p ON p.id = t.prueba_id`;

// Devuelve un mensaje de error, o null si todo está bien
async function validar(body) {
    const { prueba_id, titulo } = body;
    if (!prueba_id || !titulo || !String(titulo).trim()) {
        return 'prueba_id y titulo son obligatorios';
    }
    if (!Number.isInteger(Number(prueba_id))) {
        return 'prueba_id debe ser un número entero';
    }
    const [p] = await pool.query('SELECT id FROM pruebas WHERE id = ?', [prueba_id]);
    if (p.length === 0) return 'La prueba indicada no existe';
    return null;
}

exports.listar = async (req, res, next) => {
    try {
        let sql = SELECT_BASE;
        const params = [];
        if (req.query.prueba_id) {
            sql += ' WHERE t.prueba_id = ?';
            params.push(req.query.prueba_id);
        }
        sql += ' ORDER BY t.id DESC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) { next(e); }
};

exports.obtener = async (req, res, next) => {
    try {
        const [rows] = await pool.query(SELECT_BASE + ' WHERE t.id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(rows[0]);
    } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
    try {
        const error = await validar(req.body);
        if (error) return res.status(400).json({ error });

        const { prueba_id, titulo, descripcion, resultado_esperado } = req.body;
        const [r] = await pool.query(
            'INSERT INTO tareas (prueba_id, titulo, descripcion, resultado_esperado) VALUES (?, ?, ?, ?)',
            [prueba_id, titulo.trim(), descripcion || null, resultado_esperado || null]
        );
        const [rows] = await pool.query(SELECT_BASE + ' WHERE t.id = ?', [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
    try {
        const error = await validar(req.body);
        if (error) return res.status(400).json({ error });

        const { prueba_id, titulo, descripcion, resultado_esperado } = req.body;
        const [r] = await pool.query(
            'UPDATE tareas SET prueba_id = ?, titulo = ?, descripcion = ?, resultado_esperado = ? WHERE id = ?',
            [prueba_id, titulo.trim(), descripcion || null, resultado_esperado || null, req.params.id]
        );
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        const [rows] = await pool.query(SELECT_BASE + ' WHERE t.id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
};

exports.eliminar = async (req, res, next) => {
    try {
        const [r] = await pool.query('DELETE FROM tareas WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json({ mensaje: 'Tarea eliminada' });
    } catch (e) {
        if (e.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: la tarea tiene observaciones relacionadas' });
        }
        next(e);
    }
};