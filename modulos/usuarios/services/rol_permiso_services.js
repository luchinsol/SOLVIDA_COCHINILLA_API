import {
  listarPermisosPorRolRepo,
  tienePermisoPorRolRepo,
  crearRolPermisoRepo
} from '../repositories/rol_permiso_repositories.js'

const ACCIONES_BASE = ['ver', 'crear', 'editar', 'eliminar']
const ALCANCES_BASE = ['valorado', 'no_valorado']

const crearEstadoAcciones = () =>
  ACCIONES_BASE.reduce((acc, accion) => {
    acc[accion] = false
    return acc
  }, {})

const crearEstadoAlcances = () =>
  ACCIONES_BASE.reduce((acc, accion) => {
    acc[accion] = ALCANCES_BASE.reduce((alcances, alcance) => {
      alcances[alcance] = false
      return alcances
    }, {})
    return acc
  }, {})

export const listarPermisosPorRolService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.rol_id !== undefined && filters.rol_id !== null && filters.rol_id !== '') {
    const parsedRolId = Number(filters.rol_id)

    if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
      throw new Error('rol_id debe ser un entero positivo')
    }

    parsedFilters.rolId = parsedRolId
  }

  if (filters.modulo !== undefined && filters.modulo !== null && String(filters.modulo).trim() !== '') {
    parsedFilters.modulo = String(filters.modulo).trim()
  }

  return await listarPermisosPorRolRepo(parsedFilters)
}

export const obtenerVistaPermisosPorRolService = async (filters = {}) => {
  if (filters.rol_id === undefined || filters.rol_id === null || filters.rol_id === '') {
    throw new Error('rol_id es obligatorio')
  }

  const permisos = await listarPermisosPorRolService(filters)

  if (!permisos.length) {
    return {
      rol_id: Number(filters.rol_id),
      rol_nombre: null,
      modulos: []
    }
  }

  const rol = {
    rol_id: permisos[0].rol_id,
    rol_nombre: permisos[0].rol_nombre,
    modulos: []
  }

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
        acciones: crearEstadoAcciones(),
        alcances: crearEstadoAlcances(),
        permisos: []
      })
    }

    const recurso = modulo.recursos.get(permiso.recurso)

    if (permiso.accion && Object.hasOwn(recurso.acciones, permiso.accion)) {
      recurso.acciones[permiso.accion] = true
    }

    if (
      permiso.accion &&
      permiso.alcance &&
      Object.hasOwn(recurso.alcances, permiso.accion) &&
      Object.hasOwn(recurso.alcances[permiso.accion], permiso.alcance)
    ) {
      recurso.alcances[permiso.accion][permiso.alcance] = true
    }

    recurso.permisos.push({
      permiso_id: permiso.permiso_id,
      permiso_codigo: permiso.permiso_codigo,
      accion: permiso.accion,
      alcance: permiso.alcance
    })
  })

  rol.modulos = Array.from(modulosMap.values()).map((modulo) => ({
    modulo_id: modulo.modulo_id,
    modulo_nombre: modulo.modulo_nombre,
    recursos: Array.from(modulo.recursos.values())
  }))

  return rol
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
