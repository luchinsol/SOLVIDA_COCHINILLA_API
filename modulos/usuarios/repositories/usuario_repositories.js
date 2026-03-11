// CAPA DE DATOS - REPOSITORIOS
// Aquí se manejan las interacciones directas con la base de datos, utilizando consultas SQL o un ORM.
// Se importan las conexiones a la base de datos y se definen funciones para realizar operaciones CRUD.
// Estas funciones son llamadas por los servicios para obtener o modificar datos.

import db from '../../../config/database.js'

export const listarRolesRepo = async () => {

  const result = await db.query(
    'SELECT * FROM rol'
  )

  return result.rows
}

export const createRolRepo = async (rol) => {
  const result = await db.query(
    'INSERT INTO rol(nombre) VALUES($1) RETURNING *',
    [rol.nombre]
  )

  return result.rows[0]
}
