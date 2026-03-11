// CAPA DE PRESENTACIÓN - CONTROLADORES
// Aquí se manejan las solicitudes HTTP, se validan los datos de entrada y se llaman a los servicios correspondientes.
// Se importan los servicios necesarios para manejar la lógica de negocio.
// Interactuan con el cliente y devuelven respuestas adecuadas.

import { listarRolesRepo,createRolRepo } from "../repositories/usuario_repositories.js"

export const getRoles = async (req, res) => {

  try {

    const roles = await listarRolesRepo()
    console.log(roles)
    res.json(roles)

  } catch (error){

    res.status(500).json({error: error.message})

  }

}

export const crearRoles = async (req, res) => {

  try{

    const rol = await createRolRepo(req.body)

    res.status(201).json(rol)

  }catch(error){

    res.status(400).json({error: error.message})

  }

}

