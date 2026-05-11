import db from '../../../config/database.js'

export const listarMotivosMovimientoRepo = async (tipoMovId) => {
  return await db.any(
    `SELECT *
     FROM inventario.motivo_movimiento
     WHERE tipo_mov_id = $1
     ORDER BY motivo_movimiento_id ASC`,
    [tipoMovId]
  )
}
