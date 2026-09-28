import express from 'express'
import { requireAnyPermission, requirePermission } from '../../../middlewares/authmiddleware.js'
import {
  actualizarClienteController,
  actualizarEstadoClienteController,
  crearClienteController,
  listarClientesController,
  obtenerClientePorIdController
} from '../controllers/cliente_controllers.js'

const clienteRouter = express.Router()
const PERMISOS_CLIENTE = {
  ver: 'cliente_laboratorio.ver',
  crear: 'cliente_laboratorio.crear',
  editar: 'cliente_laboratorio.editar'
}

clienteRouter.get(
  '/',
  requireAnyPermission([PERMISOS_CLIENTE.ver, 'analisis.ver']),
  listarClientesController
)
clienteRouter.get(
  '/:id',
  requireAnyPermission([PERMISOS_CLIENTE.ver, 'analisis.ver']),
  obtenerClientePorIdController
)
clienteRouter.post(
  '/',
  requireAnyPermission([PERMISOS_CLIENTE.crear, 'analisis.crear']),
  crearClienteController
)
clienteRouter.put('/:id', requirePermission(PERMISOS_CLIENTE.editar), actualizarClienteController)
clienteRouter.patch('/:id/activo', requirePermission(PERMISOS_CLIENTE.editar), actualizarEstadoClienteController)

export default clienteRouter
