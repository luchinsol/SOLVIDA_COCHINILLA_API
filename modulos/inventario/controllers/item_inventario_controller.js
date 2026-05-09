import { crearItemInventarioService } from '../services/item_inventario_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeItemInventarioError = (error) => {
  if (
    error.message === 'nombre_item es obligatorio' ||
    error.message === 'codigo_item es obligatorio' ||
    error.message === 'nombre_item no es válido'
  ) {
    error.name = 'ValidationError'
  }

  return error
}

export const crearItemInventario = async (req, res) => {
  try {
    const data = await crearItemInventarioService(req.body)
    res.status(201).json(data)
  } catch (error) {
    handleControllerError(res, normalizeItemInventarioError(error))
  }
}
