import {
  crearMuestraExternaRepo,
  crearParametroSolicitudMuestraRepo,
  crearServicioAnalisisRepo,
  crearSolicitudMuestraRepo,
  ejecutarTransaccionServicioAnalisis,
  listarServiciosAnalisisRepo,
  obtenerDetalleServicioAnalisisRepo,
  obtenerClienteActivoRepo,
  obtenerResumenServiciosAnalisisRepo,
  obtenerUnidadesMasaRepo
} from '../repositories/servicio_analisis_repositories.js'

const ENSAYOS_PERMITIDOS = new Set(['acido_carminico', 'humedad', 'color_cielab'])

const validationError = (mensaje) => {
  const error = new Error(mensaje)
  error.name = 'ValidationError'
  return error
}

const enteroPositivo = (valor, campo) => {
  const numero = Number(valor)
  if (!Number.isInteger(numero) || numero <= 0) {
    throw validationError(`${campo} debe ser un entero positivo`)
  }
  return numero
}

const textoOpcional = (valor) => {
  if (valor === undefined || valor === null) return null
  const texto = String(valor).trim()
  return texto || null
}

const normalizarFecha = (valor) => {
  if (valor === undefined || valor === null || valor === '') return null
  const fecha = String(valor).trim()
  const fechaParseada = new Date(`${fecha}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
    Number.isNaN(fechaParseada.getTime()) ||
    fechaParseada.toISOString().slice(0, 10) !== fecha
  ) {
    throw validationError('fecha_recepcion debe tener formato YYYY-MM-DD')
  }
  return fecha
}

const ESTADOS_SERVICIO = new Set([
  'recibido',
  'entregado_laboratorio',
  'en_analisis',
  'finalizado',
  'entregado_cliente',
  'cancelado'
])

export const listarServiciosAnalisisService = async (filtros = {}) => {
  const pagina = filtros.pagina === undefined ? 1 : enteroPositivo(filtros.pagina, 'pagina')
  const limite = filtros.limite === undefined ? 5 : enteroPositivo(filtros.limite, 'limite')
  const estado = textoOpcional(filtros.estado)

  if (limite > 100) throw validationError('limite no puede ser mayor que 100')
  if (estado && !ESTADOS_SERVICIO.has(estado)) {
    throw validationError('estado de servicio no valido')
  }

  const resultado = await listarServiciosAnalisisRepo({
    buscar: textoOpcional(filtros.buscar),
    estado,
    pagina,
    limite
  })
  const totalPaginas = Math.max(1, Math.ceil(resultado.total / limite))

  return {
    data: resultado.servicios,
    pagination: {
      pagina,
      limite,
      total: resultado.total,
      total_paginas: totalPaginas
    }
  }
}

export const obtenerResumenServiciosAnalisisService = () => obtenerResumenServiciosAnalisisRepo()

export const obtenerDetalleServicioAnalisisService = (servicioId) =>
  obtenerDetalleServicioAnalisisRepo(enteroPositivo(servicioId, 'servicio_id'))

const normalizarMuestra = (muestra, index) => {
  const datosMuestra = muestra ?? {}
  const posicion = index + 1
  const nombreMuestra = textoOpcional(datosMuestra.nombre_muestra)
  const cantidadRecibida = Number(datosMuestra.cantidad_recibida)

  if (!nombreMuestra) {
    throw validationError(`nombre_muestra es obligatorio en la muestra ${posicion}`)
  }

  if (!Number.isFinite(cantidadRecibida) || cantidadRecibida <= 0) {
    throw validationError(`cantidad_recibida debe ser mayor que cero en la muestra ${posicion}`)
  }

  if (!Array.isArray(datosMuestra.ensayos) || datosMuestra.ensayos.length === 0) {
    throw validationError(`debe seleccionar al menos un ensayo en la muestra ${posicion}`)
  }

  const ensayos = [...new Set(datosMuestra.ensayos.map((ensayo) => String(ensayo).trim().toLowerCase()))]
  const ensayoInvalido = ensayos.find((ensayo) => !ENSAYOS_PERMITIDOS.has(ensayo))

  if (ensayoInvalido) {
    throw validationError(`tipo de ensayo no permitido: ${ensayoInvalido}`)
  }

  return {
    nombre_muestra: nombreMuestra,
    lote_externo: textoOpcional(datosMuestra.lote_externo),
    cantidad_recibida: cantidadRecibida,
    unidad_medida_id: enteroPositivo(datosMuestra.unidad_medida_id, 'unidad_medida_id'),
    observaciones: textoOpcional(datosMuestra.observaciones),
    ensayos
  }
}

export const crearServicioAnalisisService = async (datos = {}, usuarioIdToken) => {
  const clienteId = enteroPositivo(datos.cliente_id, 'cliente_id')
  const usuarioRecepcionId = enteroPositivo(usuarioIdToken, 'usuario_recepcion_id')

  if (!Array.isArray(datos.muestras) || datos.muestras.length === 0) {
    throw validationError('debe registrar al menos una muestra')
  }

  const muestras = datos.muestras.map(normalizarMuestra)
  const unidadIds = [...new Set(muestras.map((muestra) => muestra.unidad_medida_id))]

  return ejecutarTransaccionServicioAnalisis(async (t) => {
    const cliente = await obtenerClienteActivoRepo(clienteId, t)
    if (!cliente) throw validationError('cliente no encontrado o inactivo')

    const unidades = await obtenerUnidadesMasaRepo(unidadIds, t)
    if (unidades.length !== unidadIds.length) {
      throw validationError('todas las unidades deben existir y ser unidades de masa')
    }

    const servicio = await crearServicioAnalisisRepo({
      cliente_id: clienteId,
      fecha_recepcion: normalizarFecha(datos.fecha_recepcion),
      usuario_recepcion_id: usuarioRecepcionId,
      observaciones: textoOpcional(datos.observaciones)
    }, t)

    const muestrasCreadas = []

    for (const muestra of muestras) {
      const muestraCreada = await crearMuestraExternaRepo({
        ...muestra,
        servicio_id: servicio.servicio_id
      }, t)

      const solicitud = await crearSolicitudMuestraRepo({
        muestra_id: muestraCreada.muestra_id,
        usuario_id: usuarioRecepcionId,
        observacion_laboratorio: muestra.observaciones
      }, t)

      const parametros = []
      for (const tipoEnsayo of muestra.ensayos) {
        parametros.push(await crearParametroSolicitudMuestraRepo({
          solicitud_id: solicitud.solicitud_id,
          tipo_ensayo: tipoEnsayo
        }, t))
      }

      muestrasCreadas.push({
        ...muestraCreada,
        solicitud_id: solicitud.solicitud_id,
        ensayos: parametros.map((parametro) => parametro.tipo_ensayo)
      })
    }

    return {
      ...servicio,
      cliente,
      muestras: muestrasCreadas
    }
  })
}
