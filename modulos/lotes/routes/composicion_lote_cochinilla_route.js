import { Router } from 'express'

import {
  generarPDFComposicionController,
  generarExcelComposicion,
  listarComposicionesLoteCochinilla,
  obtenerComposicionLoteCochinillaPorId,
  obtenerComposicionesPorLoteResultante,
  obtenerComposicionesPorLoteComponente,
  crearComposicionLoteCochinilla,
  actualizarComposicionLoteCochinilla,
  actualizarPorcentajesPorLoteResultante,
  eliminarComposicionLoteCochinilla
} from '../controllers/composicion_lote_cochinilla_controllers.js'

const router = Router()

router.get('/pdf', generarPDFComposicionController)
router.get('/excel', generarExcelComposicion)

router.get('/', listarComposicionesLoteCochinilla)
router.get('/resultante/:loteResultanteId', obtenerComposicionesPorLoteResultante)
router.get('/componente/:loteComponenteId', obtenerComposicionesPorLoteComponente)
router.get('/:id', obtenerComposicionLoteCochinillaPorId)

router.post('/', crearComposicionLoteCochinilla)

router.put('/:id', actualizarComposicionLoteCochinilla)
router.put('/resultante/:loteResultanteId/recalcular-porcentajes', actualizarPorcentajesPorLoteResultante)

router.delete('/:id', eliminarComposicionLoteCochinilla)

export default router