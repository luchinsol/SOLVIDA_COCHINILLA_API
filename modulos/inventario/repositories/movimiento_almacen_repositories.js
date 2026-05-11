import db from '../../../config/database.js'

export const getMovimientosAlmacen = async (filters = {}) => {
  const values = []
  const conditions = []

  if (filters.almacen_id != null) {
    values.push(filters.almacen_id)
    conditions.push(`(
       ma.almacen_origen_id = $1
       OR ma.almacen_destino_id = $1
     )`)
  }

  if (filters.codigo_item != null) {
    values.push(filters.codigo_item)
    conditions.push(`ii.codigo_item = $${values.length}`)
  }

  if (filters.nombre_item != null) {
    values.push(filters.nombre_item)
    conditions.push(`LOWER(ii.nombre_item) = LOWER($${values.length})`)
  }

  if (filters.tipo != null) {
    values.push(filters.tipo)
    conditions.push(
      `LOWER(COALESCE(ti.nombre, lc.tipo_lote, lco.tipo_lote, e.tipo_extracto)) = LOWER($${values.length})`
    )
  }

  if (filters.fecha_desde != null) {
    values.push(filters.fecha_desde)
    conditions.push(`ma.fecha_hora >= $${values.length}`)
  }

  if (filters.fecha_hasta != null) {
    values.push(filters.fecha_hasta)
    conditions.push(`ma.fecha_hora <= $${values.length}`)
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  return await db.any(
    `SELECT
       ma.*,
       tma.nombre AS tipo_movimiento_nombre,
       ii.nombre_item,
       ii.codigo_item,
       COALESCE(
         li.nombre,
         lc.nombre_lote,
         lco.codigo_lote,
         e.nombre_extracto
       ) AS nombre_lote,
       COALESCE(
         ti.nombre,
         lc.tipo_lote,
         lco.tipo_lote,
         e.tipo_extracto
       ) AS tipo,
       COALESCE(
         li.unidad_medida_cantidad,
         lc.unidad_medida_stock,
         lco.unidad_medida_stock,
         e.unidad_medida_stock
       ) AS unidad_medida_stock,
       ao.nombre AS almacen_origen_nombre,
       ad.nombre AS almacen_destino_nombre
     FROM inventario.movimiento_almacen ma
     LEFT JOIN inventario.tipos_movimientos_almacen tma
       ON ma.tipo_movimientos_almacen_id = tma.tipo_mov_id
     LEFT JOIN inventario.item_inventario ii
       ON ma.item_inventario_id = ii.item_inventario_id
     LEFT JOIN inventario.lote_insumo li
       ON ii.item_inventario_id = li.item_inventario_id
     LEFT JOIN inventario.tipo_insumos ti
       ON li.tipo_insumo_id = ti.tipo_insumo_id
     LEFT JOIN lotes.lote_carmin lc
       ON ii.item_inventario_id = lc.item_inventario_id
     LEFT JOIN lotes.lote_cochinilla lco
       ON ii.item_inventario_id = lco.item_inventario_id
     LEFT JOIN lotes.extracto e
       ON ii.item_inventario_id = e.item_inventario_id
     LEFT JOIN inventario.almacen ao
       ON ma.almacen_origen_id = ao.almacen_id
     LEFT JOIN inventario.almacen ad
       ON ma.almacen_destino_id = ad.almacen_id
     ${whereClause}
     ORDER BY ma.movimiento_id DESC`,
    values
  )
}

export const createMovimientoAlmacen = async (movimientoDatos) => {
  return await db.one(
    `INSERT INTO inventario.movimiento_almacen
     (
       usuario_id,
       item_inventario_id,
       motivo_movimiento,
       fecha_hora,
       cantidad,
       observaciones,
       almacen_origen_id,
       almacen_destino_id,
       tipo_movimientos_almacen_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      movimientoDatos.usuario_id ?? null,
      movimientoDatos.item_inventario_id,
      movimientoDatos.motivo_movimiento,
      movimientoDatos.fecha_hora,
      movimientoDatos.cantidad,
      movimientoDatos.observaciones ?? null,
      movimientoDatos.almacen_origen_id,
      movimientoDatos.almacen_destino_id ?? null,
      movimientoDatos.tipo_movimientos_almacen_id
    ]
  )
}

export const updateMovimientoAlmacen = async (movimiento_id, movimientoDatos) => {
  return await db.oneOrNone(
    `UPDATE inventario.movimiento_almacen
     SET
       usuario_id = $1,
       item_inventario_id = $2,
       motivo_movimiento = $3,
       fecha_hora = $4,
       cantidad = $5,
       observaciones = $6,
       almacen_origen_id = $7,
       almacen_destino_id = $8,
       tipo_movimientos_almacen_id = $9
     WHERE movimiento_id = $10
     RETURNING *`,
    [
      movimientoDatos.usuario_id ?? null,
      movimientoDatos.item_inventario_id,
      movimientoDatos.motivo_movimiento,
      movimientoDatos.fecha_hora,
      movimientoDatos.cantidad,
      movimientoDatos.observaciones ?? null,
      movimientoDatos.almacen_origen_id,
      movimientoDatos.almacen_destino_id ?? null,
      movimientoDatos.tipo_movimientos_almacen_id,
      movimiento_id
    ]
  )
}

export const deleteMovimientoAlmacen = async (movimiento_id) => {
  const result = await db.result(
    `DELETE FROM inventario.movimiento_almacen
     WHERE movimiento_id = $1`,
    [movimiento_id]
  )

  return result.rowCount > 0
}
