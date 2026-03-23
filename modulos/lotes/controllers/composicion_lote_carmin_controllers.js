import {
  listarComposicionService,
  obtenerComposicionPorIdService,
  obtenerComposicionPorProcesoService,
  crearComposicionService,
  actualizarComposicionService,
  eliminarComposicionService
} from '../services/composicion_lote_carmin_services.js'

// GET: listar todas las composiciones
export const listarComposicion = async (req, res) => {
  try {
    const data = await listarComposicionService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET: obtener composición por id
export const obtenerComposicionPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerComposicionPorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// GET: obtener todas las composiciones de un proceso de mezclado
export const obtenerComposicionPorProceso = async (req, res) => {
  try {
    const { procesoId } = req.params
    const data = await obtenerComposicionPorProcesoService(procesoId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST: crear nueva composición
export const crearComposicion = async (req, res) => {
  try {
    const data = await crearComposicionService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// PUT: actualizar composición
export const actualizarComposicion = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarComposicionService(id, req.body)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// DELETE: eliminar composición
export const eliminarComposicion = async (req, res) => {
  try {
    const { id } = req.params
    const data = await eliminarComposicionService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}