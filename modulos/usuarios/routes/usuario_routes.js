import express from 'express'
import { getUsuarios,getResumenUsuarios,putUsuarios,patchDatosUsuario,deleteUsuarios,postUsuarios} from '../controllers/usuario_controllers.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const usuarioRoutes = express.Router()

usuarioRoutes.get('/resumen-estados', requirePermission('usuario.ver'), getResumenUsuarios)
usuarioRoutes.get('/', requirePermission('usuario.ver'), getUsuarios)
usuarioRoutes.patch('/:id/datos', requirePermission('usuario.editar'), patchDatosUsuario)
usuarioRoutes.put('/:id', requirePermission('usuario.editar'), putUsuarios)
usuarioRoutes.post('/', requirePermission('usuario.crear'), postUsuarios)
usuarioRoutes.delete('/:id', requirePermission('usuario.eliminar'), deleteUsuarios)

export default usuarioRoutes
