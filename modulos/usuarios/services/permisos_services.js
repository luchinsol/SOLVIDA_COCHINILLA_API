import {
  listarPermisosRepo,
  crearPermisoRepo,
  obtenerModuloPorIdRepo
} from '../repositories/permisos_repositories.js'

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
  if (data.modulo_id === undefined || data.modulo_id === null || data.modulo_id === '') {
    throw new Error('modulo_id es obligatorio')
  }

  if (!data.recurso || !String(data.recurso).trim()) {
    throw new Error('recurso es obligatorio')
  }

  if (!data.accion || !String(data.accion).trim()) {
    throw new Error('accion es obligatoria')
  }

  const moduloId = Number(data.modulo_id)

  if (!Number.isInteger(moduloId) || moduloId <= 0) {
    throw new Error('modulo_id debe ser un entero positivo')
  }

  const recurso = String(data.recurso).trim()
  const accion = String(data.accion).trim()
  const alcance =
    data.alcance !== undefined && data.alcance !== null && String(data.alcance).trim() !== ''
      ? String(data.alcance).trim()
      : null

  const modulo = await obtenerModuloPorIdRepo(moduloId)

  if (!modulo) {
    throw new Error('Modulo no encontrado')
  }

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
    modulo: modulo.nombre,
    modulo_id: modulo.modulo_id,
    recurso,
    accion,
    alcance
  })
}
