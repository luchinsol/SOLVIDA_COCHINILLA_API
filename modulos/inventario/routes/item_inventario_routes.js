import { Router } from 'express'
import { requirePermission } from '../../../middlewares/authmiddleware.js'
import {
  contarMuestrasEnAnalisis,
  contarMuestrasPendientesLaboratorio,
  crearItemInventario,
  listarItemsInventario,
  listarMuestrasPendientesLaboratorio,
  listarNombresItem,
  listarTiposPorNombreItem
} from '../controllers/item_inventario_controller.js'

const router = Router()
const PERMISOS_LABORATORIO = {
  ver: 'analisis.ver'
}

router.get('/', listarItemsInventario)
router.get(
  '/muestras-en-analisis/resumen',
  requirePermission(PERMISOS_LABORATORIO.ver),
  contarMuestrasEnAnalisis
)
router.get(
  '/muestras-pendientes-laboratorio/resumen',
  requirePermission(PERMISOS_LABORATORIO.ver),
  contarMuestrasPendientesLaboratorio
)
router.get(
  '/muestras-pendientes-laboratorio',
  requirePermission(PERMISOS_LABORATORIO.ver),
  listarMuestrasPendientesLaboratorio
)
router.get('/nombres', listarNombresItem)
router.get('/tipos', listarTiposPorNombreItem)
router.post('/', crearItemInventario)

export default router
