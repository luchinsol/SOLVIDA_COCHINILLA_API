import { listarMotivosMovimientoService } from '../services/motivo_movimiento_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeMotivoMovimientoError = (error) => {
  if (
    error.message === 'tipo_mov_id es obligatorio' ||
    error.message === 'tipo_mov_id debe ser un entero positivo'
  ) {
    error.name = 'ValidationError'
  }

  return error
}

export const listarMotivosMovimiento = async (req, res) => {
  try {
    const { tipo_mov_id } = req.query
    const data = await listarMotivosMovimientoService(tipo_mov_id)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeMotivoMovimientoError(error))
  }
}
