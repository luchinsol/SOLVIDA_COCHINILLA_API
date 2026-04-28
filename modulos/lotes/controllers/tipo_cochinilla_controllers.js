import { listarTiposCochinillaService } from '../services/tipo_cochinilla_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeTipoCochinillaError = (error) => {
  if (error.message === 'activo debe ser true o false') {
    error.name = 'ValidationError'
  }

  return error
}

export const listarTiposCochinilla = async (req, res) => {
  try {
    const { activo } = req.query
    const data = await listarTiposCochinillaService(activo)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeTipoCochinillaError(error))
  }
}
