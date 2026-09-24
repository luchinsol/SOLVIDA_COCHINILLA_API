import { Router } from 'express'
import {
  obtenerResumenStockController,
  obtenerStockPorAlmacenController,
  obtenerStockPorItemController
} from '../controllers/stock_item_almacen_controllers.js'

const router = Router()

router.get('/resumen', obtenerResumenStockController)
router.get('/item/:itemId', obtenerStockPorItemController)
router.get('/almacen/:almacenId', obtenerStockPorAlmacenController)

export default router
