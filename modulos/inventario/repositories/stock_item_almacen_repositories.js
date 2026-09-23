import db from '../../../config/database.js'

export const obtenerItemStockRepo = async (itemInventarioId, t = db) => {
  return await t.oneOrNone(
    `SELECT
       ii.item_inventario_id::int AS item_inventario_id,
       ii.codigo_item,
       ii.nombre_item,
       COALESCE(li.nombre, lc.nombre_lote, lco.codigo_lote, e.nombre_extracto) AS nombre_lote,
       COALESCE(ti.nombre, lc.tipo_lote, lco.tipo_lote, e.tipo_extracto) AS tipo,
       COALESCE(
         li.unidad_medida_cantidad,
         lc.unidad_medida_stock,
         lco.unidad_medida_stock,
         e.unidad_medida_stock
       ) AS unidad_medida_stock
     FROM inventario.item_inventario ii
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
     WHERE ii.item_inventario_id = $1`,
    [itemInventarioId]
  )
}

export const listarStockPorItemRepo = async (
  itemInventarioId,
  incluirAgotados = false,
  t = db
) => {
  return await t.any(
    `SELECT
       sia.almacen_id::int AS almacen_id,
       a.nombre AS almacen_nombre,
       sia.stock_actual::double precision AS stock_actual,
       sia.creado_en,
       sia.modificado_en
     FROM inventario.stock_item_almacen sia
     INNER JOIN inventario.almacen a
       ON sia.almacen_id = a.almacen_id
     WHERE sia.item_inventario_id = $1
       AND ($2::boolean OR sia.stock_actual > 0)
     ORDER BY a.nombre ASC, sia.almacen_id ASC`,
    [itemInventarioId, incluirAgotados]
  )
}

export const obtenerStockTotalItemRepo = async (itemInventarioId, t = db) => {
  return await t.one(
    `SELECT COALESCE(SUM(stock_actual), 0)::double precision AS stock_total
     FROM inventario.stock_item_almacen
     WHERE item_inventario_id = $1`,
    [itemInventarioId]
  )
}

export const obtenerAlmacenStockRepo = async (almacenId, t = db) => {
  return await t.oneOrNone(
    `SELECT
       almacen_id::int AS almacen_id,
       nombre AS almacen_nombre,
       tipo_almacen,
       ubicacion,
       activo
     FROM inventario.almacen
     WHERE almacen_id = $1`,
    [almacenId]
  )
}

export const listarItemsPorAlmacenRepo = async (
  almacenId,
  incluirAgotados = false,
  t = db
) => {
  return await t.any(
    `SELECT
       ii.item_inventario_id::int AS item_inventario_id,
       ii.codigo_item,
       ii.nombre_item,
       COALESCE(li.nombre, lc.nombre_lote, lco.codigo_lote, e.nombre_extracto) AS nombre_lote,
       COALESCE(ti.nombre, lc.tipo_lote, lco.tipo_lote, e.tipo_extracto) AS tipo,
       COALESCE(
         li.unidad_medida_cantidad,
         lc.unidad_medida_stock,
         lco.unidad_medida_stock,
         e.unidad_medida_stock
       ) AS unidad_medida_stock,
       sia.stock_actual::double precision AS stock_actual,
       COALESCE(stock_total.stock_total, 0)::double precision AS stock_total
     FROM inventario.stock_item_almacen sia
     INNER JOIN inventario.item_inventario ii
       ON sia.item_inventario_id = ii.item_inventario_id
     LEFT JOIN LATERAL (
       SELECT SUM(sia_total.stock_actual) AS stock_total
       FROM inventario.stock_item_almacen sia_total
       WHERE sia_total.item_inventario_id = ii.item_inventario_id
     ) stock_total ON TRUE
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
     WHERE sia.almacen_id = $1
       AND ($2::boolean OR sia.stock_actual > 0)
     ORDER BY ii.codigo_item ASC, ii.item_inventario_id ASC`,
    [almacenId, incluirAgotados]
  )
}
