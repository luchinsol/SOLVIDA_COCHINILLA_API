import {
  getMovimientosAlmacen,
  updateMovimientoAlmacen,
  createMovimientoAlmacen,
  deleteMovimientoAlmacen,
  obtenerTipoMovimientoAlmacenPorId,
  obtenerLotesPorItemInventarioId,
  actualizarSaldoLotePorMovimiento
} from '../repositories/movimiento_almacen_repositories.js'
import db from '../../../config/database.js'

const parsePositiveInteger = (value, fieldName, required = true) => {
  if (value == null || value === '') {
    if (required) {
      throw new Error(`${fieldName} es obligatorio`)
    }

    return null
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} debe ser un entero positivo`)
  }

  return parsed
}

const parseCantidad = (value) => {
  if (value == null || value === '') {
    throw new Error('cantidad es obligatoria')
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error('cantidad debe ser numérica')
  }

  if (parsed <= 0) {
    throw new Error('cantidad debe ser mayor a 0')
  }

  return parsed
}

const parseDelta = (value) => {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error('delta del tipo de movimiento no es válido')
  }

  return parsed
}

const parseFecha = (value, fieldName, boundary = 'exact') => {
  const rawValue = String(value).trim()
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
  let fecha

  if (isDateOnly) {
    const [year, month, day] = rawValue.split('-').map(Number)

    if (boundary === 'start') {
      fecha = new Date(year, month - 1, day, 0, 0, 0, 0)
    } else if (boundary === 'end') {
      fecha = new Date(year, month - 1, day, 23, 59, 59, 999)
    } else {
      fecha = new Date(year, month - 1, day)
    }
  } else {
    fecha = new Date(rawValue)
  }

  if (Number.isNaN(fecha.getTime())) {
    throw new Error(`${fieldName} debe ser una fecha válida`)
  }

  return fecha
}

const normalizarMovimientoDatos = (movimientoDatos) => {
  if (!movimientoDatos.motivo_movimiento || !movimientoDatos.motivo_movimiento.trim()) {
    throw new Error('motivo_movimiento es obligatorio')
  }

  const almacenOrigenId = parsePositiveInteger(
    movimientoDatos.almacen_origen_id,
    'almacen_origen_id',
    false
  )

  const almacenDestinoId = parsePositiveInteger(
    movimientoDatos.almacen_destino_id,
    'almacen_destino_id',
    false
  )

  if (
    almacenDestinoId != null &&
    almacenDestinoId === almacenOrigenId
  ) {
    throw new Error('almacen_destino_id no puede ser igual a almacen_origen_id')
  }

  return {
    usuario_id: parsePositiveInteger(movimientoDatos.usuario_id, 'usuario_id', false),
    item_inventario_id: parsePositiveInteger(
      movimientoDatos.item_inventario_id,
      'item_inventario_id'
    ),
    tipo_movimientos_almacen_id: parsePositiveInteger(
      movimientoDatos.tipo_movimientos_almacen_id,
      'tipo_movimientos_almacen_id'
    ),
    motivo_movimiento: movimientoDatos.motivo_movimiento.trim(),
    fecha_hora: movimientoDatos.fecha_hora ?? new Date(),
    cantidad: parseCantidad(movimientoDatos.cantidad),
    observaciones: movimientoDatos.observaciones ?? null,
    almacen_origen_id: almacenOrigenId,
    almacen_destino_id: almacenDestinoId
  }
}

export const getMovimientosAlmacenService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.almacen_id !== undefined && filters.almacen_id !== '') {
    parsedFilters.almacen_id = parsePositiveInteger(filters.almacen_id, 'almacen_id')
  }

  if (filters.codigo_item !== undefined && filters.codigo_item !== '') {
    parsedFilters.codigo_item = String(filters.codigo_item).trim()
  }

  if (filters.nombre_item !== undefined && filters.nombre_item !== '') {
    parsedFilters.nombre_item = String(filters.nombre_item).trim()
  }

  if (filters.tipo !== undefined && filters.tipo !== '') {
    parsedFilters.tipo = String(filters.tipo).trim()
  }

  if (filters.fecha_desde !== undefined && filters.fecha_desde !== '') {
    parsedFilters.fecha_desde = parseFecha(filters.fecha_desde, 'fecha_desde', 'start')
  }

  if (filters.fecha_hasta !== undefined && filters.fecha_hasta !== '') {
    parsedFilters.fecha_hasta = parseFecha(filters.fecha_hasta, 'fecha_hasta', 'end')
  }

  if (
    parsedFilters.fecha_desde &&
    parsedFilters.fecha_hasta &&
    parsedFilters.fecha_desde > parsedFilters.fecha_hasta
  ) {
    throw new Error('fecha_desde no puede ser mayor que fecha_hasta')
  }

  return await getMovimientosAlmacen(parsedFilters)
}

export const procesarMovimientoAlmacenService = async (movimientoDatos, t = db) => {
  const movimientoNormalizado = normalizarMovimientoDatos(movimientoDatos)

  return await t.tx(async (tx) => {
    const tipoMovimiento = await obtenerTipoMovimientoAlmacenPorId(
      movimientoNormalizado.tipo_movimientos_almacen_id,
      tx
    )

    if (!tipoMovimiento) {
      throw new Error('tipo_movimientos_almacen_id no encontrado')
    }

    const lotes = await obtenerLotesPorItemInventarioId(
      movimientoNormalizado.item_inventario_id,
      tx
    )

    if (lotes.length === 0) {
      throw new Error('No se encontró un lote asociado al item_inventario_id')
    }

    if (lotes.length > 1) {
      throw new Error('El item_inventario_id está asociado a más de un lote')
    }

    const lote = lotes[0]
    const delta = parseDelta(tipoMovimiento.delta)
    const stockActual = Number(lote.stock_actual ?? 0)
    const nuevoStockActual = stockActual + (movimientoNormalizado.cantidad * delta)

    if (nuevoStockActual < 0) {
      throw new Error('El movimiento deja el stock_actual en negativo')
    }

    const almacenActual = lote.almacen_id == null ? null : Number(lote.almacen_id)

    if (
      movimientoNormalizado.almacen_origen_id != null &&
      almacenActual != null &&
      movimientoNormalizado.almacen_origen_id !== almacenActual
    ) {
      throw new Error('almacen_origen_id no coincide con el almacen actual del lote')
    }

    const nuevoAlmacenId = movimientoNormalizado.almacen_destino_id ?? almacenActual

    const loteActualizado = await actualizarSaldoLotePorMovimiento(
      lote,
      nuevoStockActual,
      nuevoAlmacenId,
      tx
    )

    const movimientoCreado = await createMovimientoAlmacen(
      {
        ...movimientoNormalizado,
        saldo: nuevoStockActual
      },
      tx
    )

    return {
      ...movimientoCreado,
      lote_tabla: lote.lote_tabla,
      stock_actual_resultante: loteActualizado.stock_actual,
      almacen_id_resultante: loteActualizado.almacen_id
    }
  })
}

export const createMovimientoAlmacenService = async (movimientoDatos) => {
  return await procesarMovimientoAlmacenService(movimientoDatos)
}

export const updateMovimientoAlmacenService = async (movimiento_id, movimientoDatos) => {
  const movimientoId = parsePositiveInteger(movimiento_id, 'id')

  return await updateMovimientoAlmacen(
    movimientoId,
    {
      ...normalizarMovimientoDatos(movimientoDatos),
      saldo: movimientoDatos.saldo ?? null
    }
  )
}

export const deleteMovimientoAlmacenService = async (movimiento_id) => {
  const movimientoId = parsePositiveInteger(movimiento_id, 'id')
  return await deleteMovimientoAlmacen(movimientoId)
}
