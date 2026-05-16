import express from 'express'
import { login,getUsuarios,getResumenUsuarios,putUsuarios,patchDatosUsuario,deleteUsuarios,postUsuarios} from '../controllers/usuario_controllers.js'

const usuarioRoutes = express.Router()

usuarioRoutes.post('/login', login)
usuarioRoutes.get('/resumen-estados', getResumenUsuarios)
usuarioRoutes.get('/', getUsuarios)
usuarioRoutes.patch('/:id/datos', patchDatosUsuario)
usuarioRoutes.put('/:id', putUsuarios)
usuarioRoutes.post('/', postUsuarios)
usuarioRoutes.delete('/:id', deleteUsuarios)

export default usuarioRoutes
