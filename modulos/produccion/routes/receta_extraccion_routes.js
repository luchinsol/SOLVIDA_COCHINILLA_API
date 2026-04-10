import { Router } from 'express'

import {
  crearRecetaExtraccion,
  listarRecetasExtraccion,
  obtenerRecetaExtraccionPorId,
  listarRecetasExtraccionVigentes,
  listarRecetasExtraccionNoVigentes,
  obtenerRecetasPorTipoCochinilla,
  obtenerRecetasPorTipoCarmin,
  actualizarVigenciaRecetaExtraccion,
  actualizarObservacionesOperariosRecetaExtraccion,
  actualizarComentariosConclusionesRecetaExtraccion,
  eliminarRecetaExtraccion
} from '../controllers/receta_extraccion_controller.js'

const router = Router()

/* ======================================================
   CREATE
====================================================== */
router.post('/', crearRecetaExtraccion)

/* ======================================================
   READ
====================================================== */
router.get('/', listarRecetasExtraccion)

router.get('/vigentes', listarRecetasExtraccionVigentes)

router.get('/no-vigentes', listarRecetasExtraccionNoVigentes)

router.get('/tipo-cochinilla/:tipoCochinillaId', obtenerRecetasPorTipoCochinilla)

router.get('/tipo-carmin/:tipoCarminId', obtenerRecetasPorTipoCarmin)

router.get('/:id', obtenerRecetaExtraccionPorId)

/* ======================================================
   UPDATE
====================================================== */
router.patch('/:id/vigencia', actualizarVigenciaRecetaExtraccion)

router.patch('/:id/observaciones-operarios', actualizarObservacionesOperariosRecetaExtraccion)

router.patch('/:id/comentarios', actualizarComentariosConclusionesRecetaExtraccion)

/* ======================================================
   DELETE
====================================================== */
router.delete('/:id', eliminarRecetaExtraccion)

export default router