import express from 'express'

import {
  listarProcesoMezclado,
  obtenerProcesoMezcladoPorId,
  crearProcesoMezclado,
  iniciarProcesoMezclado,
  finalizarProcesoMezclado,
  eliminarProcesoMezclado
} from '../controllers/procesoMezclado.controller.js'

const procesoMezcladoRoutes = express.Router()

procesoMezcladoRoutes.get('/', listarProcesoMezclado)
procesoMezcladoRoutes.get('/:id', obtenerProcesoMezcladoPorId)
procesoMezcladoRoutes.post('/', crearProcesoMezclado)
procesoMezcladoRoutes.put('/:id/iniciar', iniciarProcesoMezclado)
procesoMezcladoRoutes.put('/:id/finalizar', finalizarProcesoMezclado)
procesoMezcladoRoutes.delete('/:id', eliminarProcesoMezclado)

export default procesoMezcladoRoutes