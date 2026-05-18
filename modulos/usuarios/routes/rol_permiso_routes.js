import express from 'express'
import { getPermisosPorRol, postRolPermiso } from '../controllers/rol_permiso_controller.js'

const rolPermisoRoutes = express.Router()

rolPermisoRoutes.get('/', getPermisosPorRol)
rolPermisoRoutes.post('/', postRolPermiso)

export default rolPermisoRoutes
