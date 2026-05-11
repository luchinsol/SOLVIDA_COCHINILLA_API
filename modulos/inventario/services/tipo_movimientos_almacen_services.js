import { listarTiposMovimientosAlmacenRepo } from '../repositories/tipo_movimientos_almacen_repositories.js'

export const listarTiposMovimientosAlmacenService = async () => {
  return await listarTiposMovimientosAlmacenRepo()
}
