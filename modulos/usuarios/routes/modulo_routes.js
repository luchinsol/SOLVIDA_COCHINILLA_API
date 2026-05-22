import express from 'express'
import { getModulos } from '../controllers/modulo_controller.js'
import { requirePermission } from '../../../middlewares/authmiddleware.js'

const moduloRoutes = express.Router()
const PERMISOS_MODULO = {
  ver: 'modulo.ver'
}

moduloRoutes.get('/', requirePermission(PERMISOS_MODULO.ver), getModulos)

export default moduloRoutes
