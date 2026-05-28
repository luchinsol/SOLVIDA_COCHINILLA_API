import db from '../../../config/database.js'

export const listarPermisosRepo = async () => {
  return await db.query(
    `SELECT
       p.permiso_id::int AS permiso_id,
       p.codigo,
       p.descripcion,
       p.modulo_id::int AS modulo_id,
       m.nombre AS modulo_nombre,
       p.recurso,
       p.accion,
       p.alcance
     FROM seguridad.permiso p
     LEFT JOIN seguridad.modulo m
       ON p.modulo_id = m.modulo_id
     ORDER BY p.permiso_id ASC`
  )
}

export const listarCatalogoPermisosRepo = async ({ moduloId = null } = {}) => {
  const values = []
  const conditions = []

  if (moduloId != null) {
    values.push(moduloId)
    conditions.push(`p.modulo_id = $${values.length}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return await db.query(
    `SELECT
       p.permiso_id::int AS permiso_id,
       p.codigo,
       p.descripcion,
       p.modulo_id::int AS modulo_id,
       m.nombre AS modulo_nombre,
       p.recurso,
       p.accion,
       p.alcance
     FROM seguridad.permiso p
     LEFT JOIN seguridad.modulo m
       ON p.modulo_id = m.modulo_id
     ${whereClause}
     ORDER BY p.modulo_id ASC, p.recurso ASC, p.accion ASC, p.permiso_id ASC`,
    values
  )
}

export const obtenerModuloPorIdRepo = async (moduloId) => {
  return await db.oneOrNone(
    `SELECT
       modulo_id::int AS modulo_id,
       nombre
     FROM seguridad.modulo
     WHERE modulo_id = $1`,
    [moduloId]
  )
}

export const crearPermisoRepo = async (permiso) => {
  return await db.one(
    `WITH inserted AS (
       INSERT INTO seguridad.permiso
       (codigo, descripcion, recurso, accion, alcance, modulo_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *
     )
     SELECT
       i.permiso_id::int AS permiso_id,
       i.codigo,
       i.descripcion,
       i.modulo_id::int AS modulo_id,
       m.nombre AS modulo_nombre,
       i.recurso,
       i.accion,
       i.alcance
     FROM inserted i
     LEFT JOIN seguridad.modulo m
       ON i.modulo_id = m.modulo_id`,
    [
      permiso.codigo,
      permiso.descripcion ?? null,
      permiso.recurso,
      permiso.accion,
      permiso.alcance ?? null,
      permiso.modulo_id
    ]
  )
}
