import {
  crearLoteDesdeLaqueoService,
  crearLoteDesdeMoliendaService,
  crearLoteDesdeMezcladoService,
  actualizarResultadosAnalisisService,
  actualizarObservacionesService,
  actualizarEstadoLoteCarminService,
  actualizarStockActualLoteCarminService,
  bloquearLoteService,
  listarLotesService,
  obtenerLotePorIdService,
  buscarLotesConFiltrosService,
  listarLotesSinAnalisisService,
  obtenerPorProcesoLaqueoService,
  obtenerPorProcesoMoliendaService,
  obtenerPorProcesoMezcladoService
} from '../services/lote_carmin_services.js'

/* ======================================================
   CREATE
====================================================== */

// crear lote desde laqueo
export const crearLoteDesdeLaqueo = async (req, res) => {
  try {
    const data = await crearLoteDesdeLaqueoService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// crear lote desde molienda
export const crearLoteDesdeMolienda = async (req, res) => {
  try {
    const data = await crearLoteDesdeMoliendaService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// crear lote desde mezclado
export const crearLoteDesdeMezclado = async (req, res) => {
  try {
    const data = await crearLoteDesdeMezcladoService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   UPDATE
====================================================== */

// actualizar resultados de análisis
export const actualizarResultadosAnalisis = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarResultadosAnalisisService(id, req.body)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// actualizar observaciones
export const actualizarObservaciones = async (req, res) => {
  try {
    const { id } = req.params
    const { observaciones } = req.body
    const data = await actualizarObservacionesService(id, observaciones)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarEstadoLoteCarmin = async (req, res) => {
  try {
    const { id } = req.params
    const { estado_lote } = req.body
    const data = await actualizarEstadoLoteCarminService(id, estado_lote)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarStockActualLoteCarmin = async (req, res) => {
  try {
    const { id } = req.params
    const { stock_actual } = req.body
    const data = await actualizarStockActualLoteCarminService(id, stock_actual)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// bloquear lote
export const bloquearLote = async (req, res) => {
  try {
    const { id } = req.params
    const data = await bloquearLoteService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   READ
====================================================== */

// listar todos
export const listarLotes = async (req, res) => {
  try {
    const data = await listarLotesService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// obtener por id
export const obtenerLotePorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerLotePorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// búsqueda con filtros
export const buscarLotesConFiltros = async (req, res) => {
  try {
    const data = await buscarLotesConFiltrosService(req.query)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// listar lotes sin análisis ah
export const listarLotesSinAnalisis = async (req, res) => {
  try {
    const data = await listarLotesSinAnalisisService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// obtener por proceso de laqueo
export const obtenerPorProcesoLaqueo = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerPorProcesoLaqueoService(id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// obtener por proceso de molienda
export const obtenerPorProcesoMolienda = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerPorProcesoMoliendaService(id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// obtener por proceso de mezclado
export const obtenerPorProcesoMezclado = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerPorProcesoMezcladoService(id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
