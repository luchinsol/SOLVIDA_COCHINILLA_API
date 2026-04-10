import {
  crearRecetaExtraccionRepo,
  listarRecetasExtraccionRepo,
  obtenerRecetaExtraccionPorIdRepo,
  listarRecetasExtraccionVigentesRepo,
  listarRecetasExtraccionNoVigentesRepo,
  obtenerRecetasPorTipoCochinillaRepo,
  obtenerRecetasPorTipoCarminRepo,
  actualizarVigenciaRecetaExtraccionRepo,
  actualizarObservacionesOperariosRecetaExtraccionRepo,
  actualizarComentariosConclusionesRecetaExtraccionRepo,
  eliminarRecetaExtraccionRepo
} from '../repositories/receta_extraccion_repositories.js'

/* ======================================================
   CREATE
====================================================== */
export const crearRecetaExtraccionService = async (data) => {

  // 🔴 VALIDACIONES IMPORTANTES
  if (!data.nombre) {
    throw new Error('El nombre es obligatorio')
  }

  if (!data.tipo_cochinilla_id) {
    throw new Error('El tipo de cochinilla es obligatorio')
  }

  if (!data.tipo_carmin_obtenido_id) {
    throw new Error('El tipo de carmín obtenido es obligatorio')
  }

  if (!data.ph_objetivo_buffer || !data.ph_objetivo_filtrado) {
    throw new Error('Los pH objetivos son obligatorios')
  }

  if (!data.temperatura_objetivo_gradoscentigrados) {
    throw new Error('La temperatura es obligatoria')
  }

  if (!data.tiempo_reaccion_min) {
    throw new Error('El tiempo de reacción es obligatorio')
  }

  if (!data.agitacion_rpm) {
    throw new Error('La agitación es obligatoria')
  }

  if (!data.factor_carb_sodio_compuesto) {
    throw new Error('El factor carb sodio es obligatorio')
  }

  if (!data.factor_citrico_kg_por_puntos_ac) {
    throw new Error('El factor cítrico es obligatorio')
  }

  if (!data.concentracion_extracto_objetivo_pts_ac_por_litros) {
    throw new Error('La concentración objetivo es obligatoria')
  }

  // 🧠 DEFAULTS INTELIGENTES
  data.vigente = data.vigente ?? true
  data.creado_en = new Date()

  // 🚀 CREATE
  return await crearRecetaExtraccionRepo(data)
}



//READS
export const listarRecetasExtraccionService = async () => {
  return await listarRecetasExtraccionRepo()
}

export const obtenerRecetaExtraccionPorIdService = async (id) => {
  const receta = await obtenerRecetaExtraccionPorIdRepo(id)

  if (!receta) {
    throw new Error('Receta no encontrada')
  }

  return receta
}

export const listarRecetasExtraccionVigentesService = async () => {
  return await listarRecetasExtraccionVigentesRepo()
}

export const listarRecetasExtraccionNoVigentesService = async () => {
  return await listarRecetasExtraccionNoVigentesRepo()
}

/* ======================================================
    READ: obtener recetas por tipo de cochinilla
    ====================================================== */
export const obtenerRecetasPorTipoCochinillaService = async (tipoCochinillaId) => {

  if (!tipoCochinillaId) {
    throw new Error('Debe enviar tipo_cochinilla_id')
  }

  return await obtenerRecetasPorTipoCochinillaRepo(tipoCochinillaId)
}

export const obtenerRecetasPorTipoCarminService = async (tipoCarminId) => {

  if (!tipoCarminId) {
    throw new Error('Debe enviar tipo_carmin_id')
  }

  return await obtenerRecetasPorTipoCarminRepo(tipoCarminId)
}

//UPDATES
export const actualizarVigenciaRecetaExtraccionService = async (id, vigente) => {

  if (vigente === undefined) {
    throw new Error('Debe enviar el valor de vigente')
  }

  return await actualizarVigenciaRecetaExtraccionRepo(id, vigente)
}

export const actualizarObservacionesOperariosRecetaExtraccionService = async (id, observaciones) => {
  return await actualizarObservacionesOperariosRecetaExtraccionRepo(id, observaciones)
}

export const actualizarComentariosConclusionesRecetaExtraccionService = async (id, comentarios) => {
  return await actualizarComentariosConclusionesRecetaExtraccionRepo(id, comentarios)
}

//DELETES
export const eliminarRecetaExtraccionService = async (id) => {

  // 🧠 recomendación negocio: no borrar
  throw new Error('No se recomienda eliminar recetas. Usar vigente = false')

  // si igual quieres permitirlo:
  // return await eliminarRecetaExtraccionRepo(id)
}