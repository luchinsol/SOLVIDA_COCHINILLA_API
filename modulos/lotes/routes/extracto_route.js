import { Router } from 'express'
import {
  actualizarEstadoLoteExtracto,
  actualizarStockActualExtracto,
  listarExtractos
} from '../controllers/extracto_controllers.js'

const router = Router()

router.get('/', listarExtractos)
router.patch('/:id/estado-lote', actualizarEstadoLoteExtracto)
router.patch('/:id/stock-actual', actualizarStockActualExtracto)

export default router
