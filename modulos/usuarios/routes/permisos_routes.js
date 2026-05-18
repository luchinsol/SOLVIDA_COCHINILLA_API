import express from 'express'
import { getPermisos, postPermisos } from '../controllers/permisos_controller.js'

const permisosRoutes = express.Router()

permisosRoutes.get('/', getPermisos)
permisosRoutes.post('/', postPermisos)

export default permisosRoutes
