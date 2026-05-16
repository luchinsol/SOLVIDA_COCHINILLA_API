import { listarPermisosPorRolRepo } from '../repositories/rol_permiso_repositories.js'

export const listarPermisosPorRolService = async (rolId) => {
  if (rolId === undefined || rolId === null || rolId === '') {
    throw new Error('rol_id es obligatorio')
  }

  const parsedRolId = Number(rolId)

  if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
    throw new Error('rol_id debe ser un entero positivo')
  }

  return await listarPermisosPorRolRepo(parsedRolId)
}
