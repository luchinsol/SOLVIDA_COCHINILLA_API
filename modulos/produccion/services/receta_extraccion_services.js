import {
  actualizarCodigoRecetaExtraccionRepo,
  crearRecetaExtraccionRepo,
  listarRecetasExtraccionRepo,
  obtenerRecetaExtraccionPorIdRepo,
} from '../repositories/receta_extraccion_repositories.js'

const parseRequiredNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} es obligatorio`)
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} debe ser un numero valido`)
  }

  return parsed
}

const parseOptionalNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} debe ser un numero valido`)
  }

  return parsed
}

const parseRequiredInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} es obligatorio`)
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} debe ser un entero positivo`)
  }

  return parsed
}

const parseOptionalInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed)) {
    throw new Error(`${fieldName} debe ser un entero valido`)
  }

  return parsed
}

const parseOptionalBoolean = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }

  throw new Error(`${fieldName} debe ser true o false`)
}

const padTwo = (value) => String(value).padStart(2, '0')

const formatearVersionCodigo = (version) => String(version).replace(/\./g, '')

const generarCodigoRecetaExtraccion = ({
  receta_extraccion_id,
  version
}) => {
  return `RX-${receta_extraccion_id}-V${formatearVersionCodigo(version)}`
}

/* ======================================================
   CREATE
====================================================== */
export const crearRecetaExtraccionService = async (data) => {
  if (!data.nombre || !String(data.nombre).trim()) {
    throw new Error('nombre es obligatorio')
  }

  const ratioSolidoLiquido = parseOptionalNumber(
    data.ratio_solido_liquido_ext_lit_por_kg,
    'ratio_solido_liquido_ext_lit_por_kg'
  )

  const factorCarbSodioCompuestoInput = parseOptionalNumber(
    data.factor_carb_sodio_compuesto ?? data.factor_carb_sodio_compuesto_g_por_concaclitros,
    'factor_carb_sodio_compuesto_g_por_concaclitros'
  )

  const factorCarbSodioPorPuntosInput = parseOptionalNumber(
    data.factor_carb_sodio_g_por_ptos_ac,
    'factor_carb_sodio_g_por_ptos_ac'
  )

  if (
    factorCarbSodioCompuestoInput !== null &&
    factorCarbSodioPorPuntosInput !== null
  ) {
    throw new Error('No puedes enviar factor_carb_sodio_compuesto_g_por_concaclitros y factor_carb_sodio_g_por_ptos_ac al mismo tiempo')
  }

  if (
    factorCarbSodioCompuestoInput === null &&
    factorCarbSodioPorPuntosInput === null
  ) {
    throw new Error('Debes enviar factor_carb_sodio_compuesto_g_por_concaclitros o factor_carb_sodio_g_por_ptos_ac')
  }

  if (
    factorCarbSodioPorPuntosInput !== null &&
    (ratioSolidoLiquido === null || ratioSolidoLiquido <= 0)
  ) {
    throw new Error('ratio_solido_liquido_ext_lit_por_kg debe ser mayor a 0 para calcular factor_carb_sodio_compuesto_g_por_concaclitros')
  }

  let factorCarbSodioCompuesto = factorCarbSodioCompuestoInput
  let factorCarbSodioPorPuntos = factorCarbSodioPorPuntosInput
  let metodoFactorCarbSodio = null

  if (factorCarbSodioCompuestoInput !== null) {
    metodoFactorCarbSodio = 'compuesto'

    if (ratioSolidoLiquido !== null) {
      factorCarbSodioPorPuntos = factorCarbSodioCompuestoInput * ratioSolidoLiquido
    }
  } else if (factorCarbSodioPorPuntosInput !== null) {
    metodoFactorCarbSodio = 'por_ptos_ac'
    factorCarbSodioCompuesto = factorCarbSodioPorPuntosInput / ratioSolidoLiquido
  }

  const tipoCochinillaId = parseRequiredInteger(data.tipo_cochinilla_id, 'tipo_cochinilla_id')
  const calidadCarminObtenidoId = parseRequiredInteger(
    data.calidad_carmin_obtenido_id,
    'calidad_carmin_obtenido_id'
  )
  const numeroExtraccion = parseRequiredInteger(data.numero_extraccion, 'numero_extraccion')
  const version = '1.0'

  const payloadNormalizado = {
    codigo: null,
    nombre: String(data.nombre).trim(),
    version,
    vigente: true,
    ph_objetivo_buffer: parseRequiredNumber(data.ph_objetivo_buffer, 'ph_objetivo_buffer'),
    ph_objetivo_filtrado: parseRequiredNumber(data.ph_objetivo_filtrado, 'ph_objetivo_filtrado'),
    temperatura_de_formacion_buffer: parseOptionalNumber(
      data.temperatura_de_formacion_buffer,
      'temperatura_de_formacion_buffer'
    ),
    temperatura_de_agregar_cochinilla: parseOptionalNumber(
      data.temperatura_de_agregar_cochinilla,
      'temperatura_de_agregar_cochinilla'
    ),
    temperatura_objetivo_inicio_rxn_gradoscentigrados: parseRequiredNumber(
      data.temperatura_objetivo_inicio_rxn_gradoscentigrados,
      'temperatura_objetivo_inicio_rxn_gradoscentigrados'
    ),
    tiempo_reaccion_min: parseRequiredNumber(data.tiempo_reaccion_min, 'tiempo_reaccion_min'),
    agitacion_rpm: parseRequiredNumber(data.agitacion_rpm, 'agitacion_rpm'),
    factor_carb_sodio_compuesto: factorCarbSodioCompuesto,
    observaciones_para_operarios:
      data.observaciones_para_operarios === undefined ||
      data.observaciones_para_operarios === null ||
      String(data.observaciones_para_operarios).trim() === ''
        ? null
        : String(data.observaciones_para_operarios).trim(),
    creado_por: parseOptionalInteger(data.creado_por, 'creado_por'),
    creado_en: data.creado_en ?? new Date(),
    factor_citrico_g_por_ptos_ac: parseRequiredNumber(
      data.factor_citrico_g_por_ptos_ac,
      'factor_citrico_g_por_ptos_ac'
    ),
    concentracion_extracto_objetivo_pts_ac_por_litros: parseRequiredNumber(
      data.concentracion_extracto_objetivo_pts_ac_por_litros,
      'concentracion_extracto_objetivo_pts_ac_por_litros'
    ),
    ratio_solido_liquido_ext_lit_por_kg: ratioSolidoLiquido,
    comentarios_conclusiones:
      data.comentarios_conclusiones === undefined ||
      data.comentarios_conclusiones === null ||
      String(data.comentarios_conclusiones).trim() === ''
        ? null
        : String(data.comentarios_conclusiones).trim(),
    tipo_cochinilla_id: tipoCochinillaId,
    calidad_carmin_obtenido_id: calidadCarminObtenidoId,
    ph_objetivo_cochinilla: parseOptionalNumber(
      data.ph_objetivo_cochinilla,
      'ph_objetivo_cochinilla'
    ),
    factor_carb_sodio_g_por_ptos_ac: factorCarbSodioPorPuntos,
    metodo_factor_carb_sodio: metodoFactorCarbSodio,
    porcentaje_agua_extraccion: parseOptionalNumber(
      data.porcentaje_agua_extraccion,
      'porcentaje_agua_extraccion'
    ),
    rendimiento_extraccion_esperado: parseOptionalNumber(
      data.rendimiento_extraccion_esperado,
      'rendimiento_extraccion_esperado'
    ),
    numero_extraccion: numeroExtraccion
  }

  const recetaCreada = await crearRecetaExtraccionRepo(payloadNormalizado)

  const codigo = generarCodigoRecetaExtraccion({
    receta_extraccion_id: recetaCreada.receta_extraccion_id,
    version: recetaCreada.version ?? version
  })

  return await actualizarCodigoRecetaExtraccionRepo(recetaCreada.receta_extraccion_id, codigo)
}

export const listarRecetasExtraccionService = async (filters = {}) => {
  const filtrosNormalizados = {
    vigente: parseOptionalBoolean(filters.vigente, 'vigente'),
    numero_extraccion: parseOptionalInteger(filters.numero_extraccion, 'numero_extraccion'),
    tipo_cochinilla_id: parseOptionalInteger(filters.tipo_cochinilla_id, 'tipo_cochinilla_id'),
    calidad_carmin_obtenido_id: parseOptionalInteger(
      filters.calidad_carmin_obtenido_id,
      'calidad_carmin_obtenido_id'
    ),
    ph_objetivo_cochinilla_min: parseOptionalNumber(
      filters.ph_objetivo_cochinilla_min,
      'ph_objetivo_cochinilla_min'
    ),
    ph_objetivo_cochinilla_max: parseOptionalNumber(
      filters.ph_objetivo_cochinilla_max,
      'ph_objetivo_cochinilla_max'
    )
  }

  if (
    filtrosNormalizados.ph_objetivo_cochinilla_min !== null &&
    filtrosNormalizados.ph_objetivo_cochinilla_max !== null &&
    filtrosNormalizados.ph_objetivo_cochinilla_min > filtrosNormalizados.ph_objetivo_cochinilla_max
  ) {
    throw new Error('ph_objetivo_cochinilla_min no puede ser mayor que ph_objetivo_cochinilla_max')
  }

  return await listarRecetasExtraccionRepo(filtrosNormalizados)
}

export const obtenerRecetaExtraccionPorIdService = async (id) => {
  const recetaId = Number(id)

  if (!Number.isInteger(recetaId) || recetaId <= 0) {
    throw new Error('receta_extraccion_id debe ser un entero positivo')
  }

  const receta = await obtenerRecetaExtraccionPorIdRepo(recetaId)

  if (!receta) {
    throw new Error('Receta no encontrada')
  }

  return receta
}
