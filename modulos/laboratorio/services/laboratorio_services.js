import db from '../../../config/database.js'
import {
  crearAnalisis,
  crearEnsayoAcidoCarminicoRepo,
  crearEnsayoColorCielabRepo,
  crearEnsayoHumedadRepo,
  crearEnsayoLaboratorioRepo,
  obtenerAnalisisActivoPorItemInventarioRepo,
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

  return analisis
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
      data: analisisActivo
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

export const eliminarAnalisisService = async (analisis_id) => {
    const eliminado = await eliminarAnalisis(analisis_id);
    return eliminado;
}
