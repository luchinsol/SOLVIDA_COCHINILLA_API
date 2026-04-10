import db from '../../../config/database.js'

/* ======================================================
   CREATE: crear receta de extracción
====================================================== */
export const crearRecetaExtraccionRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO produccion.receta_extraccion
    (
      nombre,
      version,
      vigente,
      ph_objetivo_buffer,
      ph_objetivo_filtrado,
      temperatura_objetivo_gradoscentigrados,
      tiempo_reaccion_min,
      agitacion_rpm,
      factor_carb_sodio_compuesto,
      observaciones_para_operarios,
      creado_por,
      creado_en,
      factor_citrico_kg_por_puntos_ac,
      concentracion_extracto_objetivo_pts_ac_por_litros,
      ratio_solido_liquido_ext_lit_por_kg,
      comentarios_conclusiones,
      tipo_cochinilla_id,
      tipo_carmin_obtenido_id
    )
    VALUES
    (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
    RETURNING *`,
    [
      data.nombre,
      data.version ?? null,
      data.vigente ?? true,
      data.ph_objetivo_buffer,
      data.ph_objetivo_filtrado,
      data.temperatura_objetivo_gradoscentigrados,
      data.tiempo_reaccion_min,
      data.agitacion_rpm,
      data.factor_carb_sodio_compuesto,
      data.observaciones_para_operarios ?? null,
      data.creado_por ?? null,
      data.creado_en ?? null,
      data.factor_citrico_kg_por_puntos_ac,
      data.concentracion_extracto_objetivo_pts_ac_por_litros,
      data.ratio_solido_liquido_ext_lit_por_kg ?? null,
      data.comentarios_conclusiones ?? null,
      data.tipo_cochinilla_id,
      data.tipo_carmin_obtenido_id
    ]
  )

  return result
}

/* ======================================================
   READ: listar todas las recetas
====================================================== */
export const listarRecetasExtraccionRepo = async () => {
  const result = await db.any(
    `SELECT
       r.*,
       tc.nombre AS tipo_cochinilla_nombre,
       tcar.nombre AS tipo_carmin_nombre
     FROM produccion.receta_extraccion r
     LEFT JOIN lotes.tipo_cochinilla tc
       ON r.tipo_cochinilla_id = tc.tipo_cochinilla_id
     LEFT JOIN lotes.tipo_carmin tcar
       ON r.tipo_carmin_obtenido_id = tcar.tipo_carmin_id
     ORDER BY r.receta_extraccion_id DESC`
  )

  return result
}

/* ======================================================
   READ: obtener receta por id
====================================================== */
export const obtenerRecetaExtraccionPorIdRepo = async (id) => {
  const result = await db.oneOrNone(
    `SELECT
       r.*,
       tc.nombre AS tipo_cochinilla_nombre,
       tcar.nombre AS tipo_carmin_nombre
     FROM produccion.receta_extraccion r
     LEFT JOIN lotes.tipo_cochinilla tc
       ON r.tipo_cochinilla_id = tc.tipo_cochinilla_id
     LEFT JOIN lotes.tipo_carmin tcar
       ON r.tipo_carmin_obtenido_id = tcar.tipo_carmin_id
     WHERE r.receta_extraccion_id = $1`,
    [id]
  )

  return result
}

/* ======================================================
   READ: listar recetas vigentes
====================================================== */
export const listarRecetasExtraccionVigentesRepo = async () => {
  const result = await db.any(
    `SELECT
       r.*,
       tc.nombre AS tipo_cochinilla_nombre,
       tcar.nombre AS tipo_carmin_nombre
     FROM produccion.receta_extraccion r
     LEFT JOIN lotes.tipo_cochinilla tc
       ON r.tipo_cochinilla_id = tc.tipo_cochinilla_id
     LEFT JOIN lotes.tipo_carmin tcar
       ON r.tipo_carmin_obtenido_id = tcar.tipo_carmin_id
     WHERE r.vigente = true
     ORDER BY r.receta_extraccion_id DESC`
  )

  return result
}

/* ======================================================
   READ: listar recetas no vigentes
====================================================== */
export const listarRecetasExtraccionNoVigentesRepo = async () => {
  const result = await db.any(
    `SELECT
       r.*,
       tc.nombre AS tipo_cochinilla_nombre,
       tcar.nombre AS tipo_carmin_nombre
     FROM produccion.receta_extraccion r
     LEFT JOIN lotes.tipo_cochinilla tc
       ON r.tipo_cochinilla_id = tc.tipo_cochinilla_id
     LEFT JOIN lotes.tipo_carmin tcar
       ON r.tipo_carmin_obtenido_id = tcar.tipo_carmin_id
     WHERE r.vigente = false
     ORDER BY r.receta_extraccion_id DESC`
  )

  return result
}

/* ======================================================
   READ: obtener recetas por tipo de cochinilla
====================================================== */
export const obtenerRecetasPorTipoCochinillaRepo = async (tipoCochinillaId) => {
  const result = await db.any(
    `SELECT
       r.*,
       tc.nombre AS tipo_cochinilla_nombre,
       tcar.nombre AS tipo_carmin_nombre
     FROM produccion.receta_extraccion r
     LEFT JOIN lotes.tipo_cochinilla tc
       ON r.tipo_cochinilla_id = tc.tipo_cochinilla_id
     LEFT JOIN lotes.tipo_carmin tcar
       ON r.tipo_carmin_obtenido_id = tcar.tipo_carmin_id
     WHERE r.tipo_cochinilla_id = $1
     ORDER BY r.receta_extraccion_id DESC`,
    [tipoCochinillaId]
  )

  return result
}

/* ======================================================
   READ: obtener recetas por tipo de carmín obtenido
====================================================== */
export const obtenerRecetasPorTipoCarminRepo = async (tipoCarminId) => {
  const result = await db.any(
    `SELECT
       r.*,
       tc.nombre AS tipo_cochinilla_nombre,
       tcar.nombre AS tipo_carmin_nombre
     FROM produccion.receta_extraccion r
     LEFT JOIN lotes.tipo_cochinilla tc
       ON r.tipo_cochinilla_id = tc.tipo_cochinilla_id
     LEFT JOIN lotes.tipo_carmin tcar
       ON r.tipo_carmin_obtenido_id = tcar.tipo_carmin_id
     WHERE r.tipo_carmin_obtenido_id = $1
     ORDER BY r.receta_extraccion_id DESC`,
    [tipoCarminId]
  )

  return result
}

/* ======================================================
   UPDATE: actualizar vigente
====================================================== */
export const actualizarVigenciaRecetaExtraccionRepo = async (id, vigente) => {
  const result = await db.oneOrNone(
    `UPDATE produccion.receta_extraccion
     SET vigente = $1
     WHERE receta_extraccion_id = $2
     RETURNING *`,
    [vigente, id]
  )

  return result
}

/* ======================================================
   UPDATE: actualizar observaciones para operarios
====================================================== */
export const actualizarObservacionesOperariosRecetaExtraccionRepo = async (id, observaciones) => {
  const result = await db.oneOrNone(
    `UPDATE produccion.receta_extraccion
     SET observaciones_para_operarios = $1
     WHERE receta_extraccion_id = $2
     RETURNING *`,
    [observaciones ?? null, id]
  )

  return result
}

/* ======================================================
   UPDATE: actualizar comentarios y conclusiones
====================================================== */
export const actualizarComentariosConclusionesRecetaExtraccionRepo = async (id, comentarios) => {
  const result = await db.oneOrNone(
    `UPDATE produccion.receta_extraccion
     SET comentarios_conclusiones = $1
     WHERE receta_extraccion_id = $2
     RETURNING *`,
    [comentarios ?? null, id]
  )

  return result
}

/* ======================================================
   DELETE: eliminar receta
   existe técnicamente, pero por negocio no se recomienda
====================================================== */
export const eliminarRecetaExtraccionRepo = async (id) => {
  const result = await db.oneOrNone(
    `DELETE FROM produccion.receta_extraccion
     WHERE receta_extraccion_id = $1
     RETURNING *`,
    [id]
  )

  return result
}