import {
  obtenerAnalisisOSolicitudPorItemInventarioService,
  obtenerTodosAnalisisService,
  obtenerAnalisisActivoPorItemInventarioService,
  obtenerAnalisisPorIdService,
  obtenerAnalisisNoConformesService,
  obtenerAnalisisNoConformesFinalizadosService,
  contarMuestrasAnalizadasHoyService,
  contarNoConformidadesHoyService,
  crearAnalisisService,
  actualizarAnalisisService,
  actualizarEnsayosAnalisisService,
  aprobarODesaprobarAnalisisService,
  eliminarAnalisisService
} from '../services/laboratorio_services.js'

export const obtenerTodosAnalisisController = async (_req, res) => {
  try {
    const analisis = await obtenerTodosAnalisisService()
    res.json(analisis)
  } catch (error) {
    console.error('Error en obtenerTodosAnalisisController:', error)
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

export const obtenerAnalisisActivoPorItemInventarioController = async (req, res) => {
  try {
    const analisis = await obtenerAnalisisActivoPorItemInventarioService(req.query.item_inventario_id)
    res.json(analisis)
  } catch (error) {
    if (
      error.message.includes('item_inventario_id debe ser') ||
      error.message.includes('no existe un lote en analisis')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al obtener el analisis activo del lote' })
  }
}

export const obtenerAnalisisOSolicitudPorItemInventarioController = async (req, res) => {
  try {
    const resultado = await obtenerAnalisisOSolicitudPorItemInventarioService(req.query.item_inventario_id)
    res.json(resultado)
  } catch (error) {
    if (
      error.message.includes('item_inventario_id debe ser') ||
      error.message.includes('no existe analisis activo ni solicitud pendiente')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al obtener el analisis o la solicitud del lote' })
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

export const obtenerAnalisisNoConformesFinalizadosController = async (_req, res) => {
  try {
    const analisis = await obtenerAnalisisNoConformesFinalizadosService()
    res.json(analisis)
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener los analisis no conformes finalizados' })
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
      error.message.includes('solicitud_id es obligatorio') ||
      error.message.includes('solicitud_id debe ser') ||
      error.message.includes('solicitud de analisis no encontrada') ||
      error.message.includes('solicitud de analisis no corresponde') ||
      error.message.includes('solicitud de analisis ya fue atendida') ||
      error.message.includes('solicitud de analisis no tiene parametros') ||
      error.message.includes('peso_muestra_g no se recibe') ||
      error.message.includes('observaciones es obligatorio') ||
      error.message.includes('observaciones debe ser texto') ||
      error.message.includes('tipo de ensayo no permitido') ||
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

export const actualizarEnsayosAnalisisController = async (req, res) => {
  try {
    const resultado = await actualizarEnsayosAnalisisService(
      req.query.analisis_id ?? req.query.analisis_laboratorio_id,
      req.body
    )
    res.json(resultado)
  } catch (error) {
    if (
      error.message.includes('analisis_id debe ser') ||
      error.message.includes('ensayos debe ser') ||
      error.message.includes('cada ensayo debe ser un objeto') ||
      error.message.includes('ensayo_id debe ser') ||
      error.message.includes('estado_analisis_id debe ser') ||
      error.message.includes('todos los ensayos deben tener resultados para finalizar el analisis') ||
      error.message.includes('tipo_ensayo es obligatorio') ||
      error.message.includes('tipo_ensayo debe ser texto') ||
      error.message.includes('tipo_ensayo no permitido') ||
      error.message.includes('tipo_ensayo no coincide con ensayo_id') ||
      error.message.includes('ensayo no encontrado para analisis') ||
      error.message.includes('observaciones debe ser texto') ||
      error.message.includes('peso_ensayo_g debe ser mayor a 0') ||
      error.message.includes('debe ser un numero valido')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al actualizar los ensayos del analisis' })
  }
}

export const aprobarODesaprobarAnalisisController = async (req, res) => {
  try {
    const resultado = await aprobarODesaprobarAnalisisService(req.params.analisis_id, req.body)
    res.json(resultado)
  } catch (error) {
    if (
      error.message.includes('analisis_id debe ser') ||
      error.message.includes('aprobado debe ser booleano') ||
      error.message.includes('observaciones es obligatorio') ||
      error.message.includes('observaciones debe ser texto') ||
      error.message.includes('mensaje_gerencia debe ser texto') ||
      error.message.includes('analisis no encontrado') ||
      error.message.includes('analisis no esta en revision') ||
      error.message.includes('analisis no tiene item_inventario_id valido')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al aprobar o desaprobar el analisis' })
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
