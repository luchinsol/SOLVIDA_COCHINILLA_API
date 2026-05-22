import express from 'express'
import { requireAnyPermission, requirePermission } from '../../../middlewares/authmiddleware.js'
import {
  getInsumoPdfController,
  getInsumosController,
  getInsumoByIdController,
  getResumenInsumosPorTipoController,
  createInsumoController,
  deleteInsumoController,
  actualizarEstadoLoteInsumoController,
  actualizarStockActualInsumoController
} from '../controllers/lote_insumo_controllers.js';

const insumoRoutes = express.Router()
const PERMISOS_LOTE_INSUMOS = {
  crearValorado: 'lote_insumos.crear.valorado',
  verNoValorado: 'lote_insumos.ver.no_valorado',
  verValorado: 'lote_insumos.ver.valorado',
  editar: 'lote_insumos.editar'
}

insumoRoutes.get(
  '/',
  requireAnyPermission([
    PERMISOS_LOTE_INSUMOS.verNoValorado,
    PERMISOS_LOTE_INSUMOS.verValorado
  ]),
  getInsumosController
)
insumoRoutes.get('/resumen/tipo', requirePermission(PERMISOS_LOTE_INSUMOS.verValorado), getResumenInsumosPorTipoController)
insumoRoutes.get('/pdf', requirePermission(PERMISOS_LOTE_INSUMOS.verNoValorado), getInsumoPdfController)
insumoRoutes.get(
  '/:id',
  requireAnyPermission([
    PERMISOS_LOTE_INSUMOS.verNoValorado,
    PERMISOS_LOTE_INSUMOS.verValorado
  ]),
  getInsumoByIdController
)
insumoRoutes.post('/', requirePermission(PERMISOS_LOTE_INSUMOS.crearValorado), createInsumoController)
insumoRoutes.patch('/:id/estado-lote', requirePermission(PERMISOS_LOTE_INSUMOS.editar), actualizarEstadoLoteInsumoController)
insumoRoutes.patch('/:id/stock-actual', requirePermission(PERMISOS_LOTE_INSUMOS.editar), actualizarStockActualInsumoController)
insumoRoutes.delete('/:id', deleteInsumoController)

export default insumoRoutes
