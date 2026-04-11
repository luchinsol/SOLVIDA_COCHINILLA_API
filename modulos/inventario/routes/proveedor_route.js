import express from 'express';
import {
    obtenerProveedoresController,
    crearProveedorController,
    actualizarProveedorController,
    eliminarProveedorController,
    actualizarActivoProveedorController,
    actualizarTipoProveedorController
} from '../controllers/proveedor_controllers.js';

const proveedorRouter = express.Router();

proveedorRouter.get('/', obtenerProveedoresController);
proveedorRouter.post('/', crearProveedorController);
proveedorRouter.put('/:id', actualizarProveedorController);
proveedorRouter.patch('/:id/activo', actualizarActivoProveedorController);
proveedorRouter.patch('/:id/tipo-proveedor', actualizarTipoProveedorController);
proveedorRouter.delete('/:id', eliminarProveedorController);

export default proveedorRouter;
