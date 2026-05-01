import { Router } from 'express'
import { listarExtractos } from '../controllers/extracto_controllers.js'

const router = Router()

router.get('/', listarExtractos)

export default router
