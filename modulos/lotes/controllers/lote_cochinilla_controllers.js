import {
  crearLoteCochinillaService,
  listarLotesCochinillaService,
  obtenerLoteCochinillaPorIdService,
  actualizarAnalisisLoteCochinillaService,
  actualizarConsumoLoteCochinillaService,
  eliminarLoteCochinillaService
} from '../services/lote_cochinilla_services.js'

/* ======================================================
   CREATE
====================================================== */
export const crearLoteCochinilla = async (req, res) => {
  try {
    const data = await crearLoteCochinillaService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   READ
====================================================== */
export const listarLotesCochinilla = async (req, res) => {
  try {
    const data = await listarLotesCochinillaService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerLoteCochinillaPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerLoteCochinillaPorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/* ======================================================
   UPDATE: análisis
====================================================== */
export const actualizarAnalisisLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarAnalisisLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   UPDATE: consumo
====================================================== */
export const actualizarConsumoLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarConsumoLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   DELETE
====================================================== */
export const eliminarLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await eliminarLoteCochinillaService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}