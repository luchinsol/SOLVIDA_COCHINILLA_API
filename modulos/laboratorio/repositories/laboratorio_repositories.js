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
        SELECT COUNT(*)::int AS total_no_conformidades_hoy
        FROM laboratorio.analisis_laboratorio
        WHERE conforme = false
          AND DATE(COALESCE(modificado_en, creado_en)) = CURRENT_DATE
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
      creado_en,
      modificado_en
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
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
    datos.unidad_medida ?? null
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
