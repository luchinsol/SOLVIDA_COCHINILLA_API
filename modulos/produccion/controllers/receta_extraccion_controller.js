import {
  crearRecetaExtraccionService,
  obtenerRecetaExtraccionPorIdService
} from '../services/receta_extraccion_services.js'

/* ======================================================
   CREATE
====================================================== */
export const crearRecetaExtraccion = async (req, res) => {
  try {
    const data = await crearRecetaExtraccionService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerRecetaExtraccionPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerRecetaExtraccionPorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
