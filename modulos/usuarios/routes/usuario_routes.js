import { getRoles,crearRoles } from '../controllers/usuario_controllers.js'

import express from 'express'
const usuarioRoutes = express.Router()


usuarioRoutes.get('/', getRoles)

usuarioRoutes.post('/', crearRoles)

export default usuarioRoutes