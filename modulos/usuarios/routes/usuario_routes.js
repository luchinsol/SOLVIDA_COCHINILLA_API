import express from 'express'
import { getRoles,login } from '../controllers/usuario_controllers.js'

const usuarioRoutes = express.Router()

usuarioRoutes.post('/login', login)
usuarioRoutes.get('/', getRoles)

export default usuarioRoutes