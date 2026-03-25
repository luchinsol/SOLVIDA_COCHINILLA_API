import express from 'express'
import { getInsumosController, createInsumoController, updateInsumoController, deleteInsumoController } from '../controllers/insumo_controllers.js';

const insumoRoutes = express.Router()

insumoRoutes.get('/', getInsumosController)
insumoRoutes.post('/', createInsumoController)
insumoRoutes.put('/:id', updateInsumoController)
insumoRoutes.delete('/:id', deleteInsumoController)

export default insumoRoutes