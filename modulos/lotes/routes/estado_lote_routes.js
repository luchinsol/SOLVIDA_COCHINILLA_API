import { Router } from 'express'
import { listarEstadosLote } from '../controllers/estado_lote_controllers.js'

const router = Router()

router.get('/', listarEstadosLote)

export default router
