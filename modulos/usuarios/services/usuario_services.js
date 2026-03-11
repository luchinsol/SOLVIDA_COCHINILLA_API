// CAPA DE LOGICA DE NEGOCIO - SERVICIOS
// Aquí se maneja la lógica de negocio, se realizan validaciones y se llaman a los repos

import { listarRolesRepo,createRolRepo} from '../repositories/usuario_repositories.js'

export const listarRoles = async () => {

  return await listarRolesRepo()

}

export const crearRoles = async (data) => {

  if(!data.nombre){
    throw new Error('Nombre es obligatorio')
  }

  return await createRolRepo(data)

}
