import {
  listarPermisosPorRolRepo,
  tienePermisoPorRolRepo,
  crearRolPermisoRepo
} from '../repositories/rol_permiso_repositories.js'

export const listarPermisosPorRolService = async (rolId) => {
  if (rolId === undefined || rolId === null || rolId === '') {
    return await listarPermisosPorRolRepo()
  }

  const parsedRolId = Number(rolId)

  if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
    throw new Error('rol_id debe ser un entero positivo')
  }

  return await listarPermisosPorRolRepo(parsedRolId)
}

export const crearRolPermisoService = async (data) => {
  if (data.rol_id === undefined || data.rol_id === null || data.rol_id === '') {
    throw new Error('rol_id es obligatorio')
  }

  if (data.permiso_id === undefined || data.permiso_id === null || data.permiso_id === '') {
    throw new Error('permiso_id es obligatorio')
  }

  const rolId = Number(data.rol_id)
  const permisoId = Number(data.permiso_id)

  if (!Number.isInteger(rolId) || rolId <= 0) {
    throw new Error('rol_id debe ser un entero positivo')
  }

  if (!Number.isInteger(permisoId) || permisoId <= 0) {
    throw new Error('permiso_id debe ser un entero positivo')
  }

  return await crearRolPermisoRepo(rolId, permisoId)
}

export const verificarPermisoPorRolService = async (rolId, permisoCodigo) => {
  const parsedRolId = Number(rolId)

  if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
    throw new Error('rol_id del token no es valido')
  }

  if (!permisoCodigo || !String(permisoCodigo).trim()) {
    throw new Error('permiso.codigo es obligatorio')
  }

  const permiso = await tienePermisoPorRolRepo(parsedRolId, String(permisoCodigo).trim())
  return Boolean(permiso)
}
