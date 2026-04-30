import {
  crearLoteCarminDesdeLaqueoRepo,
  crearLoteCarminDesdeMoliendaRepo,
  crearLoteCarminDesdeMezcladoRepo,
  listarLotesCarminRepo,
  obtenerLoteCarminPorIdRepo,
  buscarLotesCarminConFiltrosRepo,
  listarLotesCarminSinAnalisisRepo,
  obtenerLotesCarminPorProcesoLaqueoRepo,
  obtenerLotesCarminPorProcesoMoliendaRepo,
  obtenerLotesCarminPorProcesoMezcladoRepo,
  actualizarResultadosAnalisisLoteCarminRepo,
  actualizarObservacionesLoteCarminRepo,
  bloquearLoteCarminRepo
} from '../repositories/lote_carmin_repositories.js'

import db from '../../../config/database.js'

/* ======================================================
   🔢 CORRELATIVO DEL DÍA
====================================================== */
const obtenerCorrelativoDelDia = async () => {
  const result = await db.one(`
    SELECT COUNT(*) 
    FROM lotes.lote_carmin
    WHERE DATE(fecha_creacion) = CURRENT_DATE
  `)

  return parseInt(result.count) + 1
}

/* ======================================================
   🧠 GENERAR CÓDIGO DE LOTE (SOLO POST-ANÁLISIS)
====================================================== */
const generarCodigoLote = async (data, correlativo) => {
  const prefijo = 'LKCTSA'

  // ===== CALIDAD =====
  let cc = 'ST'
  if (data.calidad_lote === 'high_tint') cc = 'HT'
  if (data.calidad_lote === 'guerra') cc = 'GE'

  // ===== FECHA DDDYY =====
  const hoy = new Date()
  const year = hoy.getFullYear().toString().slice(-2)

  const start = new Date(hoy.getFullYear(), 0, 0)
  const diff = hoy - start
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)

  const ddd = String(day).padStart(3, '0')
  const fecha = `${ddd}${year}`

  // ===== CORRELATIVO =====
  const lll = String(correlativo).padStart(3, '0')

  // ===== TIPO =====
  let tipo = 'O'
  if (data.tipo_lote === 'nadante') tipo = 'N'
  if (data.tipo_lote === 'piso') tipo = 'F'

  return `${prefijo}-${cc}-${fecha}-${lll}-${tipo}`
}

/* ======================================================
   🧪 CREATE: LAQUEO (NO MOLIDO)
====================================================== */
export const crearLoteDesdeLaqueoService = async (data) => {
  return await crearLoteCarminDesdeLaqueoRepo({
    ...data,
    codigo_lote: null,
    estado_lote: 'por_moler'
  })
}

/* ======================================================
   ⚙️ CREATE: MOLIENDA
====================================================== */
export const crearLoteDesdeMoliendaService = async (data) => {
  return await crearLoteCarminDesdeMoliendaRepo({
    ...data,
    codigo_lote: null,
    estado_lote: 'por_analizar'
  })
}

/* ======================================================
   🔄 CREATE: MEZCLADO (BLEND)
====================================================== */
export const crearLoteDesdeMezcladoService = async (data) => {
  return await crearLoteCarminDesdeMezcladoRepo({
    ...data,
    codigo_lote: null,
    estado_lote: 'por_analizar'
  })
}

/* ======================================================
   🔬 ANÁLISIS → GENERA CÓDIGO + DISPONIBLE
====================================================== */
export const actualizarResultadosAnalisisService = async (id, data) => {
  const correlativo = await obtenerCorrelativoDelDia()

  const codigo = await generarCodigoLote(
    {
      tipo_lote: data.tipo_lote,
      calidad_lote: data.calidad_lote
    },
    correlativo
  )

  return await actualizarResultadosAnalisisLoteCarminRepo(id, {
    ...data,
    codigo_lote: codigo,
    estado_lote: 'disponible'
  })
}

/* ======================================================
   📝 OBSERVACIONES
====================================================== */
export const actualizarObservacionesService = async (id, observaciones) => {
  return await actualizarObservacionesLoteCarminRepo(id, observaciones)
}

/* ======================================================
   🚫 BLOQUEAR LOTE
====================================================== */
export const bloquearLoteService = async (id) => {
  return await bloquearLoteCarminRepo(id)
}

/* ======================================================
   📖 READS
====================================================== */

export const listarLotesService = async () => {
  return await listarLotesCarminRepo()
}

export const obtenerLotePorIdService = async (id) => {
  return await obtenerLoteCarminPorIdRepo(id)
}

export const buscarLotesConFiltrosService = async (filtros) => {
  const parsedFiltros = { ...filtros }

  const numericFields = [
    'concentracion_min',
    'concentracion_max',
    'stock_actual_min',
    'stock_actual_max',
    'stock_inicial_min',
    'stock_inicial_max',
    'color_l_actual_min',
    'color_l_actual_max',
    'color_a_actual_min',
    'color_a_actual_max',
    'color_b_actual_min',
    'color_b_actual_max',
    'color_l_min',
    'color_l_max',
    'color_a_min',
    'color_a_max',
    'color_b_min',
    'color_b_max'
  ]

  for (const field of numericFields) {
    if (parsedFiltros[field] != null && parsedFiltros[field] !== '') {
      const value = Number(parsedFiltros[field])

      if (Number.isNaN(value)) {
        throw new Error(`${field} debe ser numérico`)
      }

      parsedFiltros[field] = value
    }
  }

  const integerFields = [
    'almacen_id',
    'proceso_laqueo_id',
    'proceso_molienda_id',
    'proceso_mezclado_id'
  ]

  for (const field of integerFields) {
    if (parsedFiltros[field] != null && parsedFiltros[field] !== '') {
      const value = Number(parsedFiltros[field])

      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${field} debe ser un entero positivo`)
      }

      parsedFiltros[field] = value
    }
  }

  // Compatibilidad temporal con clientes viejos que aun envian masa_min/massa_max.
  if (parsedFiltros.masa_min != null && parsedFiltros.masa_min !== '') {
    const value = Number(parsedFiltros.masa_min)

    if (Number.isNaN(value)) {
      throw new Error('masa_min debe ser numérico')
    }

    parsedFiltros.stock_actual_min = value
  }

  if (parsedFiltros.masa_max != null && parsedFiltros.masa_max !== '') {
    const value = Number(parsedFiltros.masa_max)

    if (Number.isNaN(value)) {
      throw new Error('masa_max debe ser numérico')
    }

    parsedFiltros.stock_actual_max = value
  }

  if (parsedFiltros.color_l_actual_min != null && parsedFiltros.color_l_actual_min !== '') {
    parsedFiltros.color_l_min = parsedFiltros.color_l_actual_min
  }

  if (parsedFiltros.color_l_actual_max != null && parsedFiltros.color_l_actual_max !== '') {
    parsedFiltros.color_l_max = parsedFiltros.color_l_actual_max
  }

  if (parsedFiltros.color_a_actual_min != null && parsedFiltros.color_a_actual_min !== '') {
    parsedFiltros.color_a_min = parsedFiltros.color_a_actual_min
  }

  if (parsedFiltros.color_a_actual_max != null && parsedFiltros.color_a_actual_max !== '') {
    parsedFiltros.color_a_max = parsedFiltros.color_a_actual_max
  }

  if (parsedFiltros.color_b_actual_min != null && parsedFiltros.color_b_actual_min !== '') {
    parsedFiltros.color_b_min = parsedFiltros.color_b_actual_min
  }

  if (parsedFiltros.color_b_actual_max != null && parsedFiltros.color_b_actual_max !== '') {
    parsedFiltros.color_b_max = parsedFiltros.color_b_actual_max
  }

  return await buscarLotesCarminConFiltrosRepo(parsedFiltros)
}

export const listarLotesSinAnalisisService = async () => {
  return await listarLotesCarminSinAnalisisRepo()
}

export const obtenerPorProcesoLaqueoService = async (id) => {
  return await obtenerLotesCarminPorProcesoLaqueoRepo(id)
}

export const obtenerPorProcesoMoliendaService = async (id) => {
  return await obtenerLotesCarminPorProcesoMoliendaRepo(id)
}

export const obtenerPorProcesoMezcladoService = async (id) => {
  return await obtenerLotesCarminPorProcesoMezcladoRepo(id)
}
