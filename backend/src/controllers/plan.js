const pool = require('../db');

async function validarDatosPlan(body) {
  const { prueba_id, objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion } = body;

  if (prueba_id === undefined || prueba_id === null || prueba_id === '') {
    return { error: 'prueba_id es obligatorio' };
  }

  const pid = Number(prueba_id);
  if (!Number.isInteger(pid) || pid <= 0) {
    return { error: 'prueba_id debe ser un número entero válido' };
  }

  const [pruebaRows] = await pool.query('SELECT id FROM pruebas WHERE id = ?', [pid]);
  if (pruebaRows.length === 0) {
    return { error: 'La prueba especificada no existe' };
  }

  if (metodo !== undefined && metodo !== null && metodo !== '') {
    if (typeof metodo !== 'string' || metodo.length > 100) {
      return { error: 'El método no debe superar los 100 caracteres' };
    }
  }

  const camposContenido = [objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion];
  const tieneTexto = camposContenido.some(
    (campo) => typeof campo === 'string' && campo.trim().length > 0
  );

  if (!tieneTexto) {
    return {
      error: 'Al menos un campo de contenido (objetivos, perfil de usuarios, método, tareas del plan, métricas o guion de moderación) debe contener texto'
    };
  }

  return {
    datos: {
      prueba_id: pid,
      objetivos: typeof objetivos === 'string' ? objetivos.trim() : null,
      perfil_usuarios: typeof perfil_usuarios === 'string' ? perfil_usuarios.trim() : null,
      metodo: typeof metodo === 'string' ? metodo.trim() : null,
      tareas_plan: typeof tareas_plan === 'string' ? tareas_plan.trim() : null,
      metricas: typeof metricas === 'string' ? metricas.trim() : null,
      guion_moderacion: typeof guion_moderacion === 'string' ? guion_moderacion.trim() : null
    }
  };
}

async function listar(req, res) {
  try {
    const { prueba_id } = req.query;
    let sql = `
      SELECT p.*, pr.nombre AS prueba_nombre
      FROM plan_pruebas p
      INNER JOIN pruebas pr ON p.prueba_id = pr.id
    `;
    const params = [];

    if (prueba_id !== undefined && prueba_id !== '') {
      const pid = Number(prueba_id);
      if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({ error: 'prueba_id debe ser un número entero válido' });
      }
      sql += ' WHERE p.prueba_id = ?';
      params.push(pid);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El id debe ser un número entero válido' });
    }

    const [rows] = await pool.query(
      `SELECT p.*, pr.nombre AS prueba_nombre
       FROM plan_pruebas p
       INNER JOIN pruebas pr ON p.prueba_id = pr.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crear(req, res) {
  try {
    const validacion = await validarDatosPlan(req.body);
    if (validacion.error) {
      return res.status(400).json({ error: validacion.error });
    }

    const { prueba_id, objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion } = validacion.datos;

    const [result] = await pool.query(
      `INSERT INTO plan_pruebas (prueba_id, objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [prueba_id, objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion]
    );

    const nuevoId = result.insertId;
    const [rows] = await pool.query(
      `SELECT p.*, pr.nombre AS prueba_nombre
       FROM plan_pruebas p
       INNER JOIN pruebas pr ON p.prueba_id = pr.id
       WHERE p.id = ?`,
      [nuevoId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El id debe ser un número entero válido' });
    }

    const [existente] = await pool.query('SELECT id FROM plan_pruebas WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    const validacion = await validarDatosPlan(req.body);
    if (validacion.error) {
      return res.status(400).json({ error: validacion.error });
    }

    const { prueba_id, objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion } = validacion.datos;

    await pool.query(
      `UPDATE plan_pruebas
       SET prueba_id = ?, objetivos = ?, perfil_usuarios = ?, metodo = ?, tareas_plan = ?, metricas = ?, guion_moderacion = ?
       WHERE id = ?`,
      [prueba_id, objetivos, perfil_usuarios, metodo, tareas_plan, metricas, guion_moderacion, id]
    );

    const [rows] = await pool.query(
      `SELECT p.*, pr.nombre AS prueba_nombre
       FROM plan_pruebas p
       INNER JOIN pruebas pr ON p.prueba_id = pr.id
       WHERE p.id = ?`,
      [id]
    );

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminar(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El id debe ser un número entero válido' });
    }

    const [existente] = await pool.query('SELECT id FROM plan_pruebas WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    await pool.query('DELETE FROM plan_pruebas WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
