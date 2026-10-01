const pool = require('../db');

const SEVERIDADES_VALIDAS = ['cosmetica', 'menor', 'mayor', 'catastrofica'];
const ESTADOS_VALIDOS = ['abierto', 'en_correccion', 'resuelto'];

const SELECT_BASE = `
  SELECT 
    h.*,
    p.nombre AS prueba_nombre,
    o.descripcion AS observacion_descripcion
  FROM hallazgos h
  JOIN pruebas p ON p.id = h.prueba_id
  LEFT JOIN observaciones o ON o.id = h.observacion_id`;

async function validar(body) {
  const { prueba_id, observacion_id, titulo, severidad, estado, frecuencia } = body;

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

  // 2. observacion_id (opcional, pero si viene debe ser válida y pertenecer a la prueba)
  if (observacion_id !== undefined && observacion_id !== null && observacion_id !== '') {
    const numObs = Number(observacion_id);
    if (!Number.isInteger(numObs) || numObs <= 0) {
      return 'observacion_id debe ser un número entero válido';
    }
    const [obsRows] = await pool.query('SELECT id, prueba_id FROM observaciones WHERE id = ?', [numObs]);
    if (obsRows.length === 0) {
      return 'La observación indicada no existe';
    }
    if (obsRows[0].prueba_id !== numPrueba) {
      return 'La observación seleccionada no pertenece a la prueba elegida';
    }
  }

  // 3. titulo
  if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
    return 'titulo es obligatorio y no puede estar vacío';
  }

  // 4. severidad
  if (!severidad || !SEVERIDADES_VALIDAS.includes(severidad)) {
    return `severidad es obligatoria y debe ser una de: ${SEVERIDADES_VALIDAS.join(', ')}`;
  }

  // 5. estado (opcional, default 'abierto')
  if (estado !== undefined && estado !== null && estado !== '') {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`;
    }
  }

  // 6. frecuencia (opcional, default 1, debe ser entero >= 1)
  if (frecuencia !== undefined && frecuencia !== null && frecuencia !== '') {
    const numFrecuencia = Number(frecuencia);
    if (!Number.isInteger(numFrecuencia) || numFrecuencia < 1) {
      return 'frecuencia debe ser un número entero mayor o igual a 1';
    }
  }

  return null;
}

exports.listar = async (req, res, next) => {
  try {
    let sql = SELECT_BASE;
    const whereClauses = [];
    const params = [];

    if (req.query.prueba_id) {
      whereClauses.push('h.prueba_id = ?');
      params.push(req.query.prueba_id);
    }

    if (req.query.severidad) {
      whereClauses.push('h.severidad = ?');
      params.push(req.query.severidad);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY h.id DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query(SELECT_BASE + ' WHERE h.id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hallazgo no encontrado' });
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
      observacion_id,
      titulo,
      descripcion,
      severidad,
      frecuencia = 1,
      recomendacion,
      estado = 'abierto',
    } = req.body;

    const parsedObsId =
      observacion_id !== undefined && observacion_id !== null && observacion_id !== ''
        ? Number(observacion_id)
        : null;
    const parsedFrecuencia =
      frecuencia !== undefined && frecuencia !== null && frecuencia !== ''
        ? Number(frecuencia)
        : 1;

    const [r] = await pool.query(
      `INSERT INTO hallazgos 
        (prueba_id, observacion_id, titulo, descripcion, severidad, frecuencia, recomendacion, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(prueba_id),
        parsedObsId,
        titulo.trim(),
        descripcion ? String(descripcion).trim() : null,
        severidad,
        parsedFrecuencia,
        recomendacion ? String(recomendacion).trim() : null,
        estado || 'abierto',
      ]
    );

    const [rows] = await pool.query(SELECT_BASE + ' WHERE h.id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT id FROM hallazgos WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Hallazgo no encontrado' });
    }

    const error = await validar(req.body);
    if (error) return res.status(400).json({ error });

    const {
      prueba_id,
      observacion_id,
      titulo,
      descripcion,
      severidad,
      frecuencia = 1,
      recomendacion,
      estado = 'abierto',
    } = req.body;

    const parsedObsId =
      observacion_id !== undefined && observacion_id !== null && observacion_id !== ''
        ? Number(observacion_id)
        : null;
    const parsedFrecuencia =
      frecuencia !== undefined && frecuencia !== null && frecuencia !== ''
        ? Number(frecuencia)
        : 1;

    await pool.query(
      `UPDATE hallazgos 
       SET prueba_id = ?, observacion_id = ?, titulo = ?, descripcion = ?, severidad = ?, frecuencia = ?, recomendacion = ?, estado = ? 
       WHERE id = ?`,
      [
        Number(prueba_id),
        parsedObsId,
        titulo.trim(),
        descripcion ? String(descripcion).trim() : null,
        severidad,
        parsedFrecuencia,
        recomendacion ? String(recomendacion).trim() : null,
        estado || 'abierto',
        req.params.id,
      ]
    );

    const [rows] = await pool.query(SELECT_BASE + ' WHERE h.id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM hallazgos WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: 'Hallazgo no encontrado' });
    }
    res.json({ mensaje: 'Hallazgo eliminado' });
  } catch (e) {
    next(e);
  }
};
