import express from 'express';
import { crearAnalisisController,actualizarAnalisisController,obtenerTodosAnalisisController,eliminarAnalisisController } from '../controllers/laboratorio_controllers.js';

const laboratorioRouter = express.Router();

laboratorioRouter.get('/', obtenerTodosAnalisisController);
laboratorioRouter.post('/', crearAnalisisController);
laboratorioRouter.put('/:id', actualizarAnalisisController);
laboratorioRouter.delete('/:id', eliminarAnalisisController);

export default laboratorioRouter;