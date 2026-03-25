import express from 'express'
import {
  listarComposicion,
  obtenerComposicionPorId,
  obtenerComposicionPorProceso,
  crearComposicion,
  actualizarComposicion,
  eliminarComposicion
} from '../controllers/composicion_lote_carmin_controllers.js'

const composicionCarminRoutes = express.Router()

// GET: listar todas
composicionCarminRoutes.get('/', listarComposicion)

// GET: por proceso (IMPORTANTE poner antes que /:id 👀)
composicionCarminRoutes.get('/proceso/:procesoId', obtenerComposicionPorProceso)

// GET: por id
composicionCarminRoutes.get('/:id', obtenerComposicionPorId)

// POST: crear
composicionCarminRoutes.post('/', crearComposicion)

// PUT: actualizar
composicionCarminRoutes.put('/:id', actualizarComposicion)

// DELETE: eliminar
composicionCarminRoutes.delete('/:id', eliminarComposicion)

export default composicionCarminRoutes