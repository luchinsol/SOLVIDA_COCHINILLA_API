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
      data: limpiarEnsayosAnalisis(analisisActivo)
    }
  }

  const solicitudPendiente = await obtenerSolicitudAnalisisPendientePorItemInventarioRepo(itemInventarioId)

  if (solicitudPendiente) {
    return {
      tipo: 'solicitud',
      data: solicitudPendiente
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

  const parseNullableNumber = (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
      return null
    }

    const parsed = Number(value)

    if (!Number.isFinite(parsed)) {
      throw new Error(`${fieldName} debe ser un numero valido`)
    }

    return parsed
  }

  if (
    datos.peso_muestra_g === undefined ||
    datos.peso_muestra_g === null ||
    datos.peso_muestra_g === ''
  ) {
    throw new Error('peso_muestra_g es obligatorio')
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
    peso_muestra_g: parseNullableNumber(datos.peso_muestra_g, 'peso_muestra_g'),
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

        if (Object.prototype.hasOwnProperty.call(detallePayload, 'resultado')) {
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

      const conformeCalculado = evaluarConformidadEnsayo(
        tipoEnsayoNormalizado,
        detalleActualizado,
        ensayo.conforme ?? null
      )

      const ensayoActualizado = await actualizarEnsayoLaboratorioRepo(
        ensayoId,
        Object.is(conformeCalculado, ensayo.conforme ?? null) ? {} : { conforme: conformeCalculado },
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

    if (estadoAnalisisFinal !== undefined) {
      analisisActualizado = await actualizarAnalisis(
        analisisId,
        { estado_analisis_id: estadoAnalisisFinal },
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
      }
    }

    return {
      analisis_id: analisisId,
      estado_analisis_id: analisisActualizado?.estado_analisis_id ?? estadoAnalisisFinal ?? null,
      ensayos: actualizaciones
    }
  })
}

export const aprobarAnalisisEnRevisionService = async (analisis_id, payload = {}) => {
  const analisisId = Number(analisis_id)

  if (!Number.isInteger(analisisId) || analisisId <= 0) {
    throw new Error('analisis_id debe ser un entero positivo')
  }

  if (
    payload.observaciones === undefined ||
    payload.observaciones === null ||
    String(payload.observaciones).trim() === ''
  ) {
    throw new Error('observaciones es obligatorio')
  }

  if (typeof payload.observaciones !== 'string') {
    throw new Error('observaciones debe ser texto')
  }

  if (
    payload.mensaje_gerencia !== undefined &&
    payload.mensaje_gerencia !== null &&
    typeof payload.mensaje_gerencia !== 'string'
  ) {
    throw new Error('mensaje_gerencia debe ser texto')
  }

  if (!Array.isArray(payload?.ensayos)) {
    throw new Error('ensayos debe ser un arreglo')
  }

  return await db.tx(async (t) => {
    const analisis = await obtenerAnalisisPorId(analisisId, t)

    if (!analisis) {
      throw new Error('analisis no encontrado')
    }

    const itemInventarioId = Number(analisis.item_inventario_id)

    if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
      throw new Error('analisis no tiene item_inventario_id valido')
    }

    const ensayos = await listarEnsayosPorAnalisisRepo(analisisId, t)
    const ensayosPorId = new Map(ensayos.map((ensayo) => [ensayo.ensayo_id, ensayo]))
    const decisionesPorId = new Map()

    for (const ensayoPayload of payload.ensayos) {
      if (!ensayoPayload || typeof ensayoPayload !== 'object' || Array.isArray(ensayoPayload)) {
        throw new Error('cada ensayo debe ser un objeto valido')
      }

      const ensayoId = Number(ensayoPayload.ensayo_id)

      if (!Number.isInteger(ensayoId) || ensayoId <= 0) {
        throw new Error('ensayo_id debe ser un entero positivo')
      }

      if (typeof ensayoPayload.aprobar_no_conformidad !== 'boolean') {
        throw new Error('aprobar_no_conformidad debe ser booleano')
      }

      const ensayo = ensayosPorId.get(ensayoId)

      if (!ensayo) {
        throw new Error(`ensayo no encontrado para analisis: ${ensayoId}`)
      }

      if (ensayo.conforme !== false) {
        throw new Error(`solo se pueden decidir ensayos no conformes: ${ensayoId}`)
      }

      decisionesPorId.set(ensayoId, ensayoPayload.aprobar_no_conformidad)
    }

    const resultadosActuales = {}
    const tiposReanalisis = []

    for (const ensayo of ensayos) {
      if (ensayo.conforme === true) {
        Object.assign(resultadosActuales, extraerResultadosActualesDesdeEnsayo(ensayo))
        await actualizarEnsayoLaboratorioRepo(
          ensayo.ensayo_id,
          { no_conformidad_abierta: false },
          t
        )
        continue
      }

      if (ensayo.conforme === false) {
        const aprobarNoConformidad = decisionesPorId.get(ensayo.ensayo_id)

        if (aprobarNoConformidad === undefined) {
          throw new Error(`falta decision para el ensayo no conforme: ${ensayo.ensayo_id}`)
        }

        if (aprobarNoConformidad) {
          await actualizarEnsayoLaboratorioRepo(
            ensayo.ensayo_id,
            { no_conformidad_abierta: false },
            t
          )
          Object.assign(resultadosActuales, extraerResultadosActualesDesdeEnsayo(ensayo))
        } else {
          await actualizarEnsayoLaboratorioRepo(
            ensayo.ensayo_id,
            { no_conformidad_abierta: true },
            t
          )
          tiposReanalisis.push(ensayo.tipo_ensayo)
        }
      }
    }

    const observacionesFinales = payload.mensaje_gerencia && String(payload.mensaje_gerencia).trim() !== ''
      ? `${payload.observaciones.trim()}\nMensaje a gerencia: ${payload.mensaje_gerencia.trim()}`
      : payload.observaciones.trim()

    const analisisActualizado = await actualizarAnalisis(
      analisisId,
      {
        estado_analisis_id: 2,
        observaciones: observacionesFinales
      },
      t
    )

    await actualizarResultadosActualesPorItemInventario(itemInventarioId, resultadosActuales, t)
    await actualizarObservacionesPorItemInventario(itemInventarioId, observacionesFinales, t)

    let solicitudCreada = null

    if (tiposReanalisis.length) {
      solicitudCreada = await crearSolicitudAnalisisLaboratorioRepo(
        {
          item_inventario_id: itemInventarioId,
          usuario_id: Number(analisis.usuario_id),
          observacion_laboratorio: payload.observaciones.trim()
        },
        t
      )

      for (const tipoEnsayo of [...new Set(tiposReanalisis)]) {
        await crearSolicitudParametroLaboratorioRepo(solicitudCreada.solicitud_id, tipoEnsayo, t)
      }

      await actualizarEstadoLotePorItemInventario(itemInventarioId, 2, t)
    } else {
      await actualizarEstadoLotePorItemInventario(itemInventarioId, 1, t)
    }

    return {
      analisis_id: analisisId,
      estado_analisis_id: analisisActualizado?.estado_analisis_id ?? 2,
      solicitud_reanalisis: solicitudCreada,
      ensayos: ensayos.map((ensayo) => ({
        ensayo_id: ensayo.ensayo_id,
        tipo_ensayo: ensayo.tipo_ensayo,
        conforme: ensayo.conforme,
        no_conformidad_abierta: ensayosPorId.get(ensayo.ensayo_id)?.conforme === false
          ? !decisionesPorId.get(ensayo.ensayo_id)
          : false
      }))
    }
  })
}

export const eliminarAnalisisService = async (analisis_id) => {
    const eliminado = await eliminarAnalisis(analisis_id);
    return eliminado;
}
