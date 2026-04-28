import { Router } from 'express'

import {
  crearLoteCochinillaPorCompra,
  crearLoteCochinillaPorMezcla,
  listarLotesCochinilla,
  obtenerLoteCochinillaPorId,
  actualizarAnalisisLoteCochinilla,
  actualizarEstadoLoteCochinilla,
  actualizarConsumoLoteCochinilla,
  actualizarMasaLoteCochinillaPorDelta,
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
router.patch('/:id/estado-lote', actualizarEstadoLoteCochinilla)

// 🟢 consumo (producción)
router.put('/:id/consumo', actualizarConsumoLoteCochinilla)

// 🟡 masa (producción), ya lo hace automaticamente en lote composicion
router.put('/:id/masa-delta', actualizarMasaLoteCochinillaPorDelta)


/* ======================================================
   DELETE
====================================================== */
router.delete('/:id', eliminarLoteCochinilla)

export default router
