import {
  crearLoteCochinillaRepo,
  listarLotesCochinillaRepo,
  obtenerLoteCochinillaPorIdRepo,
  actualizarAnalisisLoteCochinillaRepo,
  actualizarConsumoLoteCochinillaRepo,
  eliminarLoteCochinillaRepo
} from '../repositories/lote_cochinilla_repositories.js'

/* ======================================================
   CREATE
====================================================== */
export const crearLoteCochinillaService = async (data) => {
  return await crearLoteCochinillaRepo({
    ...data,
    estado: data.estado ?? 'disponible'
  })
}

/* ======================================================
   READ
====================================================== */
export const listarLotesCochinillaService = async () => {
  return await listarLotesCochinillaRepo()
}

export const obtenerLoteCochinillaPorIdService = async (id) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  return lote
}

/* ======================================================
   UPDATE: análisis
====================================================== */
export const actualizarAnalisisLoteCochinillaService = async (id, data) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  return await actualizarAnalisisLoteCochinillaRepo(id, {
    analisis_actual_id: data.analisis_actual_id,
    concentracion_ac_actual: data.concentracion_ac_actual,
    humedad_actual: data.humedad_actual
  })
}

/* ======================================================
   UPDATE: consumo
====================================================== */
export const actualizarConsumoLoteCochinillaService = async (id, data) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  if (data.masa_total_kg == null || Number(data.masa_total_kg) < 0) {
    throw new Error('La masa_total_kg no puede ser negativa')
  }

  if (!data.estado) {
    throw new Error('El estado es obligatorio')
  }

  return await actualizarConsumoLoteCochinillaRepo(id, {
    masa_total_kg: data.masa_total_kg,
    estado: data.estado
  })
}

/* ======================================================
   DELETE
====================================================== */
export const eliminarLoteCochinillaService = async (id) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  return await eliminarLoteCochinillaRepo(id)
}