import db from '../../../config/database.js'

export const crearSolicitudAnalisisLaboratorioRepo = async (
  { item_inventario_id, usuario_id, observacion_laboratorio = null },
  t = db
) => {
  const query = `
    INSERT INTO laboratorio.solicitud_analisis_laboratorio (
      item_inventario_id,
      usuario_id,
      observacion_laboratorio
    )
    VALUES ($1, $2, $3)
    RETURNING solicitud_id::int AS solicitud_id, item_inventario_id::int AS item_inventario_id, usuario_id::int AS usuario_id, observacion_laboratorio, creado_en, COALESCE(atendido, false) AS atendido
  `

  return await t.one(query, [item_inventario_id, usuario_id, observacion_laboratorio])
}

export const crearSolicitudParametroLaboratorioRepo = async (
  solicitudId,
  tipoEnsayo,
  t = db
) => {
  const query = `
    INSERT INTO laboratorio.solicitud_parametro_laboratorio (
      solicitud_id,
      tipo_ensayo
    )
    VALUES ($1, $2)
    RETURNING solicitud_parametro_id::int AS solicitud_parametro_id, solicitud_id::int AS solicitud_id, tipo_ensayo
  `

  return await t.one(query, [solicitudId, tipoEnsayo])
}

export const obtenerSolicitudAnalisisPendientePorItemInventarioRepo = async (itemInventarioId) => {
  const query = `
    WITH solicitud_reciente AS (
      SELECT
        sal.solicitud_id,
        sal.item_inventario_id,
        sal.usuario_id,
        sal.observacion_laboratorio,
        sal.creado_en,
        COALESCE(sal.atendido, false) AS atendido
      FROM laboratorio.solicitud_analisis_laboratorio sal
      WHERE sal.item_inventario_id = $1
        AND COALESCE(sal.atendido, false) = false
      ORDER BY sal.creado_en DESC, sal.solicitud_id DESC
      LIMIT 1
    )
    SELECT
      sr.solicitud_id::int AS solicitud_id,
      sr.item_inventario_id::int AS item_inventario_id,
      sr.usuario_id::int AS usuario_id,
      sr.observacion_laboratorio,
      sr.creado_en,
      sr.atendido,
      COALESCE(
        json_agg(
          json_build_object(
            'solicitud_parametro_id', spl.solicitud_parametro_id,
            'tipo_ensayo', spl.tipo_ensayo
          )
          ORDER BY spl.solicitud_parametro_id
        ) FILTER (WHERE spl.solicitud_parametro_id IS NOT NULL),
        '[]'::json
      ) AS parametros
    FROM solicitud_reciente sr
    LEFT JOIN laboratorio.solicitud_parametro_laboratorio spl
      ON spl.solicitud_id = sr.solicitud_id
    GROUP BY
      sr.solicitud_id,
      sr.item_inventario_id,
      sr.usuario_id,
      sr.observacion_laboratorio,
      sr.creado_en,
      sr.atendido
  `

  return await db.oneOrNone(query, [itemInventarioId])
}

export const obtenerSolicitudAnalisisPorIdConParametrosRepo = async (solicitudId, t = db) => {
  const query = `
    SELECT
      sal.solicitud_id::int AS solicitud_id,
      sal.item_inventario_id::int AS item_inventario_id,
      sal.usuario_id::int AS usuario_id,
      sal.observacion_laboratorio,
      sal.creado_en,
      COALESCE(sal.atendido, false) AS atendido,
      COALESCE(
        json_agg(
          json_build_object(
            'solicitud_parametro_id', spl.solicitud_parametro_id,
            'tipo_ensayo', spl.tipo_ensayo
          )
          ORDER BY spl.solicitud_parametro_id
        ) FILTER (WHERE spl.solicitud_parametro_id IS NOT NULL),
        '[]'::json
      ) AS parametros
    FROM laboratorio.solicitud_analisis_laboratorio sal
    LEFT JOIN laboratorio.solicitud_parametro_laboratorio spl
      ON spl.solicitud_id = sal.solicitud_id
    WHERE sal.solicitud_id = $1
    GROUP BY
      sal.solicitud_id,
      sal.item_inventario_id,
      sal.usuario_id,
      sal.observacion_laboratorio,
      sal.creado_en,
      sal.atendido
  `

  return await t.oneOrNone(query, [solicitudId])
}

export const marcarSolicitudAnalisisAtendidaRepo = async (solicitudId, t = db) => {
  const query = `
    UPDATE laboratorio.solicitud_analisis_laboratorio
    SET atendido = true
    WHERE solicitud_id = $1
    RETURNING
      solicitud_id::int AS solicitud_id,
      item_inventario_id::int AS item_inventario_id,
      usuario_id::int AS usuario_id,
      observacion_laboratorio,
      creado_en,
      COALESCE(atendido, false) AS atendido
  `

  return await t.oneOrNone(query, [solicitudId])
}
