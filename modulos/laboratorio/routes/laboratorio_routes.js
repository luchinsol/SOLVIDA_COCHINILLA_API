import express from 'express';
import { requirePermission } from '../../../middlewares/authmiddleware.js';
import {
  crearAnalisisController,
  actualizarEnsayosAnalisisController,
  aprobarAnalisisEnRevisionController,
  obtenerAnalisisOSolicitudPorItemInventarioController,
  obtenerAnalisisActivoPorItemInventarioController,
  obtenerTodosAnalisisController,
  obtenerAnalisisPorIdController,
  obtenerAnalisisNoConformesController,
  contarMuestrasAnalizadasHoyController,
  contarNoConformidadesHoyController
} from '../controllers/laboratorio_controllers.js';

const laboratorioRouter = express.Router();
const PERMISOS_ANALISIS = {
  ver: 'analisis.ver',
  crear: 'analisis.crear',
  editarCaptura: 'analisis.editar.capturar',
  editarAprobar: 'analisis.editar.aprobar'
}

//holis bolis

laboratorioRouter.get('/', requirePermission(PERMISOS_ANALISIS.ver), obtenerTodosAnalisisController);
laboratorioRouter.get('/no-conformes', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisNoConformesController);
laboratorioRouter.get('/muestras-analizadas-hoy/resumen', requirePermission(PERMISOS_ANALISIS.ver), contarMuestrasAnalizadasHoyController);
laboratorioRouter.get('/no-conformidades-hoy/resumen', requirePermission(PERMISOS_ANALISIS.ver), contarNoConformidadesHoyController);
laboratorioRouter.get('/analisis-o-solicitud', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisOSolicitudPorItemInventarioController);
laboratorioRouter.get('/analisis-activo', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisActivoPorItemInventarioController);
laboratorioRouter.get('/:id', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisPorIdController);
laboratorioRouter.post('/', requirePermission(PERMISOS_ANALISIS.crear), crearAnalisisController);
laboratorioRouter.patch('/ensayos', requirePermission(PERMISOS_ANALISIS.editarCaptura), actualizarEnsayosAnalisisController);
laboratorioRouter.patch('/:id/aprobacion', requirePermission(PERMISOS_ANALISIS.editarAprobar), aprobarAnalisisEnRevisionController);

export default laboratorioRouter;
