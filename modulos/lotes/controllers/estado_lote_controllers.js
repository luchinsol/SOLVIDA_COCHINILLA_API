import { listarEstadosLoteService } from '../services/estado_lote_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeEstadoLoteError = (error) => {
  if (error.message === 'contexto no es válido') {
    error.name = 'ValidationError'
  }

  return error
}

export const listarEstadosLote = async (req, res) => {
  try {
    const { contexto } = req.query
    const data = await listarEstadosLoteService({ contexto })
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeEstadoLoteError(error))
  }
}
