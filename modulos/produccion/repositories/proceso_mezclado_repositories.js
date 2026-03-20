//crud DE PROCESO MEZCLADO

import db from '../../../config/database.js'

export const listarProcesoMezcladoRepo = async () => {
  const result = await db.query(
    'SELECT * FROM proceso.proceso_mezclado'
  )
  return result
}

export const crearProcesoMezcladoRepo = async (procesoMezclado) => {
  const result = await db.one(
    'INSERT INTO public.proceso_mezclado (fecha, hora_inicio, hora_fin, lote_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [procesoMezclado.fecha, procesoMezclado.hora_inicio, procesoMezclado.hora_fin, procesoMezclado.lote_id]
  )
  return result
}

export const actualizarProcesoMezcladoRepo = async (id, procesoMezclado) => {
  const result = await db.oneOrNone(
    'UPDATE public.proceso_mezclado SET fecha = $1, hora_inicio = $2, hora_fin = $3, lote_id = $4 WHERE id = $5 RETURNING *',
    [procesoMezclado.fecha, procesoMezclado.hora_inicio, procesoMezclado.hora_fin, procesoMezclado.lote_id, id]
  )
  return result
}

export const eliminarProcesoMezcladoRepo = async (id) => {
  const result = await db.result(
    'DELETE FROM public.proceso_mezclado WHERE id = $1',
    [id]
  )
  return result.rowCount > 0
}       