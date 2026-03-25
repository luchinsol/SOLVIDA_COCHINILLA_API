import express from 'express'
import { getMovimientosAlmacenController,createMovimientoAlmacenController,updateMovimientoAlmacenController,deleteMovimientoAlmacenController} from '../controllers/movimiento_almacen_controllers.js';

const movimientoAlmacenRoutes = express.Router()

movimientoAlmacenRoutes.get('/', getMovimientosAlmacenController)
movimientoAlmacenRoutes.post('/', createMovimientoAlmacenController)
movimientoAlmacenRoutes.put('/:id', updateMovimientoAlmacenController)
movimientoAlmacenRoutes.delete('/:id', deleteMovimientoAlmacenController)

export default movimientoAlmacenRoutes