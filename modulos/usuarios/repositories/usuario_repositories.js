// CAPA DE DATOS - REPOSITORIOS
// Aquí se manejan las interacciones directas con la base de datos, utilizando consultas SQL o un ORM.
// Se importan las conexiones a la base de datos y se definen funciones para realizar operaciones CRUD.
// Estas funciones son llamadas por los servicios para obtener o modificar datos.

import db from '../../../config/database.js'

export const login = async (nombre_ss, password_hash) => {
  console.log("en repository-login",nombre_ss, password_hash)
  const result = await db.oneOrNone(
    'SELECT * FROM seguridad.usuario WHERE nombre = $1 AND password_hash  = $2',
    [nombre_ss, password_hash]
  )
 console.log("..en repository-login",result)
  return result
}

// CRUD DE USUARIOS
export const listarUsuariosRepo = async () => {
  const result = await db.query(
    'SELECT * FROM seguridad.usuario'
  )
  return result
}   

export const crearUsuarioRepo = async (usuario) => {
  const result = await db.one(
    'INSERT INTO seguridad.usuario (nickname, contrasena, rol_id) VALUES ($1, $2, $3) RETURNING *',  
    [usuario.nickname, usuario.contrasena, usuario.rol_id]
  )
  return result
}   

