import db from '../../../config/database.js'

// READ
export const listarRolesRepo = async () => {

  const result = await db.query(
    `SELECT
       rol_id::int AS rol_id,
       nombre,
       descripcion,
       activo,
       creado_en
     FROM seguridad.rol
     ORDER BY rol_id ASC`
  )
  return result
}

export const listarRolesActivosRepo = async () => {
  const result = await db.query(
    `SELECT
       rol_id::int AS rol_id,
       nombre,
       descripcion,
       activo,
       creado_en
     FROM seguridad.rol
     WHERE activo = true
     ORDER BY rol_id ASC`
  )
  return result
}

// CREATE
export const crearRolesRepo = async (rol) => {
  const result = await db.one(
    'INSERT INTO seguridad.rol (nombre) VALUES ($1) RETURNING *',
    [rol.nombre]
  )
  return result
}

// UPDATE
export const actualizarRolesRepo = async (id, rol) => {
  const result = await db.oneOrNone(
    'UPDATE seguridad.rol SET nombre = $1 WHERE id = $2 RETURNING *',
    [rol.nombre,id]
  )
  return result
}

// DELETE
export const eliminarRolesRepo = async (id) => {
  const result = await db.result(
    'DELETE FROM seguridad.rol WHERE id = $1',
    [id]      
  )
  return result.rowCount > 0
}
