import db from '../../../config/database.js';


export const obtenerTodosAnalisis = async () => {
    const query = 'SELECT * FROM laboratorio.analisis_laboratorio';
    return db.query(query);
};

export const obtenerAnalisisPorId = async (id) => {
  const query = `
        SELECT *
        FROM laboratorio.analisis_laboratorio
        WHERE analisis_id = $1
    `;

    return await db.oneOrNone(query, [id]);
};

export const obtenerAnalisisActivoPorItemInventarioRepo = async (itemInventarioId) => {
  const query = `
    WITH lotes_relacionados AS (
      SELECT
        'lote_insumo' AS lote_tabla,
        li.lote_insumo_id::int AS lote_id,
        li.item_inventario_id::int AS item_inventario_id,
        li.estado_lote_id::int AS estado_lote_id,
        NULL::bigint AS analisis_actual_id
      FROM inventario.lote_insumo li
      WHERE li.item_inventario_id = $1

      UNION ALL

      SELECT
        'lote_cochinilla' AS lote_tabla,
        lc.lote_cochinilla_id::int AS lote_id,
        lc.item_inventario_id::int AS item_inventario_id,
        lc.estado_lote_id::int AS estado_lote_id,
        lc.analisis_actual_id::bigint AS analisis_actual_id
      FROM lotes.lote_cochinilla lc
      WHERE lc.item_inventario_id = $1

      UNION ALL

      SELECT
        'lote_carmin' AS lote_tabla,
        lca.lote_carmin_id::int AS lote_id,
        lca.item_inventario_id::int AS item_inventario_id,
        lca.estado_lote_id::int AS estado_lote_id,
        lca.analisis_actual_id::bigint AS analisis_actual_id
      FROM lotes.lote_carmin lca
      WHERE lca.item_inventario_id = $1

      UNION ALL

      SELECT
        'extracto' AS lote_tabla,
        e.extracto_id::int AS lote_id,
        e.item_inventario_id::int AS item_inventario_id,
        e.estado_lote_id::int AS estado_lote_id,
        NULL::bigint AS analisis_actual_id
      FROM lotes.extracto e
      WHERE e.item_inventario_id = $1
    ),
    lote_en_analisis AS (
      SELECT *
      FROM lotes_relacionados
      WHERE estado_lote_id = 6
      ORDER BY lote_id DESC
      LIMIT 1
    ),
    analisis_objetivo AS (
      SELECT
        al.*,
        lea.lote_tabla,
        lea.lote_id,
        lea.estado_lote_id
      FROM lote_en_analisis lea
      JOIN LATERAL (
        SELECT al.*
        FROM laboratorio.analisis_laboratorio al
        WHERE
          (lea.analisis_actual_id IS NOT NULL AND al.analisis_id = lea.analisis_actual_id)
          OR
          (lea.analisis_actual_id IS NULL AND al.item_inventario_id = lea.item_inventario_id)
        ORDER BY COALESCE(al.modificado_en, al.creado_en) DESC, al.analisis_id DESC
        LIMIT 1
      ) al ON true
    )
    SELECT
      ao.analisis_id::int AS analisis_id,
      ao.usuario_id::int AS usuario_id,
      ao.proceso_extraccion_id::int AS proceso_extraccion_id,
      ao.creado_en,
      ao.observaciones,
      ao.peso_muestra_g,
      ao.item_inventario_id::int AS item_inventario_id,
      ao.estado_analisis_id::int AS estado_analisis_id,
      ao.modificado_en,
      ao.nombre,
      ao.unidad_medida_masa,
      ao.solicitud_id::int AS solicitud_id,
      ao.lote_tabla,
      ao.lote_id::int AS lote_id,
      ao.estado_lote_id::int AS estado_lote_id,
      COALESCE(
        json_agg(
          json_build_object(
            'ensayo_id', el.ensayo_id,
            'analisis_id', el.analisis_id,
            'tipo_ensayo', el.tipo_ensayo,
            'conforme', el.conforme,
            'humedad', CASE
              WHEN el.tipo_ensayo = 'humedad' THEN json_build_object(
                'humedad_id', eh.humedad_id,
                'peso_ensayo_g', eh.peso_ensayo_g,
                'resultado', eh.resultado
              )
              ELSE NULL
            END,
            'acido_carminico', CASE
              WHEN el.tipo_ensayo = 'acido_carminico' THEN json_build_object(
                'acido_carminico_id', eac.acido_carminico_id,
                'peso_ensayo_g', eac.peso_ensayo_g,
                'absorbancia_nm', eac.absorbancia_nm,
                'resultado', eac.resultado
              )
              ELSE NULL
            END,
            'color_cielab', CASE
              WHEN el.tipo_ensayo = 'color_cielab' THEN json_build_object(
                'color_id', ecc.color_id,
                'peso_ensayo_g', ecc.peso_ensayo_g,
                'resultado_l', ecc.resultado_l,
                'resultado_a', ecc.resultado_a,
                'resultado_b', ecc.resultado_b
              )
              ELSE NULL
            END
          )
          ORDER BY el.ensayo_id
        ) FILTER (WHERE el.ensayo_id IS NOT NULL),
        '[]'::json
      ) AS ensayos
    FROM analisis_objetivo ao
    LEFT JOIN laboratorio.ensayo_laboratorio el
      ON el.analisis_id = ao.analisis_id
    LEFT JOIN laboratorio.ensayo_humedad eh
      ON eh.ensayo_id = el.ensayo_id
    LEFT JOIN laboratorio.ensayo_acido_carminico eac
      ON eac.ensayo_id = el.ensayo_id
    LEFT JOIN laboratorio.ensayo_color_cielab ecc
      ON ecc.ensayo_id = el.ensayo_id
    GROUP BY
      ao.analisis_id,
      ao.usuario_id,
      ao.proceso_extraccion_id,
      ao.creado_en,
      ao.observaciones,
      ao.peso_muestra_g,
      ao.item_inventario_id,
      ao.estado_analisis_id,
      ao.modificado_en,
      ao.nombre,
      ao.unidad_medida_masa,
      ao.solicitud_id,
      ao.lote_tabla,
      ao.lote_id,
      ao.estado_lote_id
  `

  return await db.oneOrNone(query, [itemInventarioId])
}

export const contarMuestrasAnalizadasHoy = async () => {
    const query = `
        SELECT COUNT(DISTINCT item_inventario_id)::int AS total_muestras_analizadas_hoy
        FROM laboratorio.analisis_laboratorio
        WHERE item_inventario_id IS NOT NULL
          AND DATE(COALESCE(modificado_en, creado_en)) = CURRENT_DATE
    `;

    return db.one(query);
};

export const contarNoConformidadesHoy = async () => {
    const query = `
        SELECT COUNT(el.ensayo_id)::int AS total_no_conformidades_hoy
        FROM laboratorio.analisis_laboratorio al
        INNER JOIN laboratorio.ensayo_laboratorio el
          ON el.analisis_id = al.analisis_id
        WHERE al.estado_analisis_id IN (2, 4, 5)
          AND el.conforme = false
          AND DATE(COALESCE(al.modificado_en, al.creado_en)) = CURRENT_DATE
    `;

    return db.one(query);
};

export const obtenerAnalisisNoConformes = async () => {
    const query = `
        SELECT *
        FROM laboratorio.analisis_laboratorio
        WHERE conforme = false
        ORDER BY COALESCE(modificado_en, creado_en) DESC, analisis_id DESC
    `;

    return db.query(query);
};

export const obtenerItemInventarioPorIdParaAnalisisRepo = async (itemInventarioId, t = db) => {
  return await t.oneOrNone(
    `SELECT
       item_inventario_id::int AS item_inventario_id,
       nombre_item,
       codigo_item
     FROM inventario.item_inventario
     WHERE item_inventario_id = $1`,
    [itemInventarioId]
  )
}

export const crearAnalisis = async (datos, t = db) => {
  const query = `
    INSERT INTO laboratorio.analisis_laboratorio
    (
      analisis_id,
      usuario_id,
      observaciones,
      peso_muestra_g,
      item_inventario_id,
      estado_analisis_id,
      nombre,
      solicitud_id,
      creado_en,
      modificado_en
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      NOW(),
      NOW()
    )
    RETURNING *
  `

  return await t.one(query, [
    datos.analisis_id,
    datos.usuario_id,
    datos.observaciones ?? null,
    datos.peso_muestra_g ?? null,
    datos.item_inventario_id,
    datos.estado_analisis_id,
    datos.nombre,
    datos.solicitud_id
  ])
}

export const crearEnsayoLaboratorioRepo = async (analisisId, tipoEnsayo, t = db) => {
  const query = `
    INSERT INTO laboratorio.ensayo_laboratorio (analisis_id, tipo_ensayo)
    VALUES ($1, $2)
    RETURNING ensayo_id::int AS ensayo_id, analisis_id::int AS analisis_id, tipo_ensayo
  `

  return await t.one(query, [analisisId, tipoEnsayo])
}

export const crearEnsayoHumedadRepo = async (ensayoId, t = db) => {
  const query = `
    INSERT INTO laboratorio.ensayo_humedad (ensayo_id, peso_ensayo_g, resultado)
    VALUES ($1, NULL, NULL)
    RETURNING *
  `

  return await t.one(query, [ensayoId])
}

export const crearEnsayoAcidoCarminicoRepo = async (ensayoId, t = db) => {
  const query = `
    INSERT INTO laboratorio.ensayo_acido_carminico (ensayo_id, peso_ensayo_g, absorbancia_nm, resultado)
    VALUES ($1, NULL, NULL, NULL)
    RETURNING *
  `

  return await t.one(query, [ensayoId])
}

export const crearEnsayoColorCielabRepo = async (ensayoId, t = db) => {
  const query = `
    INSERT INTO laboratorio.ensayo_color_cielab (ensayo_id, peso_ensayo_g, resultado_l, resultado_a, resultado_b)
    VALUES ($1, NULL, NULL, NULL, NULL)
    RETURNING *
  `

  return await t.one(query, [ensayoId])
}

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
    RETURNING solicitud_id::int AS solicitud_id, item_inventario_id::int AS item_inventario_id, usuario_id::int AS usuario_id, observacion_laboratorio, creado_en
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

export const actualizarAnalisisActualEnLoteRepo = async (loteTabla, loteId, analisisId, t = db) => {
  const tablasSoportadas = {
    lote_insumo: {
      schema: 'inventario',
      table: 'lote_insumo',
      pk: 'lote_insumo_id'
    },
    lote_cochinilla: {
      schema: 'lotes',
      table: 'lote_cochinilla',
      pk: 'lote_cochinilla_id'
    },
    lote_carmin: {
      schema: 'lotes',
      table: 'lote_carmin',
      pk: 'lote_carmin_id'
    },
    extracto: {
      schema: 'lotes',
      table: 'extracto',
      pk: 'extracto_id'
    }
  }

  const tablaObjetivo = tablasSoportadas[loteTabla]

  if (!tablaObjetivo) {
    return null
  }

  const columnaExiste = await t.one(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = $2
         AND column_name = 'analisis_actual_id'
     ) AS existe`,
    [tablaObjetivo.schema, tablaObjetivo.table]
  )

  if (!columnaExiste.existe) {
    return null
  }

  return await t.oneOrNone(
    `UPDATE ${tablaObjetivo.schema}.${tablaObjetivo.table}
     SET
       analisis_actual_id = $1,
       modificado_en = NOW()
     WHERE ${tablaObjetivo.pk} = $2
     RETURNING *`,
    [analisisId, loteId]
  )
}

export const actualizarAnalisis = async (id, datos, t = db) => {
  const allowedFields = [
    'peso_muestra_g',
    'peso_ensayo_g',
    'absorbancia',
    'concentracion_ac',
    'humedad',
    'color_l',
    'color_a',
    'color_b',
    'observaciones',
    'estado_analisis_id'
  ]

  const setClauses = []
  const values = []

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(datos, field)) {
      values.push(datos[field])
      setClauses.push(`${field} = $${values.length}`)
    }
  }

  if (!setClauses.length) {
    return null
  }

  values.push(id)

  const query = `
    UPDATE laboratorio.analisis_laboratorio
    SET
      ${setClauses.join(', ')},
      modificado_en = NOW()
    WHERE analisis_id = $${values.length}
    RETURNING *
  `

  return await t.oneOrNone(query, values)
}

export const eliminarAnalisis = async (id) => {
    const query = 'DELETE FROM laboratorio.analisis_laboratorio WHERE analisis_id = $1';
    return db.query(query, [id]);
};
