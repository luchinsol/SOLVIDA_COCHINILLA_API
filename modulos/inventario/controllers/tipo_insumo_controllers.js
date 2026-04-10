import {
  actualizarControladoTipoInsumoService,
  actualizarVigenciaTipoInsumoService,
  crearTipoInsumoService,
  obtenerTiposInsumoService
} from '../services/tipo_insumo_services.js'

export const obtenerTiposInsumoController = async (req, res) => {
  try {
    const tiposInsumo = await obtenerTiposInsumoService()
    res.json(tiposInsumo)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

export const actualizarVigenciaTipoInsumoController = async (req, res) => {
  try {
    const { id } = req.params
    const { vigente } = req.body
    const tipoInsumoActualizado = await actualizarVigenciaTipoInsumoService(id, vigente)
    res.json(tipoInsumoActualizado)
  } catch (error) {
    const status = error.message === 'Tipo de insumo no encontrado' ? 404 : 400
    res.status(status).json({
      error: error.message
    })
  }
}

export const actualizarControladoTipoInsumoController = async (req, res) => {
  try {
    const { id } = req.params
    const { controlado } = req.body
    const tipoInsumoActualizado = await actualizarControladoTipoInsumoService(id, controlado)
    res.json(tipoInsumoActualizado)
  } catch (error) {
    const status = error.message === 'Tipo de insumo no encontrado' ? 404 : 400
    res.status(status).json({
      error: error.message
    })
  }
}

// CREATE tipo_insumo
export const crearTipoInsumoController = async (req, res) => {
  try {
    const nuevoTipoInsumo = await crearTipoInsumoService(req.body)
    res.status(201).json(nuevoTipoInsumo)
  } catch (error) {
    res.status(400).json({
      error: error.message
    })
  }
}
