import express from 'express'
import {
  getPermisosPorRol,
  getVistaPermisosPorRol,
  postRolPermiso,
  patchRolPermiso
} from '../controllers/rol_permiso_controller.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const rolPermisoRoutes = express.Router()
const PERMISOS_ROL_PERMISO = {
  ver: 'rol_permiso.ver',
  crear: 'rol_permiso.crear',
  editar: 'rol_permiso.editar'
}

rolPermisoRoutes.get('/vista', requirePermission(PERMISOS_ROL_PERMISO.ver), getVistaPermisosPorRol)
rolPermisoRoutes.get('/', requirePermission(PERMISOS_ROL_PERMISO.ver), getPermisosPorRol)
rolPermisoRoutes.post('/', requirePermission(PERMISOS_ROL_PERMISO.crear), postRolPermiso)
rolPermisoRoutes.patch('/', requirePermission(PERMISOS_ROL_PERMISO.editar), patchRolPermiso)

export default rolPermisoRoutes
