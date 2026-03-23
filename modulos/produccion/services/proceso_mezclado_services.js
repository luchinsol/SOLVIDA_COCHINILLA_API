// SERVICE DE PROCESO MEZCLADO

import {
  listarProcesoMezcladoRepo,
  obtenerProcesoMezcladoPorIdRepo,
  crearProcesoMezcladoRepo,
  iniciarProcesoMezcladoRepo,
  finalizarProcesoMezcladoRepo,
  eliminarProcesoMezcladoRepo
} from '../repositories/proceso_mezclado_repositories.js'

// LISTAR
export const listarProcesoMezcladoService = async () => {
  return await listarProcesoMezcladoRepo()
}

// OBTENER POR ID
export const obtenerProcesoMezcladoPorIdService = async (id) => {
  const proceso = await obtenerProcesoMezcladoPorIdRepo(id)

  if (!proceso) {
    throw new Error('Proceso de mezclado no encontrado')
  }

  return proceso
}

// CREAR
export const crearProcesoMezcladoService = async (data) => {
  if (!data.usuario_id) {
    throw new Error('usuario_id es obligatorio')
  }

  if (!data.codigo_proceso) {
    throw new Error('codigo_proceso es obligatorio')
  }

  return await crearProcesoMezcladoRepo(data)
}

// INICIAR PROCESO
export const iniciarProcesoMezcladoService = async (id) => {
  const proceso = await obtenerProcesoMezcladoPorIdRepo(id)

  if (!proceso) {
    throw new Error('Proceso no existe')
  }

  if (proceso.estado === 'en_curso') {
    throw new Error('El proceso ya está en curso')
  }

  if (proceso.estado === 'finalizado') {
    throw new Error('El proceso ya fue finalizado')
  }

  return await iniciarProcesoMezcladoRepo(id)
}

// FINALIZAR PROCESO
export const finalizarProcesoMezcladoService = async (id) => {
  const proceso = await obtenerProcesoMezcladoPorIdRepo(id)

  if (!proceso) {
    throw new Error('Proceso no existe')
  }

  if (proceso.estado !== 'en_curso') {
    throw new Error('Solo se puede finalizar un proceso en curso')
  }

  return await finalizarProcesoMezcladoRepo(id)
}

// ELIMINAR (puedes cambiar luego a soft delete)
export const eliminarProcesoMezcladoService = async (id) => {
  const proceso = await obtenerProcesoMezcladoPorIdRepo(id)

  if (!proceso) {
    throw new Error('Proceso no existe')
  }

  return await eliminarProcesoMezcladoRepo(id)
}