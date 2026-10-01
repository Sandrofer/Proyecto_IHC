const pool = require('../db');

const SELECT_BASE = `
  SELECT 
    o.*,
    p.nombre AS prueba_nombre,
    t.titulo AS tarea_nombre,
    part.nombre AS participante_nombre
  FROM observaciones o
  JOIN pruebas p ON p.id = o.prueba_id
  JOIN tareas t ON t.id = o.tarea_id
  JOIN participantes part ON part.id = o.participante_id`;

async function validar(body) {
  const { prueba_id, tarea_id, participante_id, descripcion, completada, tiempo_seg, errores } = body;

  // 1. prueba_id
  if (prueba_id === undefined || prueba_id === null || prueba_id === '') {
    return 'prueba_id es obligatorio';
  }
  const numPrueba = Number(prueba_id);
  if (!Number.isInteger(numPrueba) || numPrueba <= 0) {
    return 'prueba_id debe ser un número entero válido';
  }
  const [pRows] = await pool.query('SELECT id FROM pruebas WHERE id = ?', [numPrueba]);
  if (pRows.length === 0) {
    return 'La prueba indicada no existe';
  }

  // 2. tarea_id
  if (tarea_id === undefined || tarea_id === null || tarea_id === '') {
    return 'tarea_id es obligatorio';
  }
  const numTarea = Number(tarea_id);
  if (!Number.isInteger(numTarea) || numTarea <= 0) {
    return 'tarea_id debe ser un número entero válido';
  }
  const [tRows] = await pool.query('SELECT id, prueba_id FROM tareas WHERE id = ?', [numTarea]);
  if (tRows.length === 0) {
    return 'La tarea indicada no existe';
  }

  // 3. Validar que la tarea pertenezca a la prueba elegida
  if (tRows[0].prueba_id !== numPrueba) {
    return 'La tarea seleccionada no pertenece a la prueba elegida';
  }

  // 4. participante_id
  if (participante_id === undefined || participante_id === null || participante_id === '') {
    return 'participante_id es obligatorio';
  }
  const numParticipante = Number(participante_id);
  if (!Number.isInteger(numParticipante) || numParticipante <= 0) {
    return 'participante_id debe ser un número entero válido';
  }
  const [partRows] = await pool.query('SELECT id FROM participantes WHERE id = ?', [numParticipante]);
  if (partRows.length === 0) {
    return 'El participante indicado no existe';
  }

  // 5. descripcion
  if (!descripcion || typeof descripcion !== 'string' || !descripcion.trim()) {
    return 'descripcion es obligatoria y no puede estar vacía';
  }

  // 6. completada (opcional en body pero debe ser boolean si viene)
  if (completada !== undefined && typeof completada !== 'boolean') {
    return 'completada debe ser un valor booleano (true o false)';
  }

  // 7. tiempo_seg (opcional)
  if (tiempo_seg !== undefined && tiempo_seg !== null && tiempo_seg !== '') {
    const numTiempo = Number(tiempo_seg);
    if (!Number.isInteger(numTiempo) || numTiempo < 0) {
      return 'tiempo_seg debe ser un número entero mayor o igual a 0';
    }
  }

  // 8. errores (opcional)
  if (errores !== undefined && errores !== null && errores !== '') {
    const numErrores = Number(errores);
    if (!Number.isInteger(numErrores) || numErrores < 0) {
      return 'errores debe ser un número entero mayor o igual a 0';
    }
  }

  return null;
}

exports.listar = async (req, res, next) => {
  try {
    let sql = SELECT_BASE;
    const params = [];

    if (req.query.prueba_id) {
      sql += ' WHERE o.prueba_id = ?';
      params.push(req.query.prueba_id);
    }

    sql += ' ORDER BY o.id DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query(SELECT_BASE + ' WHERE o.id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const error = await validar(req.body);
    if (error) return res.status(400).json({ error });

    const {
      prueba_id,
      tarea_id,
      participante_id,
      descripcion,
      completada = false,
      tiempo_seg,
      errores = 0,
    } = req.body;

    const parsedTiempo =
      tiempo_seg !== undefined && tiempo_seg !== null && tiempo_seg !== ''
        ? Number(tiempo_seg)
        : null;
    const parsedErrores =
      errores !== undefined && errores !== null && errores !== ''
        ? Number(errores)
        : 0;

    const [r] = await pool.query(
      `INSERT INTO observaciones 
        (prueba_id, tarea_id, participante_id, descripcion, completada, tiempo_seg, errores) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(prueba_id),
        Number(tarea_id),
        Number(participante_id),
        descripcion.trim(),
        Boolean(completada),
        parsedTiempo,
        parsedErrores,
      ]
    );

    const [rows] = await pool.query(SELECT_BASE + ' WHERE o.id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT id FROM observaciones WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    const error = await validar(req.body);
    if (error) return res.status(400).json({ error });

    const {
      prueba_id,
      tarea_id,
      participante_id,
      descripcion,
      completada = false,
      tiempo_seg,
      errores = 0,
    } = req.body;

    const parsedTiempo =
      tiempo_seg !== undefined && tiempo_seg !== null && tiempo_seg !== ''
        ? Number(tiempo_seg)
        : null;
    const parsedErrores =
      errores !== undefined && errores !== null && errores !== ''
        ? Number(errores)
        : 0;

    await pool.query(
      `UPDATE observaciones 
       SET prueba_id = ?, tarea_id = ?, participante_id = ?, descripcion = ?, completada = ?, tiempo_seg = ?, errores = ? 
       WHERE id = ?`,
      [
        Number(prueba_id),
        Number(tarea_id),
        Number(participante_id),
        descripcion.trim(),
        Boolean(completada),
        parsedTiempo,
        parsedErrores,
        req.params.id,
      ]
    );

    const [rows] = await pool.query(SELECT_BASE + ' WHERE o.id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM observaciones WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }
    res.json({ mensaje: 'Observación eliminada' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        error: 'No se puede eliminar: la observación está vinculada a un hallazgo',
      });
    }
    next(e);
  }
};
