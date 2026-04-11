import express from 'express'
import {
    obtenerTodosAlmacenesController,
    crearAlmacenController,
    actualizarAlmacenController,
    eliminarAlmacenController,
    actualizarNombreAlmacenController,
    actualizarTipoAlmacenController,
    actualizarUbicacionAlmacenController,
    actualizarActivoAlmacenController
} from '../controllers/almacen_controllers.js';

const almacenRoutes = express.Router()

almacenRoutes.get('/', obtenerTodosAlmacenesController)
almacenRoutes.post('/', crearAlmacenController)
almacenRoutes.put('/:id', actualizarAlmacenController)
almacenRoutes.patch('/:id/nombre', actualizarNombreAlmacenController)
almacenRoutes.patch('/:id/tipo-almacen', actualizarTipoAlmacenController)
almacenRoutes.patch('/:id/ubicacion', actualizarUbicacionAlmacenController)
almacenRoutes.patch('/:id/activo', actualizarActivoAlmacenController)
almacenRoutes.delete('/:id', eliminarAlmacenController)

export default almacenRoutes 
