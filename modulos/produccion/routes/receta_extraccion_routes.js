import { Router } from 'express'

import {
  crearRecetaExtraccion,
  listarRecetasExtraccion,
  obtenerRecetaExtraccionPorId
} from '../controllers/receta_extraccion_controller.js'

const router = Router()

/* ======================================================
   CREATE
====================================================== */
router.post('/', crearRecetaExtraccion)
router.get('/', listarRecetasExtraccion)
router.get('/:id', obtenerRecetaExtraccionPorId)

export default router
