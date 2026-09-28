import {
  actualizarClienteService,
  actualizarEstadoClienteService,
  crearClienteService,
  listarClientesService,
  obtenerClientePorIdService
} from '../services/cliente_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const ERRORES_VALIDACION = new Set([
  'cliente_id debe ser un entero positivo',
  'nombre_razon_social es obligatorio',
  'telefono1 es obligatorio',
  'ruc debe tener exactamente 11 digitos',
  'dni debe tener exactamente 8 digitos',
  'correo debe tener un formato valido',
  'activo debe ser true o false',
  'activo debe ser booleano'
])

const normalizarErrorCliente = (error) => {
  if (error.message === 'Cliente no encontrado') {
    error.name = 'NotFoundError'
  } else if (ERRORES_VALIDACION.has(error.message) || error.code === '23514' || error.code === '23502') {
    error.name = 'ValidationError'
  } else if (error.code === '23505') {
    error.name = 'ConflictError'
    error.message = error.constraint === 'cliente_ruc_unique'
      ? 'Ya existe un cliente con ese RUC'
      : 'Ya existe un cliente con ese DNI'
  }

  return error
}

export const listarClientesController = async (req, res) => {
  try {
    res.json(await listarClientesService(req.query))
  } catch (error) {
    handleControllerError(res, normalizarErrorCliente(error))
  }
}

export const obtenerClientePorIdController = async (req, res) => {
  try {
    res.json(await obtenerClientePorIdService(req.params.id))
  } catch (error) {
    handleControllerError(res, normalizarErrorCliente(error))
  }
}

export const crearClienteController = async (req, res) => {
  try {
    res.status(201).json(await crearClienteService(req.body))
  } catch (error) {
    handleControllerError(res, normalizarErrorCliente(error))
  }
}

export const actualizarClienteController = async (req, res) => {
  try {
    res.json(await actualizarClienteService(req.params.id, req.body))
  } catch (error) {
    handleControllerError(res, normalizarErrorCliente(error))
  }
}

export const actualizarEstadoClienteController = async (req, res) => {
  try {
    res.json(await actualizarEstadoClienteService(req.params.id, req.body.activo))
  } catch (error) {
    handleControllerError(res, normalizarErrorCliente(error))
  }
}
