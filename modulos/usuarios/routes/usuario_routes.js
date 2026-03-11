import express from 'express'
import { getRoles } from '../controllers/usuario_controllers.js'

const usuarioRoutes = express.Router()


usuarioRoutes.get('/', getRoles)

export default usuarioRoutes