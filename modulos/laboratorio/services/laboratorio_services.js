import db from '../../../config/database.js'
import {
  crearAnalisis,
  crearEnsayoAcidoCarminicoRepo,
  crearEnsayoColorCielabRepo,
  crearEnsayoHumedadRepo,
  crearEnsayoLaboratorioRepo,
  actualizarEnsayoAcidoCarminicoRepo,
  actualizarEnsayoColorCielabRepo,
  actualizarEnsayoHumedadRepo,
  actualizarEnsayoLaboratorioRepo,
  cerrarNoConformidadesAbiertasPorReanalisisRepo,
  actualizarResultadosActualesEnLoteRepo,
  actualizarObservacionesEnLoteRepo,
  actualizarModificadoEnAnalisisRepo,
  obtenerAnalisisActivoPorItemInventarioRepo,
  obtenerEnsayoPorIdYAnalisisRepo,
  listarEnsayosPorAnalisisRepo,
  obtenerItemInventarioPorIdParaAnalisisRepo,
  obtenerTodosAnalisis,
  obtenerAnalisisPorId,
  obtenerAnalisisNoConformes,
  obtenerAnalisisNoConformesFinalizados,
  actualizarAnalisisActualEnLoteRepo,
  actualizarAnalisis,
  eliminarAnalisis,
  contarMuestrasAnalizadasHoy,
  contarNoConformidadesHoy
} from '../repositories/laboratorio_repositories.js'
import {
  crearSolicitudAnalisisLaboratorioRepo,
  crearSolicitudParametroLaboratorioRepo,
  obtenerSolicitudAnalisisPorIdConParametrosRepo,
  obtenerSolicitudAnalisisPendientePorItemInventarioRepo,
  marcarSolicitudAnalisisAtendidaRepo
} from '../repositories/solicitud_analisis_repositories.js'
import { obtenerLotesPorItemInventarioId } from '../../inventario/repositories/movimiento_almacen_repositories.js'
import { actualizarEstadoLoteInsumo } from '../../inventario/repositories/lote_insumo_repositories.js'
import { actualizarEstadoLoteCochinillaRepo } from '../../lotes/repositories/lote_cochinilla_repositories.js'
import { actualizarEstadoLoteCarminRepo } from '../../lotes/repositories/lote_carmin_repositories.js'
import { actualizarEstadoLoteExtractoRepo } from '../../lotes/repositories/extracto_repositories.js'

const actualizarEstadoLotePorItemInventario = async (itemInventarioId, estadoLoteId, t) => {
  const lotesRelacionados = await obtenerLotesPorItemInventarioId(itemInventarioId, t)

  if (!lotesRelacionados.length) {
    return
  }

  for (const lote of lotesRelacionados) {
    if (lote.lote_tabla === 'lote_insumo') {
      await actualizarEstadoLoteInsumo(lote.lote_id, estadoLoteId, t)
      continue
    }

    if (lote.lote_tabla === 'lote_cochinilla') {
      await actualizarEstadoLoteCochinillaRepo(lote.lote_id, estadoLoteId, t)
      continue
    }

    if (lote.lote_tabla === 'lote_carmin') {
      await actualizarEstadoLoteCarminRepo(lote.lote_id, estadoLoteId, t)
      continue
    }

    if (lote.lote_tabla === 'extracto') {
      await actualizarEstadoLoteExtractoRepo(lote.lote_id, estadoLoteId, t)
    }
  }
}

const actualizarAnalisisActualPorItemInventario = async (itemInventarioId, analisisId, t) => {
  const lotesRelacionados = await obtenerLotesPorItemInventarioId(itemInventarioId, t)

  if (!lotesRelacionados.length) {
    return
  }

  for (const lote of lotesRelacionados) {
    await actualizarAnalisisActualEnLoteRepo(lote.lote_tabla, lote.lote_id, analisisId, t)
  }
}

const actualizarResultadosActualesPorItemInventario = async (itemInventarioId, resultados, t) => {
  const lotesRelacionados = await obtenerLotesPorItemInventarioId(itemInventarioId, t)

  if (!lotesRelacionados.length) {
    return
  }

  for (const lote of lotesRelacionados) {
    await actualizarResultadosActualesEnLoteRepo(lote.lote_tabla, lote.lote_id, resultados, t)
  }
}

const actualizarObservacionesPorItemInventario = async (itemInventarioId, observaciones, t) => {
  const lotesRelacionados = await obtenerLotesPorItemInventarioId(itemInventarioId, t)

  if (!lotesRelacionados.length) {
    return
  }

  for (const lote of lotesRelacionados) {
    await actualizarObservacionesEnLoteRepo(lote.lote_tabla, lote.lote_id, observaciones, t)
  }
}

const evaluarConformidadEnsayo = (tipoEnsayo, detalleActualizado, conformeActual = null) => {
  if (tipoEnsayo === 'acido_carminico') {
    if (detalleActualizado?.absorbancia_nm === null || detalleActualizado?.absorbancia_nm === undefined) {
      return null
    }

    return (
      Number(detalleActualizado.absorbancia_nm) >= 0.650 &&
      Number(detalleActualizado.absorbancia_nm) <= 0.750
    )
  }

  if (tipoEnsayo === 'humedad') {
    if (detalleActualizado?.resultado === null || detalleActualizado?.resultado === undefined) {
      return null
    }

    return true
  }

  if (tipoEnsayo === 'color_cielab') {
    if (
      detalleActualizado?.resultado_l === null || detalleActualizado?.resultado_l === undefined ||
      detalleActualizado?.resultado_a === null || detalleActualizado?.resultado_a === undefined ||
      detalleActualizado?.resultado_b === null || detalleActualizado?.resultado_b === undefined
    ) {
      return null
    }

    return true
  }

  return conformeActual
}

const tieneValorResultado = (valor) => valor !== null && valor !== undefined && valor !== ''

const ensayoTieneResultadosCompletos = (tipoEnsayo, detalleActualizado) => {
  if (tipoEnsayo === 'humedad') {
    return tieneValorResultado(detalleActualizado?.resultado)
  }

  if (tipoEnsayo === 'acido_carminico') {
    return (
      tieneValorResultado(detalleActualizado?.absorbancia_nm) &&
      tieneValorResultado(detalleActualizado?.resultado)
    )
  }

  if (tipoEnsayo === 'color_cielab') {
    return (
      tieneValorResultado(detalleActualizado?.resultado_l) &&
      tieneValorResultado(detalleActualizado?.resultado_a) &&
      tieneValorResultado(detalleActualizado?.resultado_b)
    )
  }

  return false
}

const limpiarEnsayosAnalisis = (analisis) => {
  if (!analisis || !Array.isArray(analisis.ensayos)) {
    return analisis
  }

  return {
    ...analisis,
    ensayos: analisis.ensayos.map((ensayo) => {
      const ensayoLimpio = {
        ensayo_id: ensayo.ensayo_id,
        tipo_ensayo: ensayo.tipo_ensayo
      }

      if (ensayo.tipo_ensayo === 'humedad' && ensayo.humedad) {
        ensayoLimpio.humedad = ensayo.humedad
      }

      if (ensayo.tipo_ensayo === 'acido_carminico' && ensayo.acido_carminico) {
        ensayoLimpio.acido_carminico = ensayo.acido_carminico
      }

      if (ensayo.tipo_ensayo === 'color_cielab' && ensayo.color_cielab) {
        ensayoLimpio.color_cielab = ensayo.color_cielab
      }

      return ensayoLimpio
    })
  }
}

const formatearFechaDiaMesAnio = (fecha) => {
  if (!fecha) {
    return fecha
  }

  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha)

  if (Number.isNaN(fechaObj.getTime())) {
    return fecha
  }

  const dia = String(fechaObj.getDate()).padStart(2, '0')
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
  const anio = fechaObj.getFullYear()

  return `${dia}/${mes}/${anio}`
}

const limpiarAnalisisOSolicitudResponse = (
  analisis,
  { mostrarSolicitudId = false, mostrarCreadoEn = false } = {}
) => {
  if (!analisis || typeof analisis !== 'object' || Array.isArray(analisis)) {
    return analisis
  }

  const analisisLimpio = { ...analisis }

  if (Object.prototype.hasOwnProperty.call(analisisLimpio, 'nombre_item')) {
    analisisLimpio['Tipo de muestra'] = analisisLimpio.nombre_item
    delete analisisLimpio.nombre_item
  }

  if (
    Object.prototype.hasOwnProperty.call(analisisLimpio, 'nombre_usuario') ||
    Object.prototype.hasOwnProperty.call(analisisLimpio, 'rol_usuario')
  ) {
    const usuario = analisisLimpio.nombre_usuario ?? ''
    const rol = analisisLimpio.rol_usuario ?? ''
    analisisLimpio['Solicitado por'] = [usuario, rol].filter(Boolean).join(' - ')
    delete analisisLimpio.nombre_usuario
    delete analisisLimpio.rol_usuario
  }

  if (Array.isArray(analisisLimpio.parametros)) {
    analisisLimpio['Ensayos requeridos'] = analisisLimpio.parametros.length
  } else if (Array.isArray(analisisLimpio.ensayos)) {
    analisisLimpio['Ensayos requeridos'] = analisisLimpio.ensayos.length
  }

  delete analisisLimpio.proceso_extraccion_id
  delete analisisLimpio.modificado_en
  delete analisisLimpio.unidad_medida_masa
  delete analisisLimpio.estado_analisis_id
  delete analisisLimpio.lote_tabla
  delete analisisLimpio.estado_lote_id
  delete analisisLimpio.item_inventario_id

  if (!mostrarSolicitudId) {
    delete analisisLimpio.solicitud_id
  }

  if (mostrarCreadoEn) {
    analisisLimpio['Fecha solicitud'] = formatearFechaDiaMesAnio(analisisLimpio.creado_en)
    delete analisisLimpio.creado_en
  } else {
    delete analisisLimpio.creado_en
  }

  return analisisLimpio
}

const obtenerDetalleEnsayoPayload = (ensayoPayload, tipoEnsayoNormalizado) => {
  if (!ensayoPayload || typeof ensayoPayload !== 'object' || Array.isArray(ensayoPayload)) {
    return {}
  }

  if (tipoEnsayoNormalizado === 'humedad') {
    const detalle = ensayoPayload.humedad
    return detalle && typeof detalle === 'object' && !Array.isArray(detalle)
      ? detalle
      : ensayoPayload
  }

  if (tipoEnsayoNormalizado === 'acido_carminico') {
    const detalle = ensayoPayload.acido_carminico
    return detalle && typeof detalle === 'object' && !Array.isArray(detalle)
      ? detalle
      : ensayoPayload
  }

  if (tipoEnsayoNormalizado === 'color_cielab') {
    const detalle = ensayoPayload.color_cielab
    return detalle && typeof detalle === 'object' && !Array.isArray(detalle)
      ? detalle
      : ensayoPayload
  }

  return ensayoPayload
}

export const obtenerTodosAnalisisService = async () => {
    const analisis = await obtenerTodosAnalisis();
    return analisis;
}

export const obtenerAnalisisPorIdService = async (analisis_id) => {
  const analisisId = Number(analisis_id)

  if (!Number.isInteger(analisisId) || analisisId <= 0) {
    throw new Error('analisis_id debe ser un entero positivo')
  }

  const analisis = await obtenerAnalisisPorId(analisisId)

  if (!analisis) {
    throw new Error('analisis no encontrado')
  }

  return analisis
}

export const obtenerAnalisisActivoPorItemInventarioService = async (item_inventario_id) => {
  const itemInventarioId = Number(item_inventario_id)

  if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
    throw new Error('item_inventario_id debe ser un entero positivo')
  }

  const analisis = await obtenerAnalisisActivoPorItemInventarioRepo(itemInventarioId)

  if (!analisis) {
    throw new Error('no existe un lote en analisis para ese item_inventario')
  }

  return limpiarEnsayosAnalisis(analisis)
}

export const obtenerAnalisisOSolicitudPorItemInventarioService = async (item_inventario_id) => {
  const itemInventarioId = Number(item_inventario_id)

  if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
    throw new Error('item_inventario_id debe ser un entero positivo')
  }

  const analisisActivo = await obtenerAnalisisActivoPorItemInventarioRepo(itemInventarioId)

  if (analisisActivo) {
    return {
      tipo: 'analisis',
      data: limpiarAnalisisOSolicitudResponse(limpiarEnsayosAnalisis(analisisActivo))
    }
  }

  const solicitudPendiente = await obtenerSolicitudAnalisisPendientePorItemInventarioRepo(itemInventarioId)

  if (solicitudPendiente) {
    return {
      tipo: 'solicitud',
      data: limpiarAnalisisOSolicitudResponse(solicitudPendiente, {
        mostrarSolicitudId: true,
        mostrarCreadoEn: true
      })
    }
  }

  throw new Error('no existe analisis activo ni solicitud pendiente para ese item_inventario')
}

export const contarMuestrasAnalizadasHoyService = async () => {
  return await contarMuestrasAnalizadasHoy()
}

export const contarNoConformidadesHoyService = async () => {
  return await contarNoConformidadesHoy()
}

export const obtenerAnalisisNoConformesService = async () => {
  return await obtenerAnalisisNoConformes()
}

export const obtenerAnalisisNoConformesFinalizadosService = async () => {
  return await obtenerAnalisisNoConformesFinalizados()
}

const extraerResultadosActualesDesdeEnsayo = (ensayo) => {
  if (ensayo.tipo_ensayo === 'humedad' && ensayo.humedad) {
    return {
      humedad_actual: ensayo.humedad.resultado
    }
  }

  if (ensayo.tipo_ensayo === 'acido_carminico' && ensayo.acido_carminico) {
    return {
      concentracion_ac_actual: ensayo.acido_carminico.resultado
    }
  }

  if (ensayo.tipo_ensayo === 'color_cielab' && ensayo.color_cielab) {
    return {
      color_l_actual: ensayo.color_cielab.resultado_l,
      color_a_actual: ensayo.color_cielab.resultado_a,
      color_b_actual: ensayo.color_cielab.resultado_b
    }
  }

  return {}
}

export const crearAnalisisService = async (datos) => {
  if (Object.prototype.hasOwnProperty.call(datos ?? {}, 'peso_muestra_g')) {
    throw new Error('peso_muestra_g no se recibe en esta ruta')
  }

  const usuarioId = Number(datos.usuario_id)
  const itemInventarioId = Number(datos.item_inventario_id)
  const solicitudId = Number(datos.solicitud_id)

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error('usuario_id debe ser un entero positivo')
  }

  if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
    throw new Error('item_inventario_id debe ser un entero positivo')
  }

  if (
    datos.solicitud_id === undefined ||
    datos.solicitud_id === null ||
    datos.solicitud_id === ''
  ) {
    throw new Error('solicitud_id es obligatorio')
  }

  if (!Number.isInteger(solicitudId) || solicitudId <= 0) {
    throw new Error('solicitud_id debe ser un entero positivo')
  }

  if (
    datos.observaciones === undefined ||
    datos.observaciones === null ||
    String(datos.observaciones).trim() === ''
  ) {
    throw new Error('observaciones es obligatorio')
  }

  if (typeof datos.observaciones !== 'string') {
    throw new Error('observaciones debe ser texto')
  }

  const tiposEnsayoPermitidos = new Map([
    ['humedad', 'humedad'],
    ['acido_carminico', 'acido_carminico'],
    ['acido carminico', 'acido_carminico'],
    ['concentracion_acido_carminico', 'acido_carminico'],
    ['concentracion de acido carminico', 'acido_carminico'],
    ['color_cielab', 'color_cielab'],
    ['color cielab', 'color_cielab']
  ])

  const estadoAnalisisId = 1

  const analisisNormalizado = {
    usuario_id: usuarioId,
    observaciones: datos.observaciones.trim(),
    item_inventario_id: itemInventarioId,
    estado_analisis_id: estadoAnalisisId,
    nombre: null,
    solicitud_id: solicitudId
  }

  return await db.tx(async (t) => {
    const itemInventario = await obtenerItemInventarioPorIdParaAnalisisRepo(itemInventarioId, t)

    if (!itemInventario) {
      throw new Error('item_inventario_id no encontrado')
    }

    const nombreItem = String(itemInventario.nombre_item ?? '').trim().toLowerCase()
    let prefijo = 'AN-OTR'

    if (nombreItem === 'cochinilla') {
      prefijo = 'AN-COCH'
    } else if (nombreItem === 'carmin') {
      prefijo = 'AN-LK'
    } else if (nombreItem === 'extracto') {
      prefijo = 'AN-EXT'
    }

    const solicitud = await obtenerSolicitudAnalisisPorIdConParametrosRepo(solicitudId, t)

    if (!solicitud) {
      throw new Error('solicitud de analisis no encontrada')
    }

    if (solicitud.item_inventario_id !== itemInventarioId) {
      throw new Error('solicitud de analisis no corresponde al item_inventario')
    }

    if (solicitud.atendido) {
      throw new Error('solicitud de analisis ya fue atendida')
    }

    if (!Array.isArray(solicitud.parametros) || !solicitud.parametros.length) {
      throw new Error('solicitud de analisis no tiene parametros')
    }

    const tiposEnsayoNormalizados = [...new Set(solicitud.parametros.map((parametro) => {
      const tipoEnsayo = typeof parametro?.tipo_ensayo === 'string'
        ? parametro.tipo_ensayo.trim().toLowerCase()
        : ''

      const tipoNormalizado = tiposEnsayoPermitidos.get(tipoEnsayo)

      if (!tipoNormalizado) {
        throw new Error(`tipo de ensayo no permitido: ${parametro?.tipo_ensayo ?? ''}`)
      }

      return tipoNormalizado
    }))]

    const siguienteId = await t.one(
      `SELECT nextval(
         pg_get_serial_sequence('laboratorio.analisis_laboratorio', 'analisis_id')
       )::int AS analisis_id`
    )

    const nombreGenerado = `${prefijo}-${String(siguienteId.analisis_id).padStart(5, '0')}`

    const analisisCreado = await crearAnalisis(
      {
        ...analisisNormalizado,
        analisis_id: siguienteId.analisis_id,
        nombre: nombreGenerado
      },
      t
    )

    const ensayosCreados = []

    for (const tipoEnsayo of tiposEnsayoNormalizados) {
      const ensayoCreado = await crearEnsayoLaboratorioRepo(analisisCreado.analisis_id, tipoEnsayo, t)

      if (tipoEnsayo === 'humedad') {
        await crearEnsayoHumedadRepo(ensayoCreado.ensayo_id, t)
      } else if (tipoEnsayo === 'acido_carminico') {
        await crearEnsayoAcidoCarminicoRepo(ensayoCreado.ensayo_id, t)
      } else if (tipoEnsayo === 'color_cielab') {
        await crearEnsayoColorCielabRepo(ensayoCreado.ensayo_id, t)
      }

      ensayosCreados.push(ensayoCreado)
    }

    await marcarSolicitudAnalisisAtendidaRepo(solicitudId, t)
    await actualizarAnalisisActualPorItemInventario(itemInventarioId, analisisCreado.analisis_id, t)
    await actualizarEstadoLotePorItemInventario(itemInventarioId, 6, t)

    return {
      ...analisisCreado,
      ensayos: ensayosCreados
    }
  })
}
export const actualizarAnalisisService = async (analisis_id, analisisDatos) => {
  const analisisId = Number(analisis_id)

  if (!Number.isInteger(analisisId) || analisisId <= 0) {
    throw new Error('analisis_id debe ser un entero positivo')
  }

  const allowedFields = new Set([
    'peso_muestra_g',
    'peso_ensayo_g',
    'absorbancia',
    'concentracion_ac',
    'humedad',
    'color_l',
    'color_a',
    'color_r',
    'color_b',
    'observaciones',
    'estado_analisis_id'
  ])

  const bodyKeys = Object.keys(analisisDatos ?? {})
  const invalidFields = bodyKeys.filter((field) => !allowedFields.has(field))

  if (invalidFields.length) {
    throw new Error(`campos no permitidos: ${invalidFields.join(', ')}`)
  }

  const parseNullableNumber = (value, fieldName) => {
    if (value === undefined) {
      return undefined
    }

    if (value === null || value === '') {
      return null
    }

    const parsed = Number(value)

    if (!Number.isFinite(parsed)) {
      throw new Error(`${fieldName} debe ser un numero valido`)
    }

    return parsed
  }

  const camposActualizables = {}

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'peso_muestra_g')) {
    camposActualizables.peso_muestra_g = parseNullableNumber(analisisDatos.peso_muestra_g, 'peso_muestra_g')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'peso_ensayo_g')) {
    camposActualizables.peso_ensayo_g = parseNullableNumber(analisisDatos.peso_ensayo_g, 'peso_ensayo_g')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'absorbancia')) {
    camposActualizables.absorbancia = parseNullableNumber(analisisDatos.absorbancia, 'absorbancia')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'concentracion_ac')) {
    camposActualizables.concentracion_ac = parseNullableNumber(analisisDatos.concentracion_ac, 'concentracion_ac')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'humedad')) {
    camposActualizables.humedad = parseNullableNumber(analisisDatos.humedad, 'humedad')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'color_l')) {
    camposActualizables.color_l = parseNullableNumber(analisisDatos.color_l, 'color_l')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'color_a')) {
    camposActualizables.color_a = parseNullableNumber(analisisDatos.color_a, 'color_a')
  }

  if (
    Object.prototype.hasOwnProperty.call(analisisDatos, 'color_r') ||
    Object.prototype.hasOwnProperty.call(analisisDatos, 'color_b')
  ) {
    const valorColorR = Object.prototype.hasOwnProperty.call(analisisDatos, 'color_r')
      ? analisisDatos.color_r
      : analisisDatos.color_b

    camposActualizables.color_b = parseNullableNumber(valorColorR, 'color_r')
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'observaciones')) {
    if (
      analisisDatos.observaciones !== null &&
      analisisDatos.observaciones !== undefined &&
      typeof analisisDatos.observaciones !== 'string'
    ) {
      throw new Error('observaciones debe ser texto')
    }

    camposActualizables.observaciones = analisisDatos.observaciones ?? null
  }

  if (Object.prototype.hasOwnProperty.call(analisisDatos, 'estado_analisis_id')) {
    if (
      analisisDatos.estado_analisis_id === null ||
      analisisDatos.estado_analisis_id === undefined ||
      analisisDatos.estado_analisis_id === ''
    ) {
      throw new Error('estado_analisis_id debe ser un entero positivo')
    }

    const estadoAnalisisId = Number(analisisDatos.estado_analisis_id)

    if (!Number.isInteger(estadoAnalisisId) || estadoAnalisisId <= 0) {
      throw new Error('estado_analisis_id debe ser un entero positivo')
    }

    camposActualizables.estado_analisis_id = estadoAnalisisId
  }

  if (!Object.keys(camposActualizables).length) {
    throw new Error('debes enviar al menos un campo para actualizar')
  }

  return await db.tx(async (t) => {
    const analisisActualizado = await actualizarAnalisis(analisisId, camposActualizables, t)

    if (!analisisActualizado) {
      throw new Error('analisis no encontrado')
    }

    if (Object.prototype.hasOwnProperty.call(camposActualizables, 'estado_analisis_id')) {
      const estadoAnalisisId = camposActualizables.estado_analisis_id
      let nuevoEstadoLoteId = null

      if (estadoAnalisisId === 2) {
        nuevoEstadoLoteId = 1
      } else if (estadoAnalisisId === 3) {
        nuevoEstadoLoteId = 2
      } else if (estadoAnalisisId === 4) {
        nuevoEstadoLoteId = 6
      }

      if (nuevoEstadoLoteId !== null && analisisActualizado.item_inventario_id) {
        await actualizarEstadoLotePorItemInventario(analisisActualizado.item_inventario_id, nuevoEstadoLoteId, t)
      }
    }

    return analisisActualizado
  })
}

export const actualizarEnsayosAnalisisService = async (analisis_id, payload) => {
  const analisisId = Number(analisis_id)

  if (!Number.isInteger(analisisId) || analisisId <= 0) {
    throw new Error('analisis_id debe ser un entero positivo')
  }

  if (!Array.isArray(payload?.ensayos) || !payload.ensayos.length) {
    throw new Error('ensayos debe ser un arreglo con al menos un ensayo')
  }

  const parseNullableNumber = (value, fieldName) => {
    if (value === undefined) {
      return undefined
    }

    if (value === null || value === '') {
      return null
    }

    const parsed = Number(value)

    if (!Number.isFinite(parsed)) {
      throw new Error(`${fieldName} debe ser un numero valido`)
    }

    return parsed
  }

  let estadoAnalisisId = undefined
  let pesoMuestraG = undefined
  let observacionesAnalisis = undefined

  if (
    Object.prototype.hasOwnProperty.call(payload ?? {}, 'estado_analisis_id') ||
    Object.prototype.hasOwnProperty.call(payload ?? {}, 'estado_analisis')
  ) {
    const estadoAnalisisValue = Object.prototype.hasOwnProperty.call(payload ?? {}, 'estado_analisis_id')
      ? payload.estado_analisis_id
      : payload.estado_analisis

    if (
      estadoAnalisisValue === null ||
      estadoAnalisisValue === undefined ||
      estadoAnalisisValue === ''
    ) {
      throw new Error('estado_analisis_id debe ser un entero positivo')
    }

    estadoAnalisisId = Number(estadoAnalisisValue)

    if (!Number.isInteger(estadoAnalisisId) || estadoAnalisisId <= 0) {
      throw new Error('estado_analisis_id debe ser un entero positivo')
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload ?? {}, 'peso_muestra_g')) {
    pesoMuestraG = parseNullableNumber(payload.peso_muestra_g, 'peso_muestra_g')
  }

  if (Object.prototype.hasOwnProperty.call(payload ?? {}, 'observaciones')) {
    if (
      payload.observaciones !== null &&
      payload.observaciones !== undefined &&
      typeof payload.observaciones !== 'string'
    ) {
      throw new Error('observaciones debe ser texto')
    }

    observacionesAnalisis = payload.observaciones ?? null
  }

  const tiposEnsayoPermitidos = new Map([
    ['humedad', 'humedad'],
    ['acido_carminico', 'acido_carminico'],
    ['acido carminico', 'acido_carminico'],
    ['concentracion_acido_carminico', 'acido_carminico'],
    ['concentracion de acido carminico', 'acido_carminico'],
    ['color_cielab', 'color_cielab'],
    ['color cielab', 'color_cielab']
  ])

  return await db.tx(async (t) => {
    const actualizaciones = []
    let itemInventarioId = null
    let estadoAnalisisFinal = estadoAnalisisId
    const resultadosActuales = {}

    for (const ensayoPayload of payload.ensayos) {
      if (!ensayoPayload || typeof ensayoPayload !== 'object' || Array.isArray(ensayoPayload)) {
        throw new Error('cada ensayo debe ser un objeto valido')
      }

      const ensayoId = Number(ensayoPayload.ensayo_id)

      if (!Number.isInteger(ensayoId) || ensayoId <= 0) {
        throw new Error('ensayo_id debe ser un entero positivo')
      }

      if (
        ensayoPayload.tipo_ensayo === undefined ||
        ensayoPayload.tipo_ensayo === null ||
        String(ensayoPayload.tipo_ensayo).trim() === ''
      ) {
        throw new Error('tipo_ensayo es obligatorio')
      }

      if (typeof ensayoPayload.tipo_ensayo !== 'string') {
        throw new Error('tipo_ensayo debe ser texto')
      }

      const tipoEnsayoNormalizado = tiposEnsayoPermitidos.get(
        ensayoPayload.tipo_ensayo.trim().toLowerCase()
      )

      if (!tipoEnsayoNormalizado) {
        throw new Error(`tipo_ensayo no permitido: ${ensayoPayload.tipo_ensayo}`)
      }

      const ensayo = await obtenerEnsayoPorIdYAnalisisRepo(analisisId, ensayoId, t)

      if (!ensayo) {
        throw new Error(`ensayo no encontrado para analisis: ${ensayoId}`)
      }

      if (ensayo.tipo_ensayo !== tipoEnsayoNormalizado) {
        throw new Error(`tipo_ensayo no coincide con ensayo_id: ${ensayoId}`)
      }

      const detallePayload = obtenerDetalleEnsayoPayload(ensayoPayload, tipoEnsayoNormalizado)
      let detalleActualizado = null

      if (tipoEnsayoNormalizado === 'humedad') {
        const detalle = {}

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'peso_ensayo_g')) {
          detalle.peso_ensayo_g = parseNullableNumber(detallePayload.peso_ensayo_g, 'peso_ensayo_g')
        }

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'resultado')) {
          detalle.resultado = parseNullableNumber(detallePayload.resultado, 'resultado')
        }

        detalleActualizado = await actualizarEnsayoHumedadRepo(ensayoId, detalle, t)

        if (detalleActualizado?.resultado !== undefined) {
          resultadosActuales.humedad_actual = detalleActualizado.resultado
        }
      } else if (tipoEnsayoNormalizado === 'acido_carminico') {
        const detalle = {}

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'peso_ensayo_g')) {
          detalle.peso_ensayo_g = parseNullableNumber(detallePayload.peso_ensayo_g, 'peso_ensayo_g')
        }

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'absorbancia_nm')) {
          detalle.absorbancia_nm = parseNullableNumber(detallePayload.absorbancia_nm, 'absorbancia_nm')
        }

        if (
          detalle.peso_ensayo_g !== undefined &&
          detalle.peso_ensayo_g !== null &&
          detalle.absorbancia_nm !== undefined &&
          detalle.absorbancia_nm !== null
        ) {
          if (detalle.peso_ensayo_g <= 0) {
            throw new Error('peso_ensayo_g debe ser mayor a 0 para calcular concentracion de acido carminico')
          }

          detalle.resultado = (detalle.absorbancia_nm * 100) / (detalle.peso_ensayo_g * 13.9)
        } else if (Object.prototype.hasOwnProperty.call(detallePayload, 'resultado')) {
          detalle.resultado = parseNullableNumber(detallePayload.resultado, 'resultado')
        }

        detalleActualizado = await actualizarEnsayoAcidoCarminicoRepo(ensayoId, detalle, t)

        if (detalleActualizado?.resultado !== undefined) {
          resultadosActuales.concentracion_ac_actual = detalleActualizado.resultado
        }
      } else if (tipoEnsayoNormalizado === 'color_cielab') {
        const detalle = {}

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'peso_ensayo_g')) {
          detalle.peso_ensayo_g = parseNullableNumber(detallePayload.peso_ensayo_g, 'peso_ensayo_g')
        }

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'resultado_l')) {
          detalle.resultado_l = parseNullableNumber(detallePayload.resultado_l, 'resultado_l')
        }

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'resultado_a')) {
          detalle.resultado_a = parseNullableNumber(detallePayload.resultado_a, 'resultado_a')
        }

        const valorResultadoB = Object.prototype.hasOwnProperty.call(detallePayload, 'resultado_b')
          ? detallePayload.resultado_b
          : detallePayload.resultado_r

        if (
          Object.prototype.hasOwnProperty.call(detallePayload, 'resultado_b') ||
          Object.prototype.hasOwnProperty.call(detallePayload, 'resultado_r')
        ) {
          detalle.resultado_b = parseNullableNumber(valorResultadoB, 'resultado_b')
        }

        detalleActualizado = await actualizarEnsayoColorCielabRepo(ensayoId, detalle, t)

        if (detalleActualizado?.resultado_l !== undefined) {
          resultadosActuales.color_l_actual = detalleActualizado.resultado_l
        }

        if (detalleActualizado?.resultado_a !== undefined) {
          resultadosActuales.color_a_actual = detalleActualizado.resultado_a
        }

        if (detalleActualizado?.resultado_b !== undefined) {
          resultadosActuales.color_b_actual = detalleActualizado.resultado_b
        }
      }

      if (estadoAnalisisId === 2 && !ensayoTieneResultadosCompletos(tipoEnsayoNormalizado, detalleActualizado)) {
        throw new Error(`todos los ensayos deben tener resultados para finalizar el analisis: ${tipoEnsayoNormalizado}`)
      }

      const conformeCalculado = evaluarConformidadEnsayo(
        tipoEnsayoNormalizado,
        detalleActualizado,
        ensayo.conforme ?? null
      )

      const camposEnsayo = {}

      if (!Object.is(conformeCalculado, ensayo.conforme ?? null)) {
        camposEnsayo.conforme = conformeCalculado
      }

      if (estadoAnalisisId === 2 && conformeCalculado !== null && conformeCalculado !== undefined) {
        camposEnsayo.no_conformidad_abierta = conformeCalculado === false
      }

      const ensayoActualizado = await actualizarEnsayoLaboratorioRepo(
        ensayoId,
        camposEnsayo,
        t
      )

      actualizaciones.push({
        ...ensayoActualizado,
        detalle: detalleActualizado
      })
    }

    let analisisActualizado = null

    if (estadoAnalisisId === 2) {
      const conformidades = actualizaciones.map((ensayo) => ensayo.conforme)

      if (conformidades.some((conforme) => conforme === null || conforme === undefined)) {
        throw new Error('todos los ensayos deben tener resultados para finalizar el analisis')
      }

      if (conformidades.every((conforme) => conforme === true)) {
        estadoAnalisisFinal = 2
      } else if (conformidades.every((conforme) => conforme === false)) {
        estadoAnalisisFinal = 3
      } else {
        estadoAnalisisFinal = 4
      }
    }

    const camposAnalisis = {}

    if (estadoAnalisisFinal !== undefined) {
      camposAnalisis.estado_analisis_id = estadoAnalisisFinal
    }

    if (pesoMuestraG !== undefined) {
      camposAnalisis.peso_muestra_g = pesoMuestraG
    }

    if (observacionesAnalisis !== undefined) {
      camposAnalisis.observaciones = observacionesAnalisis
    }

    if (Object.keys(camposAnalisis).length) {
      analisisActualizado = await actualizarAnalisis(
        analisisId,
        camposAnalisis,
        t
      )

      if (analisisActualizado?.item_inventario_id) {
        itemInventarioId = Number(analisisActualizado.item_inventario_id)
      }
    } else {
      analisisActualizado = await actualizarModificadoEnAnalisisRepo(analisisId, t)

      if (analisisActualizado?.item_inventario_id) {
        itemInventarioId = Number(analisisActualizado.item_inventario_id)
      }
    }

    if (estadoAnalisisFinal !== undefined && itemInventarioId) {
      let nuevoEstadoLoteId = null

      if (estadoAnalisisFinal === 1 || estadoAnalisisFinal === 4) {
        nuevoEstadoLoteId = 6
      } else if (estadoAnalisisFinal === 2) {
        nuevoEstadoLoteId = 1
      } else if (estadoAnalisisFinal === 3) {
        nuevoEstadoLoteId = 2
      }

      if (nuevoEstadoLoteId !== null) {
        await actualizarEstadoLotePorItemInventario(itemInventarioId, nuevoEstadoLoteId, t)
      }

      if (estadoAnalisisFinal === 2) {
        await actualizarResultadosActualesPorItemInventario(itemInventarioId, resultadosActuales, t)

        const tiposEnsayoConformes = [
          ...new Set(
            actualizaciones
              .filter((ensayo) => ensayo.conforme === true)
              .map((ensayo) => ensayo.tipo_ensayo)
          )
        ]

        await cerrarNoConformidadesAbiertasPorReanalisisRepo(
          itemInventarioId,
          analisisId,
          tiposEnsayoConformes,
          t
        )
      }
    }

    return {
      analisis_id: analisisId,
      estado_analisis_id: analisisActualizado?.estado_analisis_id ?? estadoAnalisisFinal ?? null,
      peso_muestra_g: analisisActualizado?.peso_muestra_g ?? pesoMuestraG ?? null,
      observaciones: analisisActualizado?.observaciones ?? observacionesAnalisis ?? null,
      ensayos: actualizaciones
    }
  })
}

export const aprobarODesaprobarAnalisisService = async (analisis_id, payload = {}) => {
  const analisisId = Number(analisis_id)

  if (!Number.isInteger(analisisId) || analisisId <= 0) {
    throw new Error('analisis_id debe ser un entero positivo')
  }

  const aprobado = payload.aprobado

  if (typeof aprobado !== 'boolean') {
    throw new Error('aprobado debe ser booleano')
  }

  if (
    payload.observaciones !== undefined &&
    payload.observaciones !== null &&
    typeof payload.observaciones !== 'string'
  ) {
    throw new Error('observaciones debe ser texto')
  }

  if (
    payload.mensaje_gerencia !== undefined &&
    payload.mensaje_gerencia !== null &&
    typeof payload.mensaje_gerencia !== 'string'
  ) {
    throw new Error('mensaje_gerencia debe ser texto')
  }

  return await db.tx(async (t) => {
    const analisis = await obtenerAnalisisPorId(analisisId, t)

    if (!analisis) {
      throw new Error('analisis no encontrado')
    }

    if (Number(analisis.estado_analisis_id) !== 4) {
      throw new Error('analisis no esta en revision')
    }

    const itemInventarioId = Number(analisis.item_inventario_id)

    if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
      throw new Error('analisis no tiene item_inventario_id valido')
    }

    const ensayos = await listarEnsayosPorAnalisisRepo(analisisId, t)
    const ensayosConformes = ensayos.filter((ensayo) => ensayo.conforme === true)
    const ensayosNoConformes = ensayos.filter((ensayo) => ensayo.conforme === false)
    const resultadosActuales = {}
    const observacionesFinales = payload.observaciones?.trim()
      || String(analisis.observaciones ?? '').trim()
      || (aprobado ? 'Analisis aprobado' : 'Analisis no aprobado')
    const tiposEnsayoNoConformes = [...new Set(ensayosNoConformes.map((ensayo) => ensayo.tipo_ensayo))]
    const observacionesLote = aprobado
      ? observacionesFinales
      : `lote bloqueado por no conformidad en el ensayo ${tiposEnsayoNoConformes.join(', ')}, se pide analizar de nuevo`
    const mensajeGerencia = payload.mensaje_gerencia?.trim() || null

    if (aprobado) {
      for (const ensayo of ensayos) {
        Object.assign(resultadosActuales, extraerResultadosActualesDesdeEnsayo(ensayo))

        if (ensayo.conforme === false) {
          await actualizarEnsayoLaboratorioRepo(
            ensayo.ensayo_id,
            { no_conformidad_abierta: false },
            t
          )
        }
      }
    } else {
      for (const ensayo of ensayosConformes) {
        Object.assign(resultadosActuales, extraerResultadosActualesDesdeEnsayo(ensayo))
      }

      for (const ensayo of ensayosNoConformes) {
        await actualizarEnsayoLaboratorioRepo(
          ensayo.ensayo_id,
          { no_conformidad_abierta: true },
          t
        )
      }
    }

    const analisisActualizado = await actualizarAnalisis(
      analisisId,
      {
        estado_analisis_id: 2,
        observaciones: observacionesFinales
      },
      t
    )

    await actualizarResultadosActualesPorItemInventario(itemInventarioId, resultadosActuales, t)
    await actualizarObservacionesPorItemInventario(itemInventarioId, observacionesLote, t)

    let solicitudReanalisis = null

    if (aprobado) {
      await actualizarEstadoLotePorItemInventario(itemInventarioId, 1, t)
    } else {
      await actualizarEstadoLotePorItemInventario(itemInventarioId, 3, t)

      if (ensayosNoConformes.length) {
        solicitudReanalisis = await crearSolicitudAnalisisLaboratorioRepo(
          {
            item_inventario_id: itemInventarioId,
            usuario_id: Number(analisis.usuario_id),
            observacion_laboratorio: observacionesFinales
          },
          t
        )

        for (const tipoEnsayo of tiposEnsayoNoConformes) {
          await crearSolicitudParametroLaboratorioRepo(solicitudReanalisis.solicitud_id, tipoEnsayo, t)
        }
      }
    }

    return {
      analisis_id: analisisId,
      aprobado,
      estado_analisis_id: analisisActualizado?.estado_analisis_id ?? 2,
      estado_lote_id: aprobado ? 1 : 3,
      observaciones_lote: observacionesLote,
      solicitud_reanalisis: solicitudReanalisis,
      mensaje_gerencia_enviado: Boolean(mensajeGerencia),
      mensaje_gerencia: mensajeGerencia,
      ensayos_no_conformes: ensayosNoConformes.map((ensayo) => ({
        ensayo_id: ensayo.ensayo_id,
        tipo_ensayo: ensayo.tipo_ensayo,
        no_conformidad_abierta: aprobado ? false : true
      }))
    }
  })
}

export const eliminarAnalisisService = async (analisis_id) => {
    const eliminado = await eliminarAnalisis(analisis_id);
    return eliminado;
}
