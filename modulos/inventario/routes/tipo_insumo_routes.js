import { Router } from 'express'
import {
  actualizarControladoTipoInsumoController,
  actualizarVigenciaTipoInsumoController,
  crearTipoInsumoController,
  obtenerTiposInsumoController
} from '../controllers/tipo_insumo_controllers.js'

const router = Router()

router.get('/', obtenerTiposInsumoController)
router.post('/', crearTipoInsumoController)
router.patch('/:id/vigencia', actualizarVigenciaTipoInsumoController)
router.patch('/:id/controlado', actualizarControladoTipoInsumoController)

export default router
