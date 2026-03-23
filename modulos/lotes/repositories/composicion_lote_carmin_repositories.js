import db from '../../../config/database.js'

// READ: listar todos
export const listarComposicionRepo = async () => {
  const result = await db.query(
    'SELECT * FROM lotes.composicion_lote_carmin'
  )
  return result
}

// READ: por id
export const obtenerComposicionPorIdRepo = async (id) => {
  const result = await db.oneOrNone(
    `SELECT * 
     FROM lotes.composicion_lote_carmin 
     WHERE composicion_lote_carmin_id = $1`,
    [id]
  )
  return result
}

// READ: busqueda por proceso, de todos los componentes de un proceso de mezclado específico
export const obtenerComposicionPorProcesoRepo = async (procesoId) => {
  const result = await db.query(
    `SELECT * 
     FROM lotes.composicion_lote_carmin 
     WHERE proceso_mezclado_id = $1`,
    [procesoId]
  )
  return result
}

// CREATE: crear nueva composición para un proceso de mezclado específico
export const crearComposicionRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO lotes.composicion_lote_carmin
    (
      proceso_mezclado_id,
      lote_carmin_componente_id,
      peso_utilizado_kg,
      porcentaje_participacion,
      observaciones
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      data.proceso_mezclado_id,
      data.lote_carmin_componente_id,
      data.peso_utilizado_kg,
      data.porcentaje_participacion ?? null,
      data.observaciones ?? null
    ]
  )

  return result
}

// UPDATE: actualiza solo peso y observaciones de una composición
export const actualizarComposicionRepo = async (id, data) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.composicion_lote_carmin
     SET
       peso_utilizado_kg = $1,
       observaciones = $2
     WHERE composicion_lote_carmin_id = $3
     RETURNING *`,
    [
      data.peso_utilizado_kg,
      data.observaciones ?? null,
      id
    ]
  )

  return result
}

// UPDATE: actualiza solo el porcentaje de participación de una composición
export const actualizarPorcentajeParticipacionRepo = async (id, porcentaje) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.composicion_lote_carmin
     SET porcentaje_participacion = $1
     WHERE composicion_lote_carmin_id = $2
     RETURNING *`,
    [
      porcentaje,
      id
    ]
  )

  return result
}
// DELETE
export const eliminarComposicionRepo = async (id) => {
  const result = await db.oneOrNone(
    `DELETE FROM lotes.composicion_lote_carmin
     WHERE composicion_lote_carmin_id = $1
     RETURNING *`,
    [id]
  )

  return result
}