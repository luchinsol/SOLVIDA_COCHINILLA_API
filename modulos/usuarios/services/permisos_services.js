import { listarPermisosRepo } from '../repositories/permisos_repositories.js'

export const listarPermisosService = async () => {
  return await listarPermisosRepo()
}
