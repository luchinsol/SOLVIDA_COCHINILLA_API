import express from 'express'
import { getInsumoPdfController,getInsumosController, createInsumoController, updateInsumoController, deleteInsumoController } from '../controllers/lote_insumo_controllers.js';

const insumoRoutes = express.Router()

insumoRoutes.get('/', getInsumosController)
insumoRoutes.post('/', createInsumoController)
insumoRoutes.put('/:id', updateInsumoController)
insumoRoutes.delete('/:id', deleteInsumoController)
insumoRoutes.get('/pdf', getInsumoPdfController)

export default insumoRoutes