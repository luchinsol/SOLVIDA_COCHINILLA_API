import express from 'express';
import { obtenerProveedoresController,crearProveedorController,actualizarProveedorController,eliminarProveedorController } from '../controllers/proveedor_controllers';

const proveedorRouter = express.Router();

proveedorRouter.get('/', obtenerProveedoresController);
proveedorRouter.post('/', crearProveedorController);
proveedorRouter.put('/:id', actualizarProveedorController);
proveedorRouter.delete('/:id', eliminarProveedorController);

export default proveedorRouter;