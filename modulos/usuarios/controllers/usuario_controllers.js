// CAPA DE PRESENTACIÓN - CONTROLADORES
// Aquí se manejan las solicitudes HTTP, se validan los datos de entrada y se llaman a los servicios correspondientes.
// Se importan los servicios necesarios para manejar la lógica de negocio.
// Interactuan con el cliente y devuelven respuestas adecuadas.

import {listarRolesService} from '../services/usuario_services.js'

export const login = async (req, res) => {

  const {nickname, contrasena} = req.body
  try {

    const result = await loginService(nickname, contrasena)
    res.json(result)
    console.log("en controller-login",result)

  } catch (error){

    res.status(500).json({error: error.message})
  }

}

export const getRoles = async (_, res) => {

  try {

    const roles = await listarRolesService()
    
    res.json(roles)
    console.log("en controller")
    console.log(roles)

  } catch (error){

    res.status(500).json({error: error.message})

  }

}

