import express from 'express'
import {
  getMovimientosAlmacenController,
  createMovimientoAlmacenController,
  createAjusteMovimientoAlmacenController,
  createTrasladoMovimientoAlmacenController,
  updateMovimientoAlmacenController,
  deleteMovimientoAlmacenController
} from '../controllers/movimiento_almacen_controllers.js'

const movimientoAlmacenRoutes = express.Router()

movimientoAlmacenRoutes.get('/', getMovimientosAlmacenController)
movimientoAlmacenRoutes.post('/entradas-salidas', createMovimientoAlmacenController)
movimientoAlmacenRoutes.post('/ajuste', createAjusteMovimientoAlmacenController)
movimientoAlmacenRoutes.post('/traslado', createTrasladoMovimientoAlmacenController)
movimientoAlmacenRoutes.put('/:id', updateMovimientoAlmacenController)
movimientoAlmacenRoutes.delete('/:id', deleteMovimientoAlmacenController)

export default movimientoAlmacenRoutes
