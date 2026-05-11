import { Router } from 'express'
import { listarTiposMovimientosAlmacen } from '../controllers/tipo_movimientos_almacen_controller.js'

const router = Router()

router.get('/', listarTiposMovimientosAlmacen)

export default router
