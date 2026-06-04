import express from 'express'
import { requirePermission } from '../../../middlewares/authmiddleware.js'
import { obtenerSolicitudAnalisisPendientePorItemInventarioController } from '../controllers/solicitud_analisis_controllers.js'

const solicitudAnalisisRouter = express.Router()
const PERMISOS_ANALISIS = {
  ver: 'analisis.ver'
}

solicitudAnalisisRouter.get(
  '/item/:item_inventario_id/pendiente',
  requirePermission(PERMISOS_ANALISIS.ver),
  obtenerSolicitudAnalisisPendientePorItemInventarioController
)

export default solicitudAnalisisRouter
