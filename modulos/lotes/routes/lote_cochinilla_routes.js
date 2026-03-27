import { Router } from 'express'

import {
  crearLoteCochinillaPorCompra,
  crearLoteCochinillaPorMezcla,
  listarLotesCochinilla,
  obtenerLoteCochinillaPorId,
  actualizarAnalisisLoteCochinilla,
  actualizarConsumoLoteCochinilla,
  eliminarLoteCochinilla
} from '../controllers/lote_cochinilla_controllers.js'

const router = Router()

/* ======================================================
   CREATE
====================================================== */
router.post('/compra', crearLoteCochinillaPorCompra)
router.post('/mezcla', crearLoteCochinillaPorMezcla)

/* ======================================================
   READ
====================================================== */
router.get('/', listarLotesCochinilla)
router.get('/:id', obtenerLoteCochinillaPorId)

/* ======================================================
   UPDATE
====================================================== */
// 🔵 análisis (laboratorio)
router.put('/:id/analisis', actualizarAnalisisLoteCochinilla)

// 🟢 consumo (producción)
router.put('/:id/consumo', actualizarConsumoLoteCochinilla)

/* ======================================================
   DELETE
====================================================== */
router.delete('/:id', eliminarLoteCochinilla)

export default router