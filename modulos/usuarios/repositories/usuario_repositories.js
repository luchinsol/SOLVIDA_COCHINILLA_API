// CAPA DE DATOS - REPOSITORIOS
// Aquí se manejan las interacciones directas con la base de datos, utilizando consultas SQL o un ORM.
// Se importan las conexiones a la base de datos y se definen funciones para realizar operaciones CRUD.
// Estas funciones son llamadas por los servicios para obtener o modificar datos.

import db from "../../../config/database.js";

// LOGIN DE USUARIOS

export const login = async (nickname, password) => {
  const result = await db.oneOrNone(
    "SELECT * FROM seguridad.usuario WHERE nickname = $1 AND password  = $2",
    [nickname, password],
  );
  return result;
};

export const actualizarUltimoAccesoRepo = async (id) => {
  return await db.oneOrNone(
    `UPDATE seguridad.usuario
     SET ultimo_acceso = NOW()
     WHERE id = $1
     RETURNING *`,
    [id],
  );
};

// CRUD DE USUARIOS
export const listarUsuariosRepo = async (filters = {}) => {
  const values = [];
  const conditions = [];

  if (filters.rol_ids?.length) {
    values.push(filters.rol_ids);
    conditions.push(`u.rol_id = ANY($${values.length}::bigint[])`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const result = await db.query(
    `SELECT
       u.id::int AS id,
       u.nombres,
       u.apellidos,
       u.correo,
       u.rol_id::int AS rol_id,
       r.nombre AS rol_nombre,
       u.departamento,
       CASE
         WHEN u.estado = true THEN 'Activo'
         ELSE 'Bloqueado'
       END AS estado,
       u.ultimo_acceso
     FROM seguridad.usuario u
     LEFT JOIN seguridad.rol r
       ON u.rol_id = r.rol_id
     ${whereClause}
     ORDER BY u.id ASC;`,
    values,
  );
  return result;
};

export const obtenerResumenUsuariosRepo = async () => {
  return await db.one(
    `SELECT
       COUNT(*)::int AS total_usuarios,
       COUNT(*) FILTER (WHERE u.estado = true)::int AS usuarios_activos,
       COUNT(*) FILTER (WHERE u.estado = false)::int AS usuarios_bloqueados
     FROM seguridad.usuario u`
  );
};

export const crearUsuarioRepo = async (usuario) => {
  const result = await db.one(
    "INSERT INTO seguridad.usuario (rol_id, nombre,correo, password,activo,nickname) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      usuario.rol_id,
      usuario.nombre,
      usuario.correo,
      usuario.password,
      usuario.activo,
      usuario.nickname,
    ],
  );
  return result;
};

export const actualizarUsuarioRepo = async (id, usuario) => {
  const result = await db.oneOrNone(
    "UPDATE seguridad.usuario SET rol_id = $1, nombre = $2, correo = $3, password = $4, activo = $5, nickname = $6 WHERE id = $7 RETURNING *",
    [
      usuario.rol_id,
      usuario.nombre,
      usuario.correo,
      usuario.password,
      usuario.activo,
      usuario.nickname,
      id,
    ],
  );
  return result;
};

export const actualizarDatosUsuarioRepo = async (id, usuario) => {
  const result = await db.oneOrNone(
    `UPDATE seguridad.usuario u
     SET
       nombres = $1,
       apellidos = $2,
       correo = $3,
       rol_id = $4
     WHERE u.id = $5
     RETURNING u.id`,
    [
      usuario.nombres,
      usuario.apellidos,
      usuario.correo,
      usuario.rol_id,
      id,
    ],
  );

  if (!result) {
    return null;
  }

  return await db.one(
    `SELECT
       u.id::int AS id,
       u.nombres,
       u.apellidos,
       u.correo,
       u.rol_id::int AS rol_id,
       r.nombre AS rol_nombre,
       u.departamento,
       CASE
         WHEN u.estado = true THEN 'Activo'
         ELSE 'Bloqueado'
       END AS estado,
       u.ultimo_acceso
     FROM seguridad.usuario u
     LEFT JOIN seguridad.rol r
       ON u.rol_id = r.rol_id
     WHERE u.id = $1`,
    [id],
  );
};

export const eliminarUsuarioRepo = async (id) => {
  const result = await db.result(
    "DELETE FROM seguridad.usuario WHERE id = $1",
    [id],
  );
  return result.rowCount > 0;
};
