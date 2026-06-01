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

export const existeUsuarioPorCorreoRepo = async (correo) => {
  return await db.oneOrNone(
    `SELECT id
     FROM seguridad.usuario
     WHERE LOWER(correo) = LOWER($1)`,
    [correo],
  );
};

export const existeUsuarioPorNicknameRepo = async (nickname) => {
  return await db.oneOrNone(
    `SELECT id
     FROM seguridad.usuario
     WHERE LOWER(nickname) = LOWER($1)`,
    [nickname],
  );
};

export const crearUsuarioRepo = async (usuario) => {
  const result = await db.one(
    `INSERT INTO seguridad.usuario
     (rol_id, nombres, apellidos, correo, password, estado, nickname, dni, departamento)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      usuario.rol_id,
      usuario.nombres,
      usuario.apellidos,
      usuario.correo,
      usuario.password,
      usuario.estado,
      usuario.nickname,
      usuario.dni,
      usuario.departamento,
    ],
  );

  return await db.one(
    `SELECT
       u.id::int AS id,
       u.nombres,
       u.apellidos,
       u.correo,
       u.rol_id::int AS rol_id,
       r.nombre AS rol_nombre,
       u.dni,
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
    [result.id],
  );
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
       nombres = COALESCE($1, u.nombres),
       apellidos = COALESCE($2, u.apellidos),
       correo = COALESCE($3, u.correo),
       rol_id = COALESCE($4, u.rol_id),
       estado = COALESCE($5, u.estado)
     WHERE u.id = $6
     RETURNING u.id`,
    [
      usuario.nombres,
      usuario.apellidos,
      usuario.correo,
      usuario.rol_id,
      usuario.estado,
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
