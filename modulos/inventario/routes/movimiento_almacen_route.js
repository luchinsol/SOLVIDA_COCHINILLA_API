import express from 'express'
import {
  getMovimientosAlmacenController,
  createMovimientoAlmacenController,
  createAjusteMovimientoAlmacenController,
  createTrasladoMovimientoAlmacenController,
  updateMovimientoAlmacenController,
  deleteMovimientoAlmacenController
} from '../controllers/movimiento_almacen_controllers.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const movimientoAlmacenRoutes = express.Router()
const PERMISOS_MOVIMIENTO_ALMACEN = {
  ver: 'movimiento_almacen.ver',
  crear: 'movimiento_almacen.crear'
}

movimientoAlmacenRoutes.get('/', requirePermission(PERMISOS_MOVIMIENTO_ALMACEN.ver), getMovimientosAlmacenController)
movimientoAlmacenRoutes.post(
  '/entradas-salidas',
  requirePermission(PERMISOS_MOVIMIENTO_ALMACEN.crear),
  createMovimientoAlmacenController
)
movimientoAlmacenRoutes.post(
  '/ajuste',
  requirePermission(PERMISOS_MOVIMIENTO_ALMACEN.crear),
  createAjusteMovimientoAlmacenController
)
movimientoAlmacenRoutes.post(
  '/traslado',
  requirePermission(PERMISOS_MOVIMIENTO_ALMACEN.crear),
  createTrasladoMovimientoAlmacenController
)
movimientoAlmacenRoutes.put('/:id', updateMovimientoAlmacenController)
movimientoAlmacenRoutes.delete('/:id', deleteMovimientoAlmacenController)

export default movimientoAlmacenRoutes
