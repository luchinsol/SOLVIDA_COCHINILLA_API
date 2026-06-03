import db from '../../../config/database.js'
import {
  crearAnalisis,
  crearEnsayoAcidoCarminicoRepo,
  crearEnsayoColorCielabRepo,
  crearEnsayoHumedadRepo,
  crearEnsayoLaboratorioRepo,
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

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error('usuario_id debe ser un entero positivo')
  }

  if (!Number.isInteger(itemInventarioId) || itemInventarioId <= 0) {
    throw new Error('item_inventario_id debe ser un entero positivo')
  }

  if (
    datos.estado_analisis_id === undefined ||
    datos.estado_analisis_id === null ||
    datos.estado_analisis_id === ''
  ) {
    throw new Error('estado_analisis_id es obligatorio')
  }

  const estadoAnalisisId = Number(datos.estado_analisis_id)

  if (!Number.isInteger(estadoAnalisisId) || estadoAnalisisId <= 0) {
    throw new Error('estado_analisis_id debe ser un entero positivo')
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

  if (!Array.isArray(datos.tipos_ensayo) || !datos.tipos_ensayo.length) {
    throw new Error('tipos_ensayo debe ser un arreglo con al menos un ensayo')
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

  const tiposEnsayoNormalizados = [...new Set(datos.tipos_ensayo.map((tipo) => {
    if (typeof tipo !== 'string') {
      throw new Error('cada tipo de ensayo debe ser texto')
    }

    const tipoNormalizado = tiposEnsayoPermitidos.get(tipo.trim().toLowerCase())

    if (!tipoNormalizado) {
      throw new Error(`tipo de ensayo no permitido: ${tipo}`)
    }

    return tipoNormalizado
  }))]

  const actualizarEstadoLotePorAnalisis = async (itemInventarioId, estadoAnalisisId, t) => {
    if (estadoAnalisisId !== 1 && estadoAnalisisId !== 6) {
      return
    }

    await actualizarEstadoLotePorItemInventario(itemInventarioId, 6, t)
  }

  const analisisNormalizado = {
    usuario_id: usuarioId,
    observaciones: datos.observaciones.trim(),
    peso_muestra_g: parseNullableNumber(datos.peso_muestra_g, 'peso_muestra_g'),
    item_inventario_id: itemInventarioId,
    estado_analisis_id: estadoAnalisisId,
    nombre: null
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

    await actualizarAnalisisActualPorItemInventario(itemInventarioId, analisisCreado.analisis_id, t)
    await actualizarEstadoLotePorAnalisis(itemInventarioId, estadoAnalisisId, t)

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
