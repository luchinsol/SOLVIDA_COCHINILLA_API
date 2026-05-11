import { Router } from 'express'
import {
  crearItemInventario,
  listarItemsInventario,
  listarNombresItem,
  listarTiposPorNombreItem
} from '../controllers/item_inventario_controller.js'

const router = Router()

router.get('/', listarItemsInventario)
router.get('/nombres', listarNombresItem)
router.get('/tipos', listarTiposPorNombreItem)
router.post('/', crearItemInventario)

export default router
