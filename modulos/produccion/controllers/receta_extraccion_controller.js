import {
  crearRecetaExtraccionService,
  listarRecetasExtraccionService,
  obtenerRecetaExtraccionPorIdService,
  listarRecetasExtraccionVigentesService,
  listarRecetasExtraccionNoVigentesService,
  obtenerRecetasPorTipoCochinillaService,
  obtenerRecetasPorTipoCarminService,
  actualizarVigenciaRecetaExtraccionService,
  actualizarObservacionesOperariosRecetaExtraccionService,
  actualizarComentariosConclusionesRecetaExtraccionService,
  eliminarRecetaExtraccionService
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

/* ======================================================
   READ
====================================================== */
export const listarRecetasExtraccion = async (req, res) => {
  try {
    const data = await listarRecetasExtraccionService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerRecetaExtraccionPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerRecetaExtraccionPorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const listarRecetasExtraccionVigentes = async (req, res) => {
  try {
    const data = await listarRecetasExtraccionVigentesService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const listarRecetasExtraccionNoVigentes = async (req, res) => {
  try {
    const data = await listarRecetasExtraccionNoVigentesService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerRecetasPorTipoCochinilla = async (req, res) => {
  try {
    const { tipoCochinillaId } = req.params
    const data = await obtenerRecetasPorTipoCochinillaService(tipoCochinillaId)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerRecetasPorTipoCarmin = async (req, res) => {
  try {
    const { tipoCarminId } = req.params
    const data = await obtenerRecetasPorTipoCarminService(tipoCarminId)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   UPDATE
====================================================== */
export const actualizarVigenciaRecetaExtraccion = async (req, res) => {
  try {
    const { id } = req.params
    const { vigente } = req.body
    const data = await actualizarVigenciaRecetaExtraccionService(id, vigente)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarObservacionesOperariosRecetaExtraccion = async (req, res) => {
  try {
    const { id } = req.params
    const { observaciones_para_operarios } = req.body
    const data = await actualizarObservacionesOperariosRecetaExtraccionService(
      id,
      observaciones_para_operarios
    )
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarComentariosConclusionesRecetaExtraccion = async (req, res) => {
  try {
    const { id } = req.params
    const { comentarios_conclusiones } = req.body
    const data = await actualizarComentariosConclusionesRecetaExtraccionService(
      id,
      comentarios_conclusiones
    )
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   DELETE
====================================================== */
export const eliminarRecetaExtraccion = async (req, res) => {
  try {
    const { id } = req.params
    const data = await eliminarRecetaExtraccionService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}