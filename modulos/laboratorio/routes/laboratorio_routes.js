import express from 'express';
import { requirePermission } from '../../../middlewares/authmiddleware.js';
import {
  crearAnalisisController,
  actualizarAnalisisController,
  obtenerAnalisisOSolicitudPorItemInventarioController,
  obtenerAnalisisActivoPorItemInventarioController,
  obtenerTodosAnalisisController,
  obtenerAnalisisPorIdController,
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
laboratorioRouter.get('/item/:item_inventario_id/analisis-o-solicitud', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisOSolicitudPorItemInventarioController);
laboratorioRouter.get('/item/:item_inventario_id/analisis-activo', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisActivoPorItemInventarioController);
laboratorioRouter.get('/:id', requirePermission(PERMISOS_ANALISIS.ver), obtenerAnalisisPorIdController);
laboratorioRouter.post('/', crearAnalisisController);
laboratorioRouter.patch('/:id', actualizarAnalisisController);
laboratorioRouter.put('/:id', actualizarAnalisisController);
laboratorioRouter.delete('/:id', eliminarAnalisisController);

export default laboratorioRouter;
