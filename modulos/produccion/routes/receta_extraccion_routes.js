import { Router } from 'express'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

import {
  actualizarVigenciaRecetaExtraccion,
  crearRecetaExtraccion,
  listarRecetasExtraccion,
  obtenerRecetaExtraccionPorId
} from '../controllers/receta_extraccion_controller.js'

const router = Router()
const PERMISOS_RECETA_EXTRACCION = {
  ver: 'receta_extraccion.ver',
  crear: 'receta_extraccion.crear',
  editar: 'receta_extraccion.editar'
}

/* ======================================================
   CREATE
====================================================== */
router.post('/', requirePermission(PERMISOS_RECETA_EXTRACCION.crear), crearRecetaExtraccion)
router.get('/', requirePermission(PERMISOS_RECETA_EXTRACCION.ver), listarRecetasExtraccion)
router.patch('/:id/vigente', requirePermission(PERMISOS_RECETA_EXTRACCION.editar), actualizarVigenciaRecetaExtraccion)
router.get('/:id', requirePermission(PERMISOS_RECETA_EXTRACCION.ver), obtenerRecetaExtraccionPorId)

export default router
