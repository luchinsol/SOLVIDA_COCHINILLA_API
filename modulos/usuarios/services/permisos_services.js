import { listarPermisosRepo, crearPermisoRepo } from '../repositories/permisos_repositories.js'

export const listarPermisosService = async () => {
  return await listarPermisosRepo()
}

const normalizarParteCodigo = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

export const crearPermisoService = async (data) => {
  if (!data.modulo || !String(data.modulo).trim()) {
    throw new Error('modulo es obligatorio')
  }

  if (!data.recurso || !String(data.recurso).trim()) {
    throw new Error('recurso es obligatorio')
  }

  if (!data.accion || !String(data.accion).trim()) {
    throw new Error('accion es obligatoria')
  }

  const modulo = String(data.modulo).trim()
  const recurso = String(data.recurso).trim()
  const accion = String(data.accion).trim()
  const alcance =
    data.alcance !== undefined && data.alcance !== null && String(data.alcance).trim() !== ''
      ? String(data.alcance).trim()
      : null

  const codigoPartes = [recurso, accion]

  if (alcance) {
    codigoPartes.push(alcance)
  }

  const codigo = codigoPartes.map(normalizarParteCodigo).join('.')

  return await crearPermisoRepo({
    codigo,
    descripcion:
      data.descripcion !== undefined && data.descripcion !== null && String(data.descripcion).trim() !== ''
        ? String(data.descripcion).trim()
        : null,
    modulo,
    recurso,
    accion,
    alcance
  })
}
