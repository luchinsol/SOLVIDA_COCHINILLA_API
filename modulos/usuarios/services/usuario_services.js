// CAPA DE LOGICA DE NEGOCIO - SERVICIOS
// Aquí se maneja la lógica de negocio, se realizan validaciones y se llaman a los repos


import {
  login,
  listarUsuariosRepo,
  obtenerResumenUsuariosRepo,
  crearUsuarioRepo,
  actualizarDatosUsuarioRepo,
  actualizarUsuarioRepo,
  eliminarUsuarioRepo
} from '../repositories/usuario_repositories.js'
import { actualizarUltimoAccesoRepo } from '../repositories/usuario_repositories.js'

// olas bolas


export const loginService = async (nombre, password_hash) => {
  const result = await login(nombre, password_hash)
  if (!result) {
    return null
  }

  const usuarioActualizado = await actualizarUltimoAccesoRepo(result.id)
  return usuarioActualizado ?? result
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
  const newUsuario = await crearUsuarioRepo(usuario);
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
    usuario.rol_id === undefined
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

  const updatedUsuario = await actualizarDatosUsuarioRepo(parsedId, {
    nombres: usuario.nombres ?? null,
    apellidos: usuario.apellidos ?? null,
    correo: usuario.correo ?? null,
    rol_id: parsedRolId
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
