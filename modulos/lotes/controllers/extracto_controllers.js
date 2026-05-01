import { listarExtractosService } from '../services/extracto_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeExtractoError = (error) => {
  if (
    error.message === 'almacen_id debe ser un entero positivo' ||
    error.message === 'proceso_filtrado_id debe ser un entero positivo'
  ) {
    error.name = 'ValidationError'
  }

  return error
}

export const listarExtractos = async (req, res) => {
  try {
    const {
      tipo_extracto,
      estado_lote,
      almacen_id,
      proceso_filtrado_id
    } = req.query

    const data = await listarExtractosService({
      tipo_extracto,
      estado_lote,
      almacen_id,
      proceso_filtrado_id
    })

    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeExtractoError(error))
  }
}
