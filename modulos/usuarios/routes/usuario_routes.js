import express from 'express'
import { getUsuarios,getResumenUsuarios,putUsuarios,patchDatosUsuario,deleteUsuarios,postUsuarios} from '../controllers/usuario_controllers.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const usuarioRoutes = express.Router()
const PERMISOS_USUARIO = {
    ver: 'usuario.ver',
    crear: 'usuario.crear',
    editar: 'usuario.editar',
    eliminar: 'usuario.eliminar'
}

usuarioRoutes.get('/resumen-estados', requirePermission(PERMISOS_USUARIO.ver), getResumenUsuarios)
usuarioRoutes.get('/', requirePermission(PERMISOS_USUARIO.ver), getUsuarios)
usuarioRoutes.patch('/:id/datos', requirePermission(PERMISOS_USUARIO.editar), patchDatosUsuario)
usuarioRoutes.put('/:id', requirePermission(PERMISOS_USUARIO.editar), putUsuarios)
usuarioRoutes.post('/', requirePermission(PERMISOS_USUARIO.crear), postUsuarios)
usuarioRoutes.delete('/:id', requirePermission(PERMISOS_USUARIO.eliminar), deleteUsuarios)

export default usuarioRoutes
