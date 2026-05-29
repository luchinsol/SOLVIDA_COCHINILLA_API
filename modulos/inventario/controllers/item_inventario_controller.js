import {
  crearItemInventarioService,
  listarItemsInventarioService,
  listarMuestrasPendientesLaboratorioService,
  listarNombresItemService,
  listarTiposPorNombreItemService
} from '../services/item_inventario_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeItemInventarioError = (error) => {
  if (
    error.message === 'nombre_item es obligatorio' ||
    error.message === 'codigo_item es obligatorio' ||
    error.message === 'nombre_item no es válido'
  ) {
    error.name = 'ValidationError'
  }

  if (error.message === 'orden no es válido') {
    error.name = 'ValidationError'
  }

  if (error.message === 'estado_lote_id debe ser un entero positivo') {
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

export const listarItemsInventario = async (req, res) => {
  try {
    const {
      nombre_item,
      proveedor_nombre,
      tipo,
      almacen_nombre,
      codigo
    } = req.query

    const data = await listarItemsInventarioService({
      nombre_item,
      proveedor_nombre,
      tipo,
      almacen_nombre,
      codigo
    })
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeItemInventarioError(error))
  }
}

export const listarMuestrasPendientesLaboratorio = async (req, res) => {
  try {
    const { estado_lote_id, producto, orden } = req.query
    const data = await listarMuestrasPendientesLaboratorioService({
      estado_lote_id,
      producto,
      orden
    })
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeItemInventarioError(error))
  }
}

export const listarNombresItem = async (req, res) => {
  try {
    const data = await listarNombresItemService()
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeItemInventarioError(error))
  }
}

export const listarTiposPorNombreItem = async (req, res) => {
  try {
    const { nombre_item } = req.query
    const data = await listarTiposPorNombreItemService(nombre_item)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeItemInventarioError(error))
  }
}
