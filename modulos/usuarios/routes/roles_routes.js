import express from 'express'
import { getRoles, getRolesActivos, createRole, updateRole, deleteRole } from '../controllers/roles_controllers.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const rolesRoutes = express.Router()
const PERMISOS_ROL = {
  ver: 'rol.ver',
  crear: 'rol.crear',
  editar: 'rol.editar',
  eliminar: 'rol.eliminar'
}

rolesRoutes.get('/', requirePermission(PERMISOS_ROL.ver), getRoles)
rolesRoutes.get('/roles-activos', requirePermission(PERMISOS_ROL.ver), getRolesActivos)
rolesRoutes.post('/', requirePermission(PERMISOS_ROL.crear), createRole)
rolesRoutes.put('/:id', requirePermission(PERMISOS_ROL.editar), updateRole)
rolesRoutes.delete('/:id', requirePermission(PERMISOS_ROL.eliminar), deleteRole)

export default rolesRoutes
