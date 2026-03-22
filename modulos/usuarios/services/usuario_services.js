// CAPA DE LOGICA DE NEGOCIO - SERVICIOS
// Aquí se maneja la lógica de negocio, se realizan validaciones y se llaman a los repos


import { login,listarUsuariosRepo,crearUsuarioRepo,actualizarUsuarioRepo,eliminarUsuarioRepo} from '../repositories/usuario_repositories.js'

// olas bolas


export const loginService = async (nombre, password_hash) => {
  const result = await login(nombre, password_hash)
 // console.log("..en service-login",result)
  return result
}

export const listarUsuariosService = async () => {
  console.log('en service')
  const usuarios = await listarUsuariosRepo() // Ensure the function is executed
  console.log('..en service', usuarios)
  return usuarios
}

export const createUsuarioService = async (usuario) => {
  const newUsuario = await crearUsuarioRepo(usuario);
  return newUsuario;
}

export const updateUsuarioService = async (id, usuario) => {
  const updatedUsuario = await actualizarUsuarioRepo(id, usuario);
  return updatedUsuario;
}

export const deleteUsuarioService = async (id) => {
  const deleted = await eliminarUsuarioRepo(id);
  return deleted;
}