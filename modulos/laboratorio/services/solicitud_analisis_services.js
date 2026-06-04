import { obtenerSolicitudAnalisisPendientePorItemInventarioRepo } from '../repositories/solicitud_analisis_repositories.js'

export const obtenerSolicitudAnalisisPendientePorItemInventarioService = async (item_inventario_id) => {
  const itemInventarioId = Number(item_inventario_id)

  if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
    throw new Error('item_inventario_id debe ser un entero positivo')
  }

  const solicitud = await obtenerSolicitudAnalisisPendientePorItemInventarioRepo(itemInventarioId)

  if (!solicitud) {
    throw new Error('solicitud de analisis no encontrada')
  }

  return solicitud
}
