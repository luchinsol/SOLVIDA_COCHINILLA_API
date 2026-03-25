import express from 'express'
import { obtenerTodosInsumosController, crearInsumoController, actualizarInsumoController, eliminarInsumoController } from '../controllers/insumo_controllers.js';

const insumoRoutes = express.Router()

insumoRoutes.get('/', obtenerTodosInsumosController)
insumoRoutes.post('/', crearInsumoController)
insumoRoutes.put('/:id', actualizarInsumoController)
insumoRoutes.delete('/:id', eliminarInsumoController)

export default insumoRoutes