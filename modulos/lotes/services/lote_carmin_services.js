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
  return await buscarLotesCarminConFiltrosRepo(filtros)
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