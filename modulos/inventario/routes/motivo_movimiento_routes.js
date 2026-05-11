import { Router } from 'express'
import { listarMotivosMovimiento } from '../controllers/motivo_movimiento_controller.js'

const router = Router()

router.get('/', listarMotivosMovimiento)

export default router
