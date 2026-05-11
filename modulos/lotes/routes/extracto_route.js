import { Router } from 'express'
import {
  crearExtracto,
  actualizarEstadoLoteExtracto,
  actualizarStockActualExtracto,
  listarExtractos,
  obtenerResumenExtractos
} from '../controllers/extracto_controllers.js'

const router = Router()

router.post('/', crearExtracto)
router.get('/', listarExtractos)
router.get('/resumen', obtenerResumenExtractos)
router.patch('/:id/estado-lote', actualizarEstadoLoteExtracto)
router.patch('/:id/stock-actual', actualizarStockActualExtracto)

export default router
