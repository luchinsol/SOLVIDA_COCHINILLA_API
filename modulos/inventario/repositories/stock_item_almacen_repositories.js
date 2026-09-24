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

export const obtenerResumenStockRepo = async (
  categoria,
  almacenId = null,
  tipoInsumoId = null,
  tipoLote = null,
  t = db
) => {
  return await t.one(
    `WITH posiciones_valoradas AS (
       SELECT
         'insumos'::text AS categoria,
         sia.almacen_id,
         li.tipo_insumo_id,
         NULL::text AS tipo_lote,
         sia.stock_actual,
         COALESCE(li.costo_unitario, 0) AS costo_unitario,
         li.unidad_medida_cantidad AS unidad_stock,
         li.unidad_medida_moneda AS unidad_moneda
       FROM inventario.stock_item_almacen sia
       INNER JOIN inventario.lote_insumo li
         ON sia.item_inventario_id = li.item_inventario_id

       UNION ALL

       SELECT
         'cochinilla',
         sia.almacen_id,
         NULL::bigint,
         lc.tipo_lote,
         sia.stock_actual,
         COALESCE(lc.costo_unitario, 0),
         lc.unidad_medida_stock,
         lc.unidad_medida_dinero
       FROM inventario.stock_item_almacen sia
       INNER JOIN lotes.lote_cochinilla lc
         ON sia.item_inventario_id = lc.item_inventario_id

       UNION ALL

       SELECT
         'carmin',
         sia.almacen_id,
         NULL::bigint,
         NULL::text,
         sia.stock_actual,
         COALESCE(lc.costo_unitario, 0),
         lc.unidad_medida_stock,
         'USD'::text
       FROM inventario.stock_item_almacen sia
       INNER JOIN lotes.lote_carmin lc
         ON sia.item_inventario_id = lc.item_inventario_id

       UNION ALL

       SELECT
         'extracto',
         sia.almacen_id,
         NULL::bigint,
         NULL::text,
         sia.stock_actual,
         COALESCE(e.costo_unitario, 0),
         e.unidad_medida_stock,
         e.unidad_medida_dinero
       FROM inventario.stock_item_almacen sia
       INNER JOIN lotes.extracto e
         ON sia.item_inventario_id = e.item_inventario_id
     ),
     resumen AS (
       SELECT
         COUNT(DISTINCT unidad_stock) FILTER (WHERE unidad_stock IS NOT NULL) AS unidades_stock,
         COUNT(DISTINCT unidad_moneda) FILTER (WHERE unidad_moneda IS NOT NULL) AS unidades_moneda,
         COALESCE(SUM(stock_actual), 0) AS stock_actual,
         COALESCE(SUM(stock_actual * costo_unitario), 0) AS costo_total,
         MAX(unidad_stock) AS unidad_stock,
         MAX(unidad_moneda) AS unidad_moneda
       FROM posiciones_valoradas
       WHERE categoria = $1
         AND ($2::bigint IS NULL OR almacen_id = $2)
         AND ($3::bigint IS NULL OR tipo_insumo_id = $3)
         AND ($4::text IS NULL OR LOWER(tipo_lote) = LOWER($4))
         AND stock_actual > 0
     )
     SELECT
       stock_actual::double precision AS stock_actual,
       costo_total::double precision AS costo_total,
       CASE
         WHEN stock_actual > 0
           THEN (costo_total / stock_actual)::double precision
         ELSE NULL
       END AS costo_unitario,
       CASE WHEN unidades_stock <= 1 THEN unidad_stock ELSE 'Varias unidades' END AS unidad_medida_cantidad,
       CASE WHEN unidades_moneda <= 1 THEN unidad_moneda ELSE 'Varias monedas' END AS unidad_medida_moneda
     FROM resumen`,
    [categoria, almacenId, tipoInsumoId, tipoLote]
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

export const asegurarPosicionStockRepo = async (
  itemInventarioId,
  almacenId,
  t = db
) => {
  await t.none(
    `INSERT INTO inventario.stock_item_almacen
       (item_inventario_id, almacen_id, stock_actual, creado_en, modificado_en)
     VALUES ($1, $2, 0, NOW(), NOW())
     ON CONFLICT (item_inventario_id, almacen_id) DO NOTHING`,
    [itemInventarioId, almacenId]
  )
}

export const bloquearPosicionesStockItemRepo = async (itemInventarioId, t = db) => {
  return await t.any(
    `SELECT
       item_inventario_id::int AS item_inventario_id,
       almacen_id::int AS almacen_id,
       stock_actual::double precision AS stock_actual
     FROM inventario.stock_item_almacen
     WHERE item_inventario_id = $1
     ORDER BY almacen_id ASC
     FOR UPDATE`,
    [itemInventarioId]
  )
}

export const actualizarStockPosicionRepo = async (
  itemInventarioId,
  almacenId,
  stockActual,
  t = db
) => {
  return await t.one(
    `UPDATE inventario.stock_item_almacen
     SET
       stock_actual = $3,
       modificado_en = NOW()
     WHERE item_inventario_id = $1
       AND almacen_id = $2
     RETURNING
       item_inventario_id::int AS item_inventario_id,
       almacen_id::int AS almacen_id,
       stock_actual::double precision AS stock_actual,
       modificado_en`,
    [itemInventarioId, almacenId, stockActual]
  )
}

export const sincronizarStockTotalLoteRepo = async (itemInventarioId, t = db) => {
  return await t.one(
    `WITH total AS (
       SELECT COALESCE(SUM(stock_actual), 0) AS stock_total
       FROM inventario.stock_item_almacen
       WHERE item_inventario_id = $1
     ),
     insumo AS (
       UPDATE inventario.lote_insumo li
       SET
         stock_actual = total.stock_total,
         costo_total_actual = total.stock_total * COALESCE(li.costo_unitario, 0),
         modificado_en = NOW()
       FROM total
       WHERE li.item_inventario_id = $1
       RETURNING li.lote_insumo_id
     ),
     cochinilla AS (
       UPDATE lotes.lote_cochinilla lc
       SET
         stock_actual = total.stock_total,
         costo_total_actual = total.stock_total * COALESCE(lc.costo_unitario, 0),
         costo_puntoac_dolares = CASE
           WHEN total.stock_total > 0 AND COALESCE(lc.concentracion_ac_actual, 0) > 0
             THEN COALESCE(lc.costo_unitario, 0) / lc.concentracion_ac_actual
           ELSE NULL
         END,
         modificado_en = NOW()
       FROM total
       WHERE lc.item_inventario_id = $1
       RETURNING lc.lote_cochinilla_id
     ),
     carmin AS (
       UPDATE lotes.lote_carmin lc
       SET
         stock_actual = total.stock_total,
         costo_total_actual = total.stock_total * COALESCE(lc.costo_unitario, 0),
         modificado_en = NOW()
       FROM total
       WHERE lc.item_inventario_id = $1
       RETURNING lc.lote_carmin_id
     ),
     extracto AS (
       UPDATE lotes.extracto e
       SET
         stock_actual = total.stock_total,
         costo_total_actual = total.stock_total * COALESCE(e.costo_unitario, 0),
         modificado_en = NOW()
       FROM total
       WHERE e.item_inventario_id = $1
       RETURNING e.extracto_id
     )
     SELECT stock_total::double precision AS stock_total
     FROM total`,
    [itemInventarioId]
  )
}
