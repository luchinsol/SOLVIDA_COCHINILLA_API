import {
  listarPermisosPorRolRepo,
  listarCatalogoPermisosRepo,
  obtenerRolPorIdRepo,
  tienePermisoPorRolRepo,
  crearRolPermisoRepo,
  obtenerPermisoPorIdRepo,
  obtenerPermisoPorRecursoAccionAlcanceRepo,
  obtenerPermisoPorCodigoRepo,
  listarRolPermisosPorRecursoAccionRepo,
  existeRolPermisoRepo,
  eliminarRolPermisoRepo
} from '../repositories/rol_permiso_repositories.js'

const ACCIONES_BASE = ['ver', 'crear', 'editar', 'eliminar']
const ALCANCES_BASE = ['valorado', 'no_valorado']

const crearAccionBooleano = () => ({
  tipo_selector: 'booleano',
  activo: false,
  permiso_id: null,
  alcance: null,
  opciones: {
    on: {
      activo: false,
      permiso_id: null
    }
  }
})

const crearAccionAlcance = () => ({
  tipo_selector: 'alcance',
  activo: false,
  permiso_id: null,
  alcance: null,
  opciones: ALCANCES_BASE.reduce((acc, alcance) => {
    acc[alcance] = {
      activo: false,
      permiso_id: null
    }
    return acc
  }, {})
})

const tieneAlgunaAccionActiva = (acciones = {}) =>
  Object.values(acciones).some((accion) => accion?.activo === true)

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

  const parsedRolId = Number(filters.rol_id)
  const [permisosActivos, catalogoPermisos, rolInfo] = await Promise.all([
    listarPermisosPorRolService(filters),
    listarCatalogoPermisosRepo({
      modulo: filters.modulo !== undefined && filters.modulo !== null && String(filters.modulo).trim() !== ''
        ? String(filters.modulo).trim()
        : null
    }),
    obtenerRolPorIdRepo(parsedRolId)
  ])

  const rol = {
    rol_id: parsedRolId,
    rol_nombre: rolInfo?.rol_nombre ?? permisosActivos[0]?.rol_nombre ?? null,
    modulos: []
  }

  if (!catalogoPermisos.length) {
    return rol
  }

  const activosPorPermisoId = new Map(
    permisosActivos.map((permiso) => [permiso.permiso_id, permiso])
  )

  const modulosMap = new Map()

  catalogoPermisos.forEach((permiso) => {
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
        acciones: ACCIONES_BASE.reduce((acc, accion) => {
          acc[accion] = crearAccionBooleano()
          return acc
        }, {})
      })
    }

    const recurso = modulo.recursos.get(permiso.recurso)

    if (!permiso.accion || !Object.hasOwn(recurso.acciones, permiso.accion)) {
      return
    }

    const accion = recurso.acciones[permiso.accion]
    const permisoActivo = activosPorPermisoId.get(permiso.permiso_id)

    if (permiso.alcance) {
      if (accion.tipo_selector !== 'alcance') {
        recurso.acciones[permiso.accion] = crearAccionAlcance()
      }

      const accionConAlcance = recurso.acciones[permiso.accion]

      accionConAlcance.opciones[permiso.alcance] = {
        activo: Boolean(permisoActivo),
        permiso_id: permiso.permiso_id
      }

      if (permisoActivo) {
        accionConAlcance.activo = true
        accionConAlcance.permiso_id = permiso.permiso_id
        accionConAlcance.alcance = permiso.alcance
      }

      return
    }

    recurso.acciones[permiso.accion].tipo_selector = 'booleano'
    recurso.acciones[permiso.accion].opciones.on = {
      activo: Boolean(permisoActivo),
      permiso_id: permiso.permiso_id
    }

    if (permisoActivo) {
      recurso.acciones[permiso.accion].activo = true
      recurso.acciones[permiso.accion].permiso_id = permiso.permiso_id
      recurso.acciones[permiso.accion].alcance = null
    }
  })

  rol.modulos = Array.from(modulosMap.values())
    .map((modulo) => ({
      modulo_id: modulo.modulo_id,
      modulo_nombre: modulo.modulo_nombre,
      recursos: Array.from(modulo.recursos.values()).filter((recurso) =>
        tieneAlgunaAccionActiva(recurso.acciones)
      )
    }))
    .filter((modulo) => modulo.recursos.length > 0)

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

export const actualizarRolPermisoService = async (data) => {
  if (data.rol_id === undefined || data.rol_id === null || data.rol_id === '') {
    throw new Error('rol_id es obligatorio')
  }

  if (typeof data.activo !== 'boolean') {
    throw new Error('activo debe ser booleano')
  }

  const rolId = Number(data.rol_id)

  if (!Number.isInteger(rolId) || rolId <= 0) {
    throw new Error('rol_id debe ser un entero positivo')
  }

  const hasPermisoId = !(data.permiso_id === undefined || data.permiso_id === null || data.permiso_id === '')
  const hasRecursoAccion =
    !(data.recurso === undefined || data.recurso === null || String(data.recurso).trim() === '') &&
    !(data.accion === undefined || data.accion === null || String(data.accion).trim() === '')

  if (!hasPermisoId && !hasRecursoAccion) {
    throw new Error('Debes enviar permiso_id o recurso y accion')
  }

  let permisoActual = null
  let permisoId = null

  if (hasPermisoId) {
    permisoId = Number(data.permiso_id)

    if (!Number.isInteger(permisoId) || permisoId <= 0) {
      throw new Error('permiso_id debe ser un entero positivo')
    }

    permisoActual = await obtenerPermisoPorIdRepo(permisoId)
  }

  const recurso = hasRecursoAccion ? String(data.recurso).trim() : permisoActual?.recurso
  const accion = hasRecursoAccion ? String(data.accion).trim() : permisoActual?.accion
  const alcanceObjetivo =
    data.alcance === undefined
      ? (permisoActual?.alcance ?? null)
      : (data.alcance === null || data.alcance === '' ? null : String(data.alcance).trim())

  if (!permisoActual && hasRecursoAccion) {
    const codigo = alcanceObjetivo ? `${recurso}.${accion}.${alcanceObjetivo}` : `${recurso}.${accion}`
    permisoActual = await obtenerPermisoPorCodigoRepo(codigo)
  }

  if (!permisoActual) {
    throw new Error('Permiso no encontrado')
  }

  if (data.activo === false) {
    await eliminarRolPermisoRepo(rolId, permisoActual.permiso_id)

    return {
      rol_id: rolId,
      permiso_id: permisoActual.permiso_id,
      activo: false,
      permiso_actual: null
    }
  }

  const permisoObjetivo =
    alcanceObjetivo === permisoActual.alcance
      ? permisoActual
      : await obtenerPermisoPorRecursoAccionAlcanceRepo({
          recurso,
          accion,
          alcance: alcanceObjetivo
        })

  if (!permisoObjetivo) {
    throw new Error('No existe el permiso destino para ese recurso, accion y alcance')
  }

  const relacionesActuales = await listarRolPermisosPorRecursoAccionRepo({
    rolId,
    recurso,
    accion
  })

  for (const relacion of relacionesActuales) {
    if (relacion.permiso_id !== permisoObjetivo.permiso_id) {
      await eliminarRolPermisoRepo(rolId, relacion.permiso_id)
    }
  }

  const relacionExiste = await existeRolPermisoRepo(rolId, permisoObjetivo.permiso_id)

  if (!relacionExiste) {
    await crearRolPermisoRepo(rolId, permisoObjetivo.permiso_id)
  }

  return {
    rol_id: rolId,
    permiso_id: permisoObjetivo.permiso_id,
    activo: true,
    permiso_actual: permisoObjetivo
  }
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

export const obtenerAccesosPorRolService = async (rolId) => {
  const parsedRolId = Number(rolId)

  if (!Number.isInteger(parsedRolId) || parsedRolId <= 0) {
    throw new Error('rol_id del token no es valido')
  }

  const permisos = await listarPermisosPorRolRepo({ rolId: parsedRolId })

  const modulosMap = new Map()
  const permisosCodigo = []

  permisos.forEach((permiso) => {
    permisosCodigo.push(permiso.permiso_codigo)

    if (permiso.modulo_id == null) {
      return
    }

    if (!modulosMap.has(permiso.modulo_id)) {
      modulosMap.set(permiso.modulo_id, {
        modulo_id: permiso.modulo_id,
        modulo_nombre: permiso.modulo_nombre
      })
    }
  })

  return {
    permisos: permisosCodigo,
    modulos_acceso: Array.from(modulosMap.values())
  }
}
