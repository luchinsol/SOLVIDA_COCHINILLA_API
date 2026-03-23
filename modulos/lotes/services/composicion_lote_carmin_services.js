import {
  listarComposicionRepo,
  obtenerComposicionPorIdRepo,
  obtenerComposicionPorProcesoRepo,
  crearComposicionRepo,
  actualizarComposicionRepo,
  actualizarPorcentajeParticipacionRepo,
  eliminarComposicionRepo
} from '../repositories/composicion_lote_carmin_repositories.js'

// READ: listar todas las composiciones
export const listarComposicionService = async () => {
  return await listarComposicionRepo()
}

// READ: obtener composición por id
export const obtenerComposicionPorIdService = async (id) => {
  const composicion = await obtenerComposicionPorIdRepo(id)

  if (!composicion) {
    throw new Error('Composición no encontrada')
  }

  return composicion
}

// READ: obtener todas las composiciones de un proceso de mezclado
export const obtenerComposicionPorProcesoService = async (procesoId) => {
  return await obtenerComposicionPorProcesoRepo(procesoId)
}

// función auxiliar: recalcular porcentajes de participación de un proceso
export const recalcularPorcentajesParticipacionService = async (procesoId) => {
  const composiciones = await obtenerComposicionPorProcesoRepo(procesoId)

  if (!composiciones || composiciones.length === 0) {
    return []
  }

  const pesoTotal = composiciones.reduce((acc, item) => {
    return acc + Number(item.peso_utilizado_kg)
  }, 0)

  if (pesoTotal === 0) {
    for (const item of composiciones) {
      await actualizarPorcentajeParticipacionRepo(item.composicion_lote_carmin_id, 0)
    }
    return await obtenerComposicionPorProcesoRepo(procesoId)
  }

  for (const item of composiciones) {
    const porcentaje = (Number(item.peso_utilizado_kg) / pesoTotal) * 100
    await actualizarPorcentajeParticipacionRepo(
      item.composicion_lote_carmin_id,
      porcentaje
    )
  }

  return await obtenerComposicionPorProcesoRepo(procesoId)
}

// CREATE: crear nueva composición y recalcular porcentajes
export const crearComposicionService = async (data) => {
  if (!data.proceso_mezclado_id) {
    throw new Error('proceso_mezclado_id es obligatorio')
  }

  if (!data.lote_carmin_componente_id) {
    throw new Error('lote_carmin_componente_id es obligatorio')
  }

  if (data.peso_utilizado_kg == null || Number(data.peso_utilizado_kg) <= 0) {
    throw new Error('peso_utilizado_kg debe ser mayor a 0')
  }

  const nuevaComposicion = await crearComposicionRepo({
    ...data,
    porcentaje_participacion: null
  })

  await recalcularPorcentajesParticipacionService(data.proceso_mezclado_id)

  return nuevaComposicion
}

// UPDATE: actualizar peso y observaciones, luego recalcular porcentajes
export const actualizarComposicionService = async (id, data) => {
  const composicion = await obtenerComposicionPorIdRepo(id)

  if (!composicion) {
    throw new Error('Composición no encontrada')
  }

  if (data.peso_utilizado_kg == null || Number(data.peso_utilizado_kg) <= 0) {
    throw new Error('peso_utilizado_kg debe ser mayor a 0')
  }

  const composicionActualizada = await actualizarComposicionRepo(id, {
    peso_utilizado_kg: data.peso_utilizado_kg,
    observaciones: data.observaciones ?? null
  })

  await recalcularPorcentajesParticipacionService(composicion.proceso_mezclado_id)

  return composicionActualizada
}

// DELETE: eliminar composición y recalcular porcentajes del proceso
export const eliminarComposicionService = async (id) => {
  const composicion = await obtenerComposicionPorIdRepo(id)

  if (!composicion) {
    throw new Error('Composición no encontrada')
  }

  const eliminada = await eliminarComposicionRepo(id)

  await recalcularPorcentajesParticipacionService(composicion.proceso_mezclado_id)

  return eliminada
}