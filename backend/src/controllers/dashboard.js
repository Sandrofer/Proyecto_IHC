const pool = require('../db');

// Los nombres de tabla y campo son fijos (no vienen del usuario)
const contar = async (tabla) => {
  const [r] = await pool.query(`SELECT COUNT(*) AS n FROM ${tabla}`);
  return r[0].n;
};

const agrupar = async (campo, valores) => {
  const [rows] = await pool.query(
    `SELECT ${campo} AS clave, COUNT(*) AS n FROM hallazgos GROUP BY ${campo}`
  );
  const out = Object.fromEntries(valores.map((v) => [v, 0]));
  rows.forEach((r) => { out[r.clave] = r.n; });
  return out;
};

exports.resumen = async (req, res, next) => {
  try {
    const totales = {
      pruebas: await contar('pruebas'),
      participantes: await contar('participantes'),
      observaciones: await contar('observaciones'),
      hallazgos: await contar('hallazgos'),
    };

    const hallazgos_por_severidad = await agrupar('severidad', ['cosmetica', 'menor', 'mayor', 'catastrofica']);
    const hallazgos_por_estado = await agrupar('estado', ['abierto', 'en_correccion', 'resuelto']);

    const [tareasRows] = await pool.query(`
      SELECT t.titulo,
             COALESCE(ROUND(100 * AVG(o.completada), 1), 0) AS tasa_exito,
             COALESCE(ROUND(AVG(o.tiempo_seg), 1), 0)       AS tiempo_promedio_seg,
             COALESCE(ROUND(AVG(o.errores), 1), 0)          AS errores_promedio
      FROM tareas t
      LEFT JOIN observaciones o ON o.tarea_id = t.id
      GROUP BY t.id, t.titulo
      ORDER BY t.id`);
    const tareas = tareasRows.map((t) => ({
      titulo: t.titulo,
      tasa_exito: Number(t.tasa_exito),
      tiempo_promedio_seg: Number(t.tiempo_promedio_seg),
      errores_promedio: Number(t.errores_promedio),
    }));

    const [top_hallazgos] = await pool.query(
      'SELECT id, titulo, severidad, frecuencia FROM hallazgos ORDER BY frecuencia DESC, id DESC LIMIT 5'
    );

    res.json({ totales, hallazgos_por_severidad, hallazgos_por_estado, tareas, top_hallazgos });
  } catch (e) { next(e); }
};