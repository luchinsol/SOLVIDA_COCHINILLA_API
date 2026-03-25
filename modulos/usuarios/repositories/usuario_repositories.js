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
  console.log("..en repository-login", result);
  return result;
};

// CRUD DE USUARIOS
export const listarUsuariosRepo = async () => {
  const result = await db.query(
    "SELECT * FROM seguridad.usuario ORDER BY id ASC;",
  );
  return result;
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

export const eliminarUsuarioRepo = async (id) => {
  const result = await db.result(
    "DELETE FROM seguridad.usuario WHERE id = $1",
    [id],
  );
  return result.rowCount > 0;
};
