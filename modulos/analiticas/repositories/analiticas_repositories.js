const db = require('../../../config/database')

async function getAllUsuarios() {

  const result = await db.query(
    'SELECT id, nombre, email FROM usuarios'
  )

  return result.rows
}

async function createUsuario(usuario){

  const result = await db.query(
    'INSERT INTO usuarios(nombre,email) VALUES($1,$2) RETURNING *',
    [usuario.nombre, usuario.email]
  )

  return result.rows[0]
}

module.exports = {
  getAllUsuarios,
  createUsuario
}