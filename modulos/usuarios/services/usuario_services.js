// CAPA DE LOGICA DE NEGOCIO - SERVICIOS
// Aquí se maneja la lógica de negocio, se realizan validaciones y se llaman a los repos


import {
  login,
  listarUsuariosRepo,
  obtenerResumenUsuariosRepo,
  existeUsuarioPorCorreoRepo,
  existeUsuarioPorNicknameRepo,
  crearUsuarioRepo,
  actualizarDatosUsuarioRepo,
  actualizarUsuarioRepo,
  eliminarUsuarioRepo
} from '../repositories/usuario_repositories.js'
import { actualizarUltimoAccesoRepo } from '../repositories/usuario_repositories.js'
import { obtenerAccesosPorRolService } from './rol_permiso_services.js'

// olas bolas


export const loginService = async (nombre, password_hash) => {
  const result = await login(nombre, password_hash)
  if (!result) {
    return null
  }

  const usuarioActualizado = await actualizarUltimoAccesoRepo(result.id)
  const usuario = usuarioActualizado ?? result
  const accesos = await obtenerAccesosPorRolService(usuario.rol_id)

  return {
    usuario,
    ...accesos
  }
}

export const listarUsuariosService = async (filters = {}) => {
  const parsedFilters = {};

  if (filters.rol_id !== undefined && filters.rol_id !== null && filters.rol_id !== '') {
    const rolIds = String(filters.rol_id)
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));

    if (
      rolIds.length === 0 ||
      rolIds.some((value) => !Number.isInteger(value) || value <= 0)
    ) {
      throw new Error('rol_id debe ser un entero positivo o una lista de enteros positivos');
    }

    parsedFilters.rol_ids = rolIds;
  }

  const usuarios = await listarUsuariosRepo(parsedFilters)
  return usuarios
}

export const obtenerResumenUsuariosService = async () => {
  const resumen = await obtenerResumenUsuariosRepo()

  return {
    total_usuarios: resumen.total_usuarios,
    estados: [
      {
        estado: 'Activo',
        total: resumen.usuarios_activos
      },
      {
        estado: 'Bloqueado',
        total: resumen.usuarios_bloqueados
      }
    ]
  }
}

export const createUsuarioService = async (usuario) => {
  if (!usuario.nombres || !String(usuario.nombres).trim()) {
    throw new Error('nombres es obligatorio')
  }

  if (!usuario.apellidos || !String(usuario.apellidos).trim()) {
    throw new Error('apellidos es obligatorio')
  }

  if (usuario.rol_id === undefined || usuario.rol_id === null || usuario.rol_id === '') {
    throw new Error('rol_id es obligatorio')
  }

  if (!usuario.correo || !String(usuario.correo).trim()) {
    throw new Error('correo es obligatorio')
  }

  if (!usuario.nickname || !String(usuario.nickname).trim()) {
    throw new Error('nickname es obligatorio')
  }

  if (usuario.dni === undefined || usuario.dni === null || usuario.dni === '') {
    throw new Error('dni es obligatorio')
  }

  if (!usuario.departamento || !String(usuario.departamento).trim()) {
    throw new Error('departamento es obligatorio')
  }

  const parsedRolId = Number(usuario.rol_id)
  const parsedDni = Number(usuario.dni)

  if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
    throw new Error('rol_id debe ser un entero positivo')
  }

  if (!Number.isFinite(parsedDni) || parsedDni <= 0) {
    throw new Error('dni debe ser un numero valido')
  }

  const correo = String(usuario.correo).trim()
  const nickname = String(usuario.nickname).trim()

  const usuarioPorCorreo = await existeUsuarioPorCorreoRepo(correo)
  if (usuarioPorCorreo) {
    throw new Error('correo ya registrado')
  }

  const usuarioPorNickname = await existeUsuarioPorNicknameRepo(nickname)
  if (usuarioPorNickname) {
    throw new Error('nickname ya registrado')
  }

  const newUsuario = await crearUsuarioRepo({
    nombres: String(usuario.nombres).trim(),
    apellidos: String(usuario.apellidos).trim(),
    rol_id: parsedRolId,
    correo,
    password: String(usuario.password ?? parsedDni).trim(),
    nickname,
    dni: parsedDni,
    departamento: String(usuario.departamento).trim(),
    estado: usuario.estado ?? true
  });
  return newUsuario;
}

export const updateUsuarioService = async (id, usuario) => {
  const updatedUsuario = await actualizarUsuarioRepo(id, usuario);
  return updatedUsuario;
}

export const patchDatosUsuarioService = async (id, usuario) => {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error('id debe ser un entero positivo');
  }

  if (
    usuario.nombres === undefined &&
    usuario.apellidos === undefined &&
    usuario.correo === undefined &&
    usuario.rol_id === undefined &&
    usuario.estado === undefined
  ) {
    throw new Error('Debes enviar al menos un campo para actualizar');
  }

  let parsedRolId = null;

  if (usuario.rol_id !== undefined && usuario.rol_id !== null && usuario.rol_id !== '') {
    parsedRolId = Number(usuario.rol_id);

    if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
      throw new Error('rol_id debe ser un entero positivo');
    }
  }

  let parsedEstado = null;

  if (usuario.estado !== undefined) {
    if (typeof usuario.estado !== 'boolean') {
      throw new Error('estado debe ser booleano');
    }

    parsedEstado = usuario.estado;
  }

  const updatedUsuario = await actualizarDatosUsuarioRepo(parsedId, {
    nombres: usuario.nombres !== undefined ? usuario.nombres : null,
    apellidos: usuario.apellidos !== undefined ? usuario.apellidos : null,
    correo: usuario.correo !== undefined ? usuario.correo : null,
    rol_id: parsedRolId,
    estado: parsedEstado
  });

  if (!updatedUsuario) {
    throw new Error('Usuario no encontrado');
  }

  return updatedUsuario;
}

export const deleteUsuarioService = async (id) => {
  const deleted = await eliminarUsuarioRepo(id);
  return deleted;
}
