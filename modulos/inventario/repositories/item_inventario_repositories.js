import db from '../../../config/database.js'

export const listarItemsInventarioRepo = async (filters = {}) => {
  const values = []
  const conditions = [
    `LOWER(COALESCE(eli.nombre, elc.nombre, elco.nombre, ee.nombre, '')) NOT IN ('agotado', 'por analizar')`
  ]

  if (!filters.incluir_agotados) {
    conditions.push('sia.stock_actual > 0')
  }

  if (filters.nombre_item) {
    values.push(filters.nombre_item)
    conditions.push(`LOWER(ii.nombre_item) = LOWER($${values.length})`)
  }

  if (filters.proveedor_nombre) {
    values.push(filters.proveedor_nombre)
    conditions.push(
      `LOWER(COALESCE(pi.nombre_razon_social, pc.nombre_razon_social)) = LOWER($${values.length})`
    )
  }

  if (filters.tipo) {
    values.push(filters.tipo)
    conditions.push(
      `LOWER(COALESCE(ti.nombre, lc.tipo_lote, lco.tipo_lote, e.tipo_extracto)) = LOWER($${values.length})`
    )
  }

  if (filters.almacen_nombre) {
    values.push(filters.almacen_nombre)
    conditions.push(`LOWER(a.nombre) = LOWER($${values.length})`)
  }

  if (filters.almacen_id) {
    values.push(filters.almacen_id)
    conditions.push(`sia.almacen_id = $${values.length}`)
  }

  if (filters.codigo) {
    values.push(filters.codigo)
    conditions.push(`LOWER(ii.codigo_item) = LOWER($${values.length})`)
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  return await db.any(
    `SELECT
       ii.*,
       COALESCE(li.nombre, lc.nombre_lote, lco.codigo_lote, e.nombre_extracto) AS nombre_lote,
       COALESCE(li.proveedor_id, lco.proveedor_id) AS proveedor_id,
       COALESCE(pi.nombre_razon_social, pc.nombre_razon_social) AS proveedor_nombre,
       sia.almacen_id::int AS almacen_id,
       a.nombre AS almacen_nombre,
       sia.stock_actual::double precision AS stock_actual,
       COALESCE(stock_total.stock_total, 0)::double precision AS stock_total,
       COALESCE(stock_total.cantidad_almacenes, 0)::int AS cantidad_almacenes,
       COALESCE(
         li.unidad_medida_cantidad,
         lc.unidad_medida_stock,
         lco.unidad_medida_stock,
         e.unidad_medida_stock
       ) AS unidad_medida_stock,
       COALESCE(
         ti.nombre,
         lc.tipo_lote,
         lco.tipo_lote,
         e.tipo_extracto
       ) AS tipo,
       COALESCE(eli.nombre, elc.nombre, elco.nombre, ee.nombre) AS estado_lote
     FROM inventario.item_inventario ii
     INNER JOIN inventario.stock_item_almacen sia
       ON ii.item_inventario_id = sia.item_inventario_id
     LEFT JOIN LATERAL (
       SELECT
         SUM(sia_total.stock_actual) AS stock_total,
         COUNT(*) FILTER (WHERE sia_total.stock_actual > 0) AS cantidad_almacenes
       FROM inventario.stock_item_almacen sia_total
       WHERE sia_total.item_inventario_id = ii.item_inventario_id
     ) stock_total ON TRUE
     LEFT JOIN inventario.lote_insumo li
       ON ii.item_inventario_id = li.item_inventario_id
     LEFT JOIN lotes.estado_lote eli
       ON li.estado_lote_id = eli.estado_lote_id
     LEFT JOIN inventario.tipo_insumos ti
       ON li.tipo_insumo_id = ti.tipo_insumo_id
     LEFT JOIN inventario.proveedor pi
       ON li.proveedor_id = pi.proveedor_id
     LEFT JOIN lotes.lote_carmin lc
       ON ii.item_inventario_id = lc.item_inventario_id
     LEFT JOIN lotes.estado_lote elc
       ON lc.estado_lote_id = elc.estado_lote_id
     LEFT JOIN lotes.lote_cochinilla lco
       ON ii.item_inventario_id = lco.item_inventario_id
     LEFT JOIN lotes.estado_lote elco
       ON lco.estado_lote_id = elco.estado_lote_id
     LEFT JOIN inventario.proveedor pc
       ON lco.proveedor_id = pc.proveedor_id
     LEFT JOIN lotes.extracto e
       ON ii.item_inventario_id = e.item_inventario_id
     LEFT JOIN lotes.estado_lote ee
       ON e.estado_lote_id = ee.estado_lote_id
     INNER JOIN inventario.almacen a
       ON sia.almacen_id = a.almacen_id
     ${whereClause}
     ORDER BY ii.item_inventario_id ASC, sia.almacen_id ASC`,
    values
  )
}

export const listarMuestrasPendientesLaboratorioRepo = async (filters = {}) => {
  const values = []
  const conditions = [
    `LOWER(ii.nombre_item) IN ('carmin', 'cochinilla', 'extracto')`,
    `COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id) IN (2, 6, 3)`,
    `(
      COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id) <> 6
      OR al_actual.estado_analisis_id IS DISTINCT FROM 4
    )`
  ]

  if (filters.estado_lote_id) {
    values.push(filters.estado_lote_id)
    conditions.push(
      `COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id) = $${values.length}`
    )
  }

  if (filters.producto) {
    values.push(filters.producto)
    conditions.push(`LOWER(ii.nombre_item) = LOWER($${values.length})`)
  }

  const orderDirection =
    filters.orden === 'antiguo' || filters.orden === 'asc'
      ? 'ASC'
      : 'DESC'

  const muestrasInternas = `SELECT
       ii.item_inventario_id::int AS item_inventario_id,
       NULL::int AS muestra_id,
       'inventario'::text AS origen,
       ii.codigo_item,
       COALESCE(lc.nombre_lote, lco.codigo_lote, e.nombre_extracto) AS nombre_lote,
       COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id)::int AS estado_lote_id,
       COALESCE(elc.nombre, elco.nombre, ee.nombre) AS estado,
       solicitud.solicitud_id::int AS solicitud_id,
       TO_CHAR(
         COALESCE(lc.modificado_en, lco.modificado_en, e.modificado_en)::date,
         'DD/MM/YYYY'
       ) AS fecha,
       COALESCE(lc.modificado_en, lco.modificado_en, e.modificado_en) AS fecha_orden
     FROM inventario.item_inventario ii
     LEFT JOIN lotes.lote_carmin lc
       ON ii.item_inventario_id = lc.item_inventario_id
     LEFT JOIN lotes.estado_lote elc
       ON lc.estado_lote_id = elc.estado_lote_id
     LEFT JOIN lotes.lote_cochinilla lco
       ON ii.item_inventario_id = lco.item_inventario_id
     LEFT JOIN lotes.estado_lote elco
       ON lco.estado_lote_id = elco.estado_lote_id
     LEFT JOIN lotes.extracto e
       ON ii.item_inventario_id = e.item_inventario_id
     LEFT JOIN lotes.estado_lote ee
       ON e.estado_lote_id = ee.estado_lote_id
     LEFT JOIN laboratorio.analisis_laboratorio al_actual
       ON al_actual.analisis_id = COALESCE(lc.analisis_actual_id, lco.analisis_actual_id)
     LEFT JOIN LATERAL (
       SELECT sal.solicitud_id
       FROM laboratorio.solicitud_analisis_laboratorio sal
       WHERE sal.item_inventario_id = ii.item_inventario_id
       ORDER BY sal.creado_en DESC, sal.solicitud_id DESC
       LIMIT 1
     ) solicitud ON true
     WHERE ${conditions.join(' AND ')}`

  const incluirExternas = !filters.producto
    && (!filters.estado_lote_id || [2, 6].includes(filters.estado_lote_id))

  const muestrasExternas = incluirExternas
    ? `UNION ALL
       SELECT
         NULL::int AS item_inventario_id,
         mel.muestra_id::int AS muestra_id,
         'muestra_externa'::text AS origen,
         mel.codigo_muestra AS codigo_item,
         COALESCE(NULLIF(mel.lote_externo, ''), mel.nombre_muestra) AS nombre_lote,
         CASE WHEN al.analisis_id IS NULL THEN 2 ELSE 6 END::int AS estado_lote_id,
         CASE WHEN al.analisis_id IS NULL THEN 'Por analizar' ELSE 'En análisis' END AS estado,
         sal.solicitud_id::int AS solicitud_id,
         TO_CHAR(COALESCE(al.modificado_en, sal.creado_en)::date, 'DD/MM/YYYY') AS fecha,
         COALESCE(al.modificado_en, sal.creado_en) AS fecha_orden
       FROM laboratorio.solicitud_analisis_laboratorio sal
       INNER JOIN laboratorio.muestra_externa_laboratorio mel
         ON mel.muestra_id = sal.muestra_id
       LEFT JOIN LATERAL (
         SELECT analisis_id, modificado_en, estado_analisis_id
         FROM laboratorio.analisis_laboratorio
         WHERE solicitud_id = sal.solicitud_id
           AND estado_analisis_id = 1
         ORDER BY COALESCE(modificado_en, creado_en) DESC, analisis_id DESC
         LIMIT 1
       ) al ON true
       WHERE (COALESCE(sal.atendido, false) = false OR al.analisis_id IS NOT NULL)
         AND mel.estado_muestra NOT IN ('transferida_inventario', 'devuelta_cliente', 'descartada')
         ${filters.estado_lote_id === 2 ? 'AND al.analisis_id IS NULL' : ''}
         ${filters.estado_lote_id === 6 ? 'AND al.estado_analisis_id = 1' : ''}`
    : ''

  return await db.any(
    `SELECT
       item_inventario_id,
       muestra_id,
       origen,
       codigo_item,
       nombre_lote,
       estado_lote_id,
       estado,
       solicitud_id,
       fecha
     FROM (
       ${muestrasInternas}
       ${muestrasExternas}
     ) muestras
     ORDER BY fecha_orden ${orderDirection}, codigo_item ${orderDirection}`,
    values
  )
}

export const contarMuestrasPendientesLaboratorioRepo = async () => {
  return await db.one(
    `WITH internas AS (
       SELECT ii.item_inventario_id
       FROM inventario.item_inventario ii
     LEFT JOIN lotes.lote_carmin lc
       ON ii.item_inventario_id = lc.item_inventario_id
     LEFT JOIN lotes.lote_cochinilla lco
       ON ii.item_inventario_id = lco.item_inventario_id
     LEFT JOIN lotes.extracto e
       ON ii.item_inventario_id = e.item_inventario_id
     LEFT JOIN laboratorio.analisis_laboratorio al_actual
       ON al_actual.analisis_id = COALESCE(lc.analisis_actual_id, lco.analisis_actual_id)
     WHERE LOWER(ii.nombre_item) IN ('carmin', 'cochinilla', 'extracto')
       AND COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id) IN (2, 6, 3)
       AND (
         COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id) <> 6
         OR al_actual.estado_analisis_id IS DISTINCT FROM 4
       )
     ), externas AS (
       SELECT sal.solicitud_id
       FROM laboratorio.solicitud_analisis_laboratorio sal
       INNER JOIN laboratorio.muestra_externa_laboratorio mel
         ON mel.muestra_id = sal.muestra_id
       WHERE COALESCE(sal.atendido, false) = false
         AND mel.estado_muestra NOT IN ('transferida_inventario', 'devuelta_cliente', 'descartada')
     )
     SELECT (
       (SELECT COUNT(*) FROM internas) +
       (SELECT COUNT(*) FROM externas)
     )::int AS total_muestras_pendientes`
  )
}

export const contarMuestrasEnAnalisisRepo = async () => {
  return await db.one(
    `WITH internas AS (
       SELECT ii.item_inventario_id
       FROM inventario.item_inventario ii
     LEFT JOIN lotes.lote_carmin lc
       ON ii.item_inventario_id = lc.item_inventario_id
     LEFT JOIN lotes.lote_cochinilla lco
       ON ii.item_inventario_id = lco.item_inventario_id
     LEFT JOIN lotes.extracto e
       ON ii.item_inventario_id = e.item_inventario_id
     LEFT JOIN laboratorio.analisis_laboratorio al_actual
       ON al_actual.analisis_id = COALESCE(lc.analisis_actual_id, lco.analisis_actual_id)
     WHERE LOWER(ii.nombre_item) IN ('carmin', 'cochinilla', 'extracto')
       AND COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id) = 6
       AND al_actual.estado_analisis_id = 1
     ), externas AS (
       SELECT al.analisis_id
       FROM laboratorio.analisis_laboratorio al
       WHERE al.muestra_id IS NOT NULL
         AND al.estado_analisis_id = 1
     )
     SELECT (
       (SELECT COUNT(*) FROM internas) +
       (SELECT COUNT(*) FROM externas)
     )::int AS total_muestras_en_analisis`
  )
}

export const listarTiposPorNombreItemRepo = async (nombreItem) => {
  if (nombreItem === 'Insumos Quimicos') {
    return await db.any(
      `SELECT DISTINCT
         nombre AS tipo
       FROM inventario.tipo_insumos
       ORDER BY nombre ASC`
    )
  }

  if (nombreItem === 'Carmin') {
    return await db.any(
      `SELECT DISTINCT
         tipo_lote AS tipo
       FROM lotes.lote_carmin
       WHERE tipo_lote IS NOT NULL AND TRIM(tipo_lote) <> ''
       ORDER BY tipo_lote ASC`
    )
  }

  if (nombreItem === 'Cochinilla') {
    return await db.any(
      `SELECT DISTINCT
         tipo_lote AS tipo
       FROM lotes.lote_cochinilla
       WHERE tipo_lote IS NOT NULL AND TRIM(tipo_lote) <> ''
       ORDER BY tipo_lote ASC`
    )
  }

  if (nombreItem === 'Extracto') {
    return await db.any(
      `SELECT DISTINCT
         tipo_extracto AS tipo
       FROM lotes.extracto
       WHERE tipo_extracto IS NOT NULL AND TRIM(tipo_extracto) <> ''
       ORDER BY tipo_extracto ASC`
    )
  }

  return []
}

export const crearItemInventarioRepo = async (data, t = db) => {
  return await t.one(
    `INSERT INTO inventario.item_inventario
     (nombre_item, codigo_item)
     VALUES ($1, $2)
     RETURNING *`,
    [
      data.nombre_item,
      data.codigo_item
    ]
  )
}

export const actualizarCodigoItemInventarioRepo = async (id, codigoItem, t = db) => {
  return await t.one(
    `UPDATE inventario.item_inventario
     SET codigo_item = $1
     WHERE item_inventario_id = $2
     RETURNING *`,
    [codigoItem, id]
  )
}
