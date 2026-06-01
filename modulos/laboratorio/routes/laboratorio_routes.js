import express from 'express';
import { requirePermission } from '../../../middlewares/authmiddleware.js';
import {
  crearAnalisisController,
  actualizarAnalisisController,
  obtenerTodosAnalisisController,
  obtenerAnalisisNoConformesController,
  contarMuestrasAnalizadasHoyController,
  contarNoConformidadesHoyController,
  eliminarAnalisisController
} from '../controllers/laboratorio_controllers.js';

const laboratorioRouter = express.Router();
const PERMISOS_ANALISIS = {
  ver: 'analisis.ver'
}

laboratorioRouter.get('/', obtenerTodosAnalisisController);
laboratorioRouter.get('/no-conformes', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisNoConformesController);
laboratorioRouter.get('/muestras-analizadas-hoy/resumen', requirePermission(PERMISOS_ANALISIS.ver), contarMuestrasAnalizadasHoyController);
laboratorioRouter.get('/no-conformidades-hoy/resumen', requirePermission(PERMISOS_ANALISIS.ver), contarNoConformidadesHoyController);
laboratorioRouter.post('/', crearAnalisisController);
laboratorioRouter.put('/:id', actualizarAnalisisController);
laboratorioRouter.delete('/:id', eliminarAnalisisController);

export default laboratorioRouter;
