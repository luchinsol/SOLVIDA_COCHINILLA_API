// CAPA DE DATOS - REPOSITORIOS
// Aquí se manejan las interacciones directas con la base de datos, utilizando consultas SQL o un ORM.
// Se importan las conexiones a la base de datos y se definen funciones para realizar operaciones CRUD.
// Estas funciones son llamadas por los servicios para obtener o modificar datos.

import db from '../../../config/database.js'

export const login = async (nickname, contrasena) => {
  const result = await db.oneOrNone(
    'SELECT * FROM public.usuario WHERE nickname = $1 AND contrasena  = $2',
    [nickname, contrasena]
  )
 // console.log("..en repository-login",result)
  return result
}

// CRUD DE USUARIOS
export const listarUsuariosRepo = async () => {
  const result = await db.query(
    'SELECT * FROM public.usuario'
  )
  return result
}   

export const crearUsuarioRepo = async (usuario) => {
  const result = await db.one(
    'INSERT INTO public.usuario (nickname, contrasena, rol_id) VALUES ($1, $2, $3) RETURNING *',  
    [usuario.nickname, usuario.contrasena, usuario.rol_id]
  )
  return result
}   

