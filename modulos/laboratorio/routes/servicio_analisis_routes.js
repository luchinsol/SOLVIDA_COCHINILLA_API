import express from 'express'
import { requireAnyPermission } from '../../../middlewares/authmiddleware.js'
import {
  crearServicioAnalisisController,
  listarServiciosAnalisisController,
  obtenerDetalleServicioAnalisisController,
  obtenerResumenServiciosAnalisisController
} from '../controllers/servicio_analisis_controllers.js'

const servicioAnalisisRouter = express.Router()

servicioAnalisisRouter.get(
  '/',
  requireAnyPermission(['analisis.ver']),
  listarServiciosAnalisisController
)

servicioAnalisisRouter.get(
  '/resumen',
  requireAnyPermission(['analisis.ver']),
  obtenerResumenServiciosAnalisisController
)

servicioAnalisisRouter.get(
  '/:servicio_id',
  requireAnyPermission(['analisis.ver']),
  obtenerDetalleServicioAnalisisController
)

servicioAnalisisRouter.post(
  '/',
  requireAnyPermission(['servicio_analisis.crear', 'analisis.crear']),
  crearServicioAnalisisController
)

export default servicioAnalisisRouter
