import { listarMotivosMovimientoRepo } from '../repositories/motivo_movimiento_repositories.js'

export const listarMotivosMovimientoService = async (tipoMovId) => {
  if (tipoMovId === undefined || tipoMovId === null || tipoMovId === '') {
    throw new Error('tipo_mov_id es obligatorio')
  }

  const parsedTipoMovId = Number(tipoMovId)

  if (!Number.isInteger(parsedTipoMovId) || parsedTipoMovId <= 0) {
    throw new Error('tipo_mov_id debe ser un entero positivo')
  }

  return await listarMotivosMovimientoRepo(parsedTipoMovId)
}
