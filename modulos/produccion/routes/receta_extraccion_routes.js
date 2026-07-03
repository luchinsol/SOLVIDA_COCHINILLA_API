import { Router } from 'express'

import {
  crearRecetaExtraccion,
  obtenerRecetaExtraccionPorId
} from '../controllers/receta_extraccion_controller.js'

const router = Router()

/* ======================================================
   CREATE
====================================================== */
router.post('/', crearRecetaExtraccion)
router.get('/:id', obtenerRecetaExtraccionPorId)

export default router
