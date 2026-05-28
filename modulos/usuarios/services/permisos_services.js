import {
  listarPermisosRepo,
  listarCatalogoPermisosRepo,
  crearPermisoRepo,
  obtenerModuloPorIdRepo
} from '../repositories/permisos_repositories.js'

export const listarPermisosService = async () => {
  return await listarPermisosRepo()
}

const ALCANCES_BASE = ['valorado', 'no_valorado']

const formatearRecursoLabel = (recurso) =>
  String(recurso || '')
    .split('_')
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')

const crearAccionBooleano = () => ({
  tipo_selector: 'booleano',
  opciones: {
    on: {
      permiso_id: null,
      codigo: null,
      descripcion: null
    }
  }
})

const crearAccionAlcance = () => ({
  tipo_selector: 'alcance',
  opciones: ALCANCES_BASE.reduce((acc, alcance) => {
    acc[alcance] = {
      permiso_id: null,
      codigo: null,
      descripcion: null
    }
    return acc
  }, {})
})

export const listarCatalogoPermisosService = async (filters = {}) => {
  let moduloId = null

  if (filters.modulo_id !== undefined && filters.modulo_id !== null && filters.modulo_id !== '') {
    moduloId = Number(filters.modulo_id)

    if (!Number.isInteger(moduloId) || moduloId <= 0) {
      throw new Error('modulo_id debe ser un entero positivo')
    }
  }

  const permisos = await listarCatalogoPermisosRepo({ moduloId })
  const modulosMap = new Map()

  permisos.forEach((permiso) => {
    const moduloKey = `${permiso.modulo_id ?? 'sin-modulo'}`

    if (!modulosMap.has(moduloKey)) {
      modulosMap.set(moduloKey, {
        modulo_id: permiso.modulo_id ?? null,
        modulo_nombre: permiso.modulo_nombre ?? null,
        recursos: new Map()
      })
    }

    const modulo = modulosMap.get(moduloKey)

    if (!modulo.recursos.has(permiso.recurso)) {
      modulo.recursos.set(permiso.recurso, {
        recurso: permiso.recurso,
        recurso_label: formatearRecursoLabel(permiso.recurso),
        acciones: {}
      })
    }

    const recurso = modulo.recursos.get(permiso.recurso)

    if (!recurso.acciones[permiso.accion]) {
      recurso.acciones[permiso.accion] = permiso.alcance ? crearAccionAlcance() : crearAccionBooleano()
    }

    if (permiso.alcance) {
      if (recurso.acciones[permiso.accion].tipo_selector !== 'alcance') {
        recurso.acciones[permiso.accion] = crearAccionAlcance()
      }

      recurso.acciones[permiso.accion].opciones[permiso.alcance] = {
        permiso_id: permiso.permiso_id,
        codigo: permiso.codigo,
        descripcion: permiso.descripcion
      }
      return
    }

    recurso.acciones[permiso.accion] = {
      tipo_selector: 'booleano',
      opciones: {
        on: {
          permiso_id: permiso.permiso_id,
          codigo: permiso.codigo,
          descripcion: permiso.descripcion
        }
      }
    }
  })

  return Array.from(modulosMap.values()).map((modulo) => ({
    modulo_id: modulo.modulo_id,
    modulo_nombre: modulo.modulo_nombre,
    recursos: Array.from(modulo.recursos.values())
  }))
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
