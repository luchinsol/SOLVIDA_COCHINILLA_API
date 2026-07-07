import db from '../../../config/database.js'

export const crearProcesoExtraccionRepo = async (procesoExtraccion) => {
  const result = await db.one(
    `INSERT INTO produccion.proceso_extraccion
    (
      receta_extraccion_id,
      usuario_id,
      lote_cochinilla_id,
      masa_cochinilla_kg,
      codigo_proceso,
      estado_proceso_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      procesoExtraccion.receta_extraccion_id,
      procesoExtraccion.usuario_id,
      procesoExtraccion.lote_cochinilla_id,
      procesoExtraccion.masa_cochinilla_kg,
      procesoExtraccion.codigo_proceso ?? null,
      procesoExtraccion.estado_proceso_id ?? 1
    ]
  )

  return result
}

export const actualizarCodigoProcesoExtraccionRepo = async (id, codigoProceso) => {
  const result = await db.one(
    `UPDATE produccion.proceso_extraccion
     SET codigo_proceso = $1
     WHERE proceso_extraccion_id = $2
     RETURNING *`,
    [codigoProceso, id]
  )

  return result
}
