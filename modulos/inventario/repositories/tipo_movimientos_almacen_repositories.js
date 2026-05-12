import db from '../../../config/database.js'

export const listarTiposMovimientosAlmacenRepo = async () => {
  return await db.any(
    `SELECT
       tipo_mov_id::int AS tipo_mov_id,
       nombre,
       descripcion,
       CASE
         WHEN delta IS NULL THEN NULL
         ELSE delta::int
       END AS delta
     FROM inventario.tipos_movimientos_almacen
     ORDER BY tipo_mov_id ASC`
  )
}
