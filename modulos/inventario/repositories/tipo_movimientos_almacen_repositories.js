import db from '../../../config/database.js'

export const listarTiposMovimientosAlmacenRepo = async () => {
  return await db.any(
    `SELECT *
     FROM inventario.tipos_movimientos_almacen
     ORDER BY tipo_mov_id ASC`
  )
}
