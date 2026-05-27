import { Router } from 'express'
import { requirePermission } from '../../../middlewares/authmiddleware.js'
import {
  crearExtracto,
  actualizarEstadoLoteExtracto,
  actualizarStockActualExtracto,
  listarExtractos,
  obtenerResumenExtractos
} from '../controllers/extracto_controllers.js'

const router = Router()
const PERMISOS_EXTRACTO = {
  verValorado: 'extracto.ver.valorado'
}

router.post('/', crearExtracto)
router.get('/', listarExtractos)
router.get('/resumen', requirePermission(PERMISOS_EXTRACTO.verValorado), obtenerResumenExtractos)
router.patch('/:id/estado-lote', actualizarEstadoLoteExtracto)
router.patch('/:id/stock-actual', actualizarStockActualExtracto)

export default router
