import { Router } from 'express'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

import {
  crearLoteCochinillaPorCompra,
  crearLoteCochinillaPorMezcla,
  listarLotesCochinilla,
  listarLotesCochinillaDisponibles,
  obtenerResumenLotesCochinilla,
  obtenerLoteCochinillaPorId,
  actualizarAnalisisLoteCochinilla,
  actualizarEstadoLoteCochinilla,
  actualizarStockActualLoteCochinilla,
  actualizarConsumoLoteCochinilla,
  actualizarMasaLoteCochinillaPorDelta,
  eliminarLoteCochinilla
} from '../controllers/lote_cochinilla_controllers.js'

const router = Router()
const PERMISOS_LOTE_COCHINILLA = {
  verValorado: 'lote_cochinilla.ver.valorado'
}

/* ======================================================
   CREATE
====================================================== */
router.post('/compra', crearLoteCochinillaPorCompra)
router.post('/mezcla', crearLoteCochinillaPorMezcla)

/* ======================================================
   READ
====================================================== */
router.get('/', listarLotesCochinilla)
router.get('/disponibles', listarLotesCochinillaDisponibles)
router.get('/resumen', requirePermission(PERMISOS_LOTE_COCHINILLA.verValorado), obtenerResumenLotesCochinilla)
router.get('/:id', obtenerLoteCochinillaPorId)

/* ======================================================
   UPDATE
====================================================== */
// 🔵 análisis (laboratorio)
router.put('/:id/analisis', actualizarAnalisisLoteCochinilla)
router.patch('/:id/estado-lote', actualizarEstadoLoteCochinilla)
router.patch('/:id/stock-actual', actualizarStockActualLoteCochinilla)

// 🟢 consumo (producción)
router.put('/:id/consumo', actualizarConsumoLoteCochinilla)

// 🟡 masa (producción), ya lo hace automaticamente en lote composicion
router.put('/:id/masa-delta', actualizarMasaLoteCochinillaPorDelta)


/* ======================================================
   DELETE
====================================================== */
router.delete('/:id', eliminarLoteCochinilla)

export default router
