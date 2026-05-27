import express from 'express'
import { requirePermission } from '../../../middlewares/authmiddleware.js'
import {
  crearLoteDesdeLaqueo,
  crearLoteDesdeMolienda,
  crearLoteDesdeMezclado,
  actualizarResultadosAnalisis,
  actualizarObservaciones,
  actualizarEstadoLoteCarmin,
  actualizarStockActualLoteCarmin,
  bloquearLote,
  listarLotes,
  obtenerResumenLotesCarmin,
  obtenerLotePorId,
  buscarLotesConFiltros,
  listarLotesSinAnalisis,
  obtenerPorProcesoLaqueo,
  obtenerPorProcesoMolienda,
  obtenerPorProcesoMezclado
} from '../controllers/lote_carmin_controllers.js'

const loteCarminRoutes = express.Router()
const PERMISOS_LOTE_CARMIN = {
  verValorado: 'lote_carmin.ver.valorado'
}

/* ======================================================
   READ
====================================================== */

// listar todos los lotes de carmín OK
loteCarminRoutes.get('/', listarLotes)

// búsqueda por filtros OK
loteCarminRoutes.get('/resumen', requirePermission(PERMISOS_LOTE_CARMIN.verValorado), obtenerResumenLotesCarmin)
loteCarminRoutes.get('/buscar', buscarLotesConFiltros)

// listar lotes sin análisis OK 
loteCarminRoutes.get('/sin-analisis', listarLotesSinAnalisis)

// obtener por proceso origen
loteCarminRoutes.get('/proceso-laqueo/:id', obtenerPorProcesoLaqueo)
loteCarminRoutes.get('/proceso-molienda/:id', obtenerPorProcesoMolienda)
loteCarminRoutes.get('/proceso-mezclado/:id', obtenerPorProcesoMezclado)

// obtener un lote por id
loteCarminRoutes.get('/:id', obtenerLotePorId)

/* ======================================================
   CREATE
====================================================== */

// crear lote desde laqueo
loteCarminRoutes.post('/desde-laqueo', crearLoteDesdeLaqueo)

// crear lote desde molienda
loteCarminRoutes.post('/desde-molienda', crearLoteDesdeMolienda)

// crear lote desde mezclado
loteCarminRoutes.post('/desde-mezclado', crearLoteDesdeMezclado)

/* ======================================================
   UPDATE
====================================================== */

// actualizar resultados de análisis
loteCarminRoutes.put('/:id/analisis', actualizarResultadosAnalisis)

// actualizar observaciones
loteCarminRoutes.put('/:id/observaciones', actualizarObservaciones)

// actualizar estado del lote
loteCarminRoutes.patch('/:id/estado-lote', actualizarEstadoLoteCarmin)

// actualizar stock actual
loteCarminRoutes.patch('/:id/stock-actual', actualizarStockActualLoteCarmin)

// bloquear lote
loteCarminRoutes.put('/:id/bloquear', bloquearLote)

export default loteCarminRoutes
