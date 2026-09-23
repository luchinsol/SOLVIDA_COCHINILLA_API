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

  return await db.any(
    `SELECT
       ii.item_inventario_id::int AS item_inventario_id,
       ii.codigo_item,
       COALESCE(lc.nombre_lote, lco.codigo_lote, e.nombre_extracto) AS nombre_lote,
       COALESCE(lc.estado_lote_id, lco.estado_lote_id, e.estado_lote_id)::int AS estado_lote_id,
       COALESCE(elc.nombre, elco.nombre, ee.nombre) AS estado,
       TO_CHAR(
         COALESCE(lc.modificado_en, lco.modificado_en, e.modificado_en)::date,
         'DD/MM/YYYY'
       ) AS fecha
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
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(lc.modificado_en, lco.modificado_en, e.modificado_en) ${orderDirection},
              ii.item_inventario_id ${orderDirection}`,
    values
  )
}

export const contarMuestrasPendientesLaboratorioRepo = async () => {
  return await db.one(
    `SELECT COUNT(*)::int AS total_muestras_pendientes
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
       )`
  )
}

export const contarMuestrasEnAnalisisRepo = async () => {
  return await db.one(
    `SELECT COUNT(*)::int AS total_muestras_en_analisis
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
       AND al_actual.estado_analisis_id IS DISTINCT FROM 4`
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
