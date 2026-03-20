// CAPA DE LOGICA DE NEGOCIO - SERVICIOS
// Aquí se maneja la lógica de negocio, se realizan validaciones y se llaman a los repos


import { login} from '../repositories/usuario_repositories.js'

// olas bolas


export const loginService = async (nombre, password_hash) => {
  const result = await login(nombre, password_hash)
 // console.log("..en service-login",result)
  return result
}

export const listarRolesService = async () => {
  console.log('en service')
  const roles = await listarRolesRepo() // Ensure the function is executed
  console.log('..en service', roles)
  return roles
}

// hola sariwis estoy enojado