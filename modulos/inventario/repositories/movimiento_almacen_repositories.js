import db from '../../../config/database.js'

export const obtenerTipoMovimientoAlmacenPorId = async (tipoMovId, t = db) => {
  return await t.oneOrNone(
    `SELECT *
     FROM inventario.tipos_movimientos_almacen
     WHERE tipo_mov_id = $1`,
    [tipoMovId]
  )
}

export const obtenerLotesPorItemInventarioId = async (itemInventarioId, t = db) => {
  return await t.any(
    `SELECT
       'lote_insumo' AS lote_tabla,
       li.lote_insumo_id AS lote_id,
       li.item_inventario_id,
       li.almacen_id,
       li.stock_actual,
       li.costo_unitario,
       li.costo_total,
       NULL::numeric AS costo_kilo_dolares,
       NULL::numeric AS costo_total_actual,
       NULL::numeric AS costo_puntoac_dolares,
       NULL::numeric AS concentracion_ac_actual,
       NULL::numeric AS costo_por_unidad
     FROM inventario.lote_insumo li
     WHERE li.item_inventario_id = $1

     UNION ALL

     SELECT
       'lote_cochinilla' AS lote_tabla,
       lc.lote_cochinilla_id AS lote_id,
       lc.item_inventario_id,
       lc.almacen_id,
       lc.stock_actual,
       NULL::numeric AS costo_unitario,
       NULL::numeric AS costo_total,
       lc.costo_kilo_dolares,
       lc.costo_total_actual,
       lc.costo_puntoac_dolares,
       lc.concentracion_ac_actual,
       NULL::numeric AS costo_por_unidad
     FROM lotes.lote_cochinilla lc
     WHERE lc.item_inventario_id = $1

     UNION ALL

     SELECT
       'lote_carmin' AS lote_tabla,
       lca.lote_carmin_id AS lote_id,
       lca.item_inventario_id,
       lca.almacen_id,
       lca.stock_actual,
       NULL::numeric AS costo_unitario,
       NULL::numeric AS costo_total,
       NULL::numeric AS costo_kilo_dolares,
       NULL::numeric AS costo_total_actual,
       NULL::numeric AS costo_puntoac_dolares,
       NULL::numeric AS concentracion_ac_actual,
       NULL::numeric AS costo_por_unidad
     FROM lotes.lote_carmin lca
     WHERE lca.item_inventario_id = $1

     UNION ALL

     SELECT
       'extracto' AS lote_tabla,
       e.extracto_id AS lote_id,
       e.item_inventario_id,
       e.almacen_id,
       e.stock_actual,
       NULL::numeric AS costo_unitario,
       NULL::numeric AS costo_total,
       NULL::numeric AS costo_kilo_dolares,
       e.costo_total_actual,
       NULL::numeric AS costo_puntoac_dolares,
       NULL::numeric AS concentracion_ac_actual,
       e.costo_por_unidad
     FROM lotes.extracto e
     WHERE e.item_inventario_id = $1`,
    [itemInventarioId]
  )
}

export const actualizarSaldoLotePorMovimiento = async (lote, nuevoStockActual, nuevoAlmacenId, t = db) => {
  if (lote.lote_tabla === 'lote_insumo') {
    const costoUnitario = Number(lote.costo_unitario ?? 0)
    const nuevoCostoTotal = nuevoStockActual * costoUnitario

    return await t.one(
      `UPDATE inventario.lote_insumo
       SET
         stock_actual = $1,
         costo_total = $2,
         almacen_id = $3
       WHERE lote_insumo_id = $4
       RETURNING *`,
      [nuevoStockActual, nuevoCostoTotal, nuevoAlmacenId, lote.lote_id]
    )
  }

  if (lote.lote_tabla === 'lote_cochinilla') {
    const costoKiloDolares = Number(lote.costo_kilo_dolares ?? 0)
    const nuevaConcentracion = Number(lote.concentracion_ac_actual ?? 0)
    const nuevoCostoTotalActual = nuevoStockActual * costoKiloDolares
    let nuevoCostoPuntoAc = null

    if (nuevoStockActual > 0 && nuevaConcentracion > 0) {
      nuevoCostoPuntoAc = nuevoCostoTotalActual / (nuevoStockActual * nuevaConcentracion)
    }

    return await t.one(
      `UPDATE lotes.lote_cochinilla
       SET
         stock_actual = $1,
         costo_total_actual = $2,
         costo_puntoac_dolares = $3,
         almacen_id = $4
       WHERE lote_cochinilla_id = $5
       RETURNING *`,
      [nuevoStockActual, nuevoCostoTotalActual, nuevoCostoPuntoAc, nuevoAlmacenId, lote.lote_id]
    )
  }

  if (lote.lote_tabla === 'lote_carmin') {
    return await t.one(
      `UPDATE lotes.lote_carmin
       SET
         stock_actual = $1,
         almacen_id = $2
       WHERE lote_carmin_id = $3
       RETURNING *`,
      [nuevoStockActual, nuevoAlmacenId, lote.lote_id]
    )
  }

  if (lote.lote_tabla === 'extracto') {
    const costoPorUnidad = Number(lote.costo_por_unidad ?? 0)
    const nuevoCostoTotalActual = nuevoStockActual * costoPorUnidad

    return await t.one(
      `UPDATE lotes.extracto
       SET
         stock_actual = $1,
         costo_total_actual = $2,
         almacen_id = $3
       WHERE extracto_id = $4
       RETURNING *`,
      [nuevoStockActual, nuevoCostoTotalActual, nuevoAlmacenId, lote.lote_id]
    )
  }

  throw new Error('No se pudo identificar la tabla del lote asociada al item_inventario_id')
}

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

export const createMovimientoAlmacen = async (movimientoDatos, t = db) => {
  return await t.one(
    `INSERT INTO inventario.movimiento_almacen
     (
       usuario_id,
       item_inventario_id,
       motivo_movimiento,
       fecha_hora,
       cantidad,
       saldo,
       observaciones,
       almacen_origen_id,
       almacen_destino_id,
       tipo_movimientos_almacen_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      movimientoDatos.usuario_id ?? null,
      movimientoDatos.item_inventario_id,
      movimientoDatos.motivo_movimiento,
      movimientoDatos.fecha_hora,
      movimientoDatos.cantidad,
      movimientoDatos.saldo,
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
       saldo = $6,
       observaciones = $7,
       almacen_origen_id = $8,
       almacen_destino_id = $9,
       tipo_movimientos_almacen_id = $10
     WHERE movimiento_id = $11
     RETURNING *`,
    [
      movimientoDatos.usuario_id ?? null,
      movimientoDatos.item_inventario_id,
      movimientoDatos.motivo_movimiento,
      movimientoDatos.fecha_hora,
      movimientoDatos.cantidad,
      movimientoDatos.saldo,
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
