import express from 'express'
import {
  getInsumoPdfController,
  getInsumosController,
  createInsumoController,
  updateInsumoController,
  deleteInsumoController,
  actualizarEstadoLoteInsumoController,
  actualizarStockActualInsumoController
} from '../controllers/lote_insumo_controllers.js';

const insumoRoutes = express.Router()

insumoRoutes.get('/', getInsumosController)
insumoRoutes.post('/', createInsumoController)
insumoRoutes.put('/:id', updateInsumoController)
insumoRoutes.patch('/:id/estado-lote', actualizarEstadoLoteInsumoController)
insumoRoutes.patch('/:id/stock-actual', actualizarStockActualInsumoController)
insumoRoutes.delete('/:id', deleteInsumoController)
insumoRoutes.get('/pdf', getInsumoPdfController)

export default insumoRoutes
