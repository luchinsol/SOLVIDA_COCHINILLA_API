import { listarModulosRepo } from '../repositories/modulo_repositories.js'

export const listarModulosService = async () => {
  return await listarModulosRepo()
}
