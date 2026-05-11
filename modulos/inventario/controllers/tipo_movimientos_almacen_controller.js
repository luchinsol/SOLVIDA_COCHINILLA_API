import { listarTiposMovimientosAlmacenService } from '../services/tipo_movimientos_almacen_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

export const listarTiposMovimientosAlmacen = async (req, res) => {
  try {
    const data = await listarTiposMovimientosAlmacenService()
    res.json(data)
  } catch (error) {
    handleControllerError(res, error)
  }
}
