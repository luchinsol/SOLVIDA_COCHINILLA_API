import express from 'express'
import { getPermisos, getCatalogoPermisos, postPermisos } from '../controllers/permisos_controller.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const permisosRoutes = express.Router()
const PERMISOS_PERMISO = {
  ver: 'permiso.ver',
  crear: 'permiso.crear'
}

permisosRoutes.get('/catalogo', requirePermission(PERMISOS_PERMISO.ver), getCatalogoPermisos)
permisosRoutes.get('/', requirePermission(PERMISOS_PERMISO.ver), getPermisos)
permisosRoutes.post('/', requirePermission(PERMISOS_PERMISO.crear), postPermisos)

export default permisosRoutes
