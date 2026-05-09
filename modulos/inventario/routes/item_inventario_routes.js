import { Router } from 'express'
import { crearItemInventario } from '../controllers/item_inventario_controller.js'

const router = Router()

router.post('/', crearItemInventario)

export default router
