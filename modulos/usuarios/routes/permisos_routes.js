import express from 'express'
import { getPermisos } from '../controllers/permisos_controller.js'

const permisosRoutes = express.Router()

permisosRoutes.get('/', getPermisos)

export default permisosRoutes
