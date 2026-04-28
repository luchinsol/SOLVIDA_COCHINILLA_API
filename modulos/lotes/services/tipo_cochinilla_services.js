import { listarTiposCochinillaRepo } from '../repositories/tipo_cochinilla_repositories.js'

export const listarTiposCochinillaService = async (activo) => {
  if (activo === undefined) {
    return await listarTiposCochinillaRepo(undefined)
  }

  if (activo !== 'true' && activo !== 'false') {
    throw new Error('activo debe ser true o false')
  }

  return await listarTiposCochinillaRepo(activo === 'true')
}
