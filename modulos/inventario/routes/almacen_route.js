import express from 'express'
import { obtenerTodosAlmacenesController, crearAlmacenController, actualizarAlmacenController, eliminarAlmacenController } from '../controllers/almacen_controllers.js';

const almacenRoutes = express.Router()

almacenRoutes.get('/', obtenerTodosAlmacenesController)
almacenRoutes.post('/', crearAlmacenController)
almacenRoutes.put('/:id', actualizarAlmacenController)
almacenRoutes.delete('/:id', eliminarAlmacenController)

export default almacenRoutes 