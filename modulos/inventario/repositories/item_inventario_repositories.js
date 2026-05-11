import db from '../../../config/database.js'

export const listarItemsInventarioRepo = async (filters = {}) => {
  const values = []
  const conditions = [
    `LOWER(COALESCE(li.estado_lote, lc.estado_lote, lco.estado_lote, e.estado_lote, '')) NOT IN ('agotado', 'por analizar')`
  ]

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
       COALESCE(li.almacen_id, lc.almacen_id, lco.almacen_id, e.almacen_id) AS almacen_id,
       a.nombre AS almacen_nombre,
       COALESCE(li.stock_actual, lc.stock_actual, lco.stock_actual, e.stock_actual) AS stock_actual,
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
       ) AS tipo
     FROM inventario.item_inventario ii
     LEFT JOIN inventario.lote_insumo li
       ON ii.item_inventario_id = li.item_inventario_id
     LEFT JOIN inventario.tipo_insumos ti
       ON li.tipo_insumo_id = ti.tipo_insumo_id
     LEFT JOIN inventario.proveedor pi
       ON li.proveedor_id = pi.proveedor_id
     LEFT JOIN lotes.lote_carmin lc
       ON ii.item_inventario_id = lc.item_inventario_id
     LEFT JOIN lotes.lote_cochinilla lco
       ON ii.item_inventario_id = lco.item_inventario_id
     LEFT JOIN inventario.proveedor pc
       ON lco.proveedor_id = pc.proveedor_id
     LEFT JOIN lotes.extracto e
       ON ii.item_inventario_id = e.item_inventario_id
     LEFT JOIN inventario.almacen a
       ON COALESCE(li.almacen_id, lc.almacen_id, lco.almacen_id, e.almacen_id) = a.almacen_id
     ${whereClause}
     ORDER BY ii.item_inventario_id ASC`,
    values
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
