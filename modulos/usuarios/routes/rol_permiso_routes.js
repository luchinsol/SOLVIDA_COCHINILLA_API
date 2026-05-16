import express from 'express'
import { getPermisosPorRol } from '../controllers/rol_permiso_controller.js'

const rolPermisoRoutes = express.Router()

rolPermisoRoutes.get('/', getPermisosPorRol)

export default rolPermisoRoutes
