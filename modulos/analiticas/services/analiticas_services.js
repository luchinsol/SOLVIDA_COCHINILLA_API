const usuarioRepository = require('../repositories/usuarioRepository')

async function listarUsuarios(){

  return await usuarioRepository.getAllUsuarios()

}

async function crearUsuario(data){

  if(!data.nombre || !data.email){
    throw new Error('Nombre y email son obligatorios')
  }

  return await usuarioRepository.createUsuario(data)

}

module.exports = {
  listarUsuarios,
  crearUsuario
}