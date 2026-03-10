const usuarioService = require('../services/usuarioService')

async function getUsuarios(req, res){

  try {

    const usuarios = await usuarioService.listarUsuarios()

    res.json(usuarios)

  } catch (error){

    res.status(500).json({error: error.message})

  }

}

async function crearUsuario(req, res){

  try{

    const usuario = await usuarioService.crearUsuario(req.body)

    res.status(201).json(usuario)

  }catch(error){

    res.status(400).json({error: error.message})

  }

}

module.exports = {
  getUsuarios,
  crearUsuario
}