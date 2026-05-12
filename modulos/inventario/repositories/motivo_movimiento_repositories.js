import db from '../../../config/database.js'

export const listarMotivosMovimientoRepo = async (tipoMovId) => {
  return await db.any(
    `SELECT
       motivo_movimiento_id::int AS motivo_movimiento_id,
       tipo_mov_id::int AS tipo_mov_id,
       nombre
     FROM inventario.motivo_movimiento
     WHERE tipo_mov_id = $1
     ORDER BY motivo_movimiento_id ASC`,
    [tipoMovId]
  )
}
