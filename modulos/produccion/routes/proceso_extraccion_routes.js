import express from 'express'

import { crearProcesoExtraccion } from '../controllers/proceso_extraccion_controller.js'

const procesoExtraccionRoutes = express.Router()

procesoExtraccionRoutes.post('/', crearProcesoExtraccion)

export default procesoExtraccionRoutes
