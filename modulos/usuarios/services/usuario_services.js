// CAPA DE LOGICA DE NEGOCIO - SERVICIOS
// Aquí se maneja la lógica de negocio, se realizan validaciones y se llaman a los repos

import { listarRolesRepo,login} from '../repositories/usuario_repositories.js'

export const loginService = async (nickname, contrasena) => {
  const result = await login(nickname, contrasena)
  console.log("..en service-login",result)
  return result
}

export const listarRolesService = async () => {
  console.log('en service')
  const roles = await listarRolesRepo() // Ensure the function is executed
  console.log('..en service', roles)
  return roles
}

