import express from 'express'
import { login,getUsuarios,putUsuarios,deleteUsuarios,postUsuarios} from '../controllers/usuario_controllers.js'

const usuarioRoutes = express.Router()

usuarioRoutes.post('/login', login)
usuarioRoutes.get('/', getUsuarios)
usuarioRoutes.put('/:id', putUsuarios)
usuarioRoutes.post('/', postUsuarios)
usuarioRoutes.delete('/:id', deleteUsuarios)

export default usuarioRoutes