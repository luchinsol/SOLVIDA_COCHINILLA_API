import express from 'express'
import { login,getUsuarios,getResumenUsuarios,putUsuarios,patchDatosUsuario,deleteUsuarios,postUsuarios} from '../controllers/usuario_controllers.js'
import { verifyToken, requirePermission } from '../../../middlewares/authmiddleware.js'

const usuarioRoutes = express.Router()

usuarioRoutes.post('/login', login)
usuarioRoutes.get('/resumen-estados', verifyToken, requirePermission('usuario.ver'), getResumenUsuarios)
usuarioRoutes.get('/', verifyToken, requirePermission('usuario.ver'), getUsuarios)
usuarioRoutes.patch('/:id/datos', verifyToken, requirePermission('usuario.editar'), patchDatosUsuario)
usuarioRoutes.put('/:id', verifyToken, requirePermission('usuario.editar'), putUsuarios)
usuarioRoutes.post('/', verifyToken, requirePermission('usuario.crear'), postUsuarios)
usuarioRoutes.delete('/:id', verifyToken, requirePermission('usuario.eliminar'), deleteUsuarios)

export default usuarioRoutes
