import { Router } from 'express'
import {
  crearExtracto,
  actualizarEstadoLoteExtracto,
  actualizarStockActualExtracto,
  listarExtractos
} from '../controllers/extracto_controllers.js'

const router = Router()

router.post('/', crearExtracto)
router.get('/', listarExtractos)
router.patch('/:id/estado-lote', actualizarEstadoLoteExtracto)
router.patch('/:id/stock-actual', actualizarStockActualExtracto)

export default router
