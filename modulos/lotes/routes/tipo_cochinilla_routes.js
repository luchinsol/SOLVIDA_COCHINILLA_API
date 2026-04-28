import { Router } from 'express'
import { listarTiposCochinilla } from '../controllers/tipo_cochinilla_controllers.js'

const router = Router()

router.get('/', listarTiposCochinilla)

export default router
