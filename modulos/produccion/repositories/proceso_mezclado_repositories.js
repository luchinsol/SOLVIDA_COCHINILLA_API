// CRUD DE PROCESO MEZCLADO

import db from '../../../config/database.js'

// READ: trae todos los registros
export const listarProcesoMezcladoRepo = async () => {
  const result = await db.query(
    'SELECT * FROM produccion.proceso_mezclado'
  )
  return result
}

// READ: trae por id
export const obtenerProcesoMezcladoPorIdRepo = async (id) => {
  const result = await db.oneOrNone(
    'SELECT * FROM produccion.proceso_mezclado WHERE id = $1',
    [id]
  )
  return result
}

// CREATE
export const crearProcesoMezcladoRepo = async (procesoMezclado) => {
  const result = await db.one(
    `INSERT INTO produccion.proceso_mezclado
    (
      usuario_id,
      codigo_proceso,
      fecha_inicio,
      fecha_fin,
      estado,
      peso_objetivo_kg,
      concentracion_objetivo_ac,
      color_l_objetivo,
      color_a_objetivo,
      color_b_objetivo,
      observaciones
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      procesoMezclado.usuario_id,
      procesoMezclado.codigo_proceso,
      procesoMezclado.fecha_inicio ?? null,
      procesoMezclado.fecha_fin ?? null,
      procesoMezclado.estado ?? 'planificado',
      procesoMezclado.peso_objetivo_kg ?? null,
      procesoMezclado.concentracion_objetivo_ac ?? null,
      procesoMezclado.color_l_objetivo ?? null,
      procesoMezclado.color_a_objetivo ?? null,
      procesoMezclado.color_b_objetivo ?? null,
      procesoMezclado.observaciones ?? null
    ]
  )

  return result
}

// UPDATE: iniciar proceso
export const iniciarProcesoMezcladoRepo = async (id) => {
  const result = await db.oneOrNone(
    `UPDATE produccion.proceso_mezclado
     SET estado = 'en_curso',
         fecha_inicio = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  )

  return result
}

// UPDATE: finalizar proceso
export const finalizarProcesoMezcladoRepo = async (id) => {
  const result = await db.oneOrNone(
    `UPDATE produccion.proceso_mezclado
     SET estado = 'finalizado',
         fecha_fin = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  )

  return result
}

// DELETE: elimina un proceso de mezclado por id
export const eliminarProcesoMezcladoRepo = async (id) => {
  const result = await db.oneOrNone(
    `DELETE FROM produccion.proceso_mezclado
     WHERE id = $1
     RETURNING *`,
    [id]
  )

  return result
}