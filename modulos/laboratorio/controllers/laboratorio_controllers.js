import {
  obtenerTodosAnalisisService,
  obtenerAnalisisPorIdService,
  obtenerAnalisisNoConformesService,
  contarMuestrasAnalizadasHoyService,
  contarNoConformidadesHoyService,
  crearAnalisisService,
  actualizarAnalisisService,
  eliminarAnalisisService
} from '../services/laboratorio_services.js'

export const obtenerTodosAnalisisController = async (_req, res) => {
  try {
    const analisis = await obtenerTodosAnalisisService()
    res.json(analisis)
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener analisis' })
  }
}

export const obtenerAnalisisPorIdController = async (req, res) => {
  try {
    const analisis = await obtenerAnalisisPorIdService(req.params.id)
    res.json(analisis)
  } catch (error) {
    if (
      error.message.includes('analisis_id debe ser') ||
      error.message.includes('analisis no encontrado')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al obtener el analisis' })
  }
}

export const contarMuestrasAnalizadasHoyController = async (_req, res) => {
  try {
    const resumen = await contarMuestrasAnalizadasHoyService()
    res.json(resumen)
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener el resumen de muestras analizadas hoy' })
  }
}

export const contarNoConformidadesHoyController = async (_req, res) => {
  try {
    const resumen = await contarNoConformidadesHoyService()
    res.json(resumen)
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener el resumen de no conformidades de hoy' })
  }
}

export const obtenerAnalisisNoConformesController = async (_req, res) => {
  try {
    const analisis = await obtenerAnalisisNoConformesService()
    res.json(analisis)
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener los analisis no conformes' })
  }
}

export const crearAnalisisController = async (req, res) => {
  try {
    const analisisDatos = req.body
    const nuevoAnalisis = await crearAnalisisService(analisisDatos)
    res.status(201).json(nuevoAnalisis)
  } catch (error) {
    console.error(error)

    if (
      error.message.includes('usuario_id debe ser') ||
      error.message.includes('item_inventario_id debe ser') ||
      error.message.includes('item_inventario_id no encontrado') ||
      error.message.includes('estado_analisis_id es obligatorio') ||
      error.message.includes('estado_analisis_id debe ser') ||
      error.message.includes('peso_muestra_g es obligatorio') ||
      error.message.includes('observaciones es obligatorio') ||
      error.message.includes('observaciones debe ser texto') ||
      error.message.includes('tipos_ensayo debe ser') ||
      error.message.includes('tipo de ensayo no permitido') ||
      error.message.includes('cada tipo de ensayo debe ser texto') ||
      error.message.includes('debe ser un numero valido')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}

export const actualizarAnalisisController = async (req, res) => {
  try {
    const analisis_id = req.params.id
    const analisisDatos = req.body
    const analisisActualizado = await actualizarAnalisisService(analisis_id, analisisDatos)
    res.json(analisisActualizado)
  } catch (error) {
    if (
      error.message.includes('analisis_id debe ser') ||
      error.message.includes('estado_analisis_id debe ser') ||
      error.message.includes('campos no permitidos') ||
      error.message.includes('debe ser un numero valido') ||
      error.message.includes('observaciones debe ser texto') ||
      error.message.includes('debes enviar al menos un campo') ||
      error.message.includes('analisis no encontrado')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al actualizar analisis' })
  }
}

export const eliminarAnalisisController = async (req, res) => {
  try {
    const analisis_id = req.params.id
    const resultado = await eliminarAnalisisService(analisis_id)
    res.json(resultado)
  } catch (_error) {
    res.status(500).json({ error: 'Error al eliminar analisis' })
  }
}
