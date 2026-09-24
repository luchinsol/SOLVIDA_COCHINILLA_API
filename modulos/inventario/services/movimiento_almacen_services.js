import {
  getMovimientosAlmacen,
  updateMovimientoAlmacen,
  createMovimientoAlmacen,
  deleteMovimientoAlmacen,
  obtenerTipoMovimientoAlmacenPorId,
  obtenerLotesPorItemInventarioId,
  actualizarStockInicialLotePorAjuste
} from '../repositories/movimiento_almacen_repositories.js'
import {
  actualizarStockPosicionRepo,
  asegurarPosicionStockRepo,
  bloquearPosicionesStockItemRepo,
  sincronizarStockTotalLoteRepo
} from '../repositories/stock_item_almacen_repositories.js'
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
    throw new Error('cantidad debe ser numerica')
  }

  if (parsed <= 0) {
    throw new Error('cantidad debe ser mayor a 0')
  }

  return parsed
}

const parseStockActualCorregido = (value) => {
  if (value == null || value === '') {
    throw new Error('stock_actual_corregido es obligatorio')
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error('stock_actual_corregido debe ser numerico')
  }

  if (parsed < 0) {
    throw new Error('stock_actual_corregido no puede ser negativo')
  }

  return parsed
}

const parseStockInicialCorregido = (value) => {
  if (value == null || value === '') {
    throw new Error('stock_inicial_corregido es obligatorio')
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error('stock_inicial_corregido debe ser numerico')
  }

  if (parsed < 0) {
    throw new Error('stock_inicial_corregido no puede ser negativo')
  }

  return parsed
}

const parseDelta = (value) => {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error('delta del tipo de movimiento no es valido')
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
    throw new Error(`${fieldName} debe ser una fecha valida`)
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

  if (almacenDestinoId != null && almacenDestinoId === almacenOrigenId) {
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

const normalizarAjusteMovimientoDatos = (movimientoDatos) => {
  if (!movimientoDatos.motivo_movimiento || !movimientoDatos.motivo_movimiento.trim()) {
    throw new Error('motivo_movimiento es obligatorio')
  }

  return {
    usuario_id: parsePositiveInteger(movimientoDatos.usuario_id, 'usuario_id', false),
    item_inventario_id: parsePositiveInteger(
      movimientoDatos.item_inventario_id,
      'item_inventario_id'
    ),
    almacen_id: parsePositiveInteger(movimientoDatos.almacen_id, 'almacen_id', false),
    motivo_movimiento: movimientoDatos.motivo_movimiento.trim(),
    fecha_hora: movimientoDatos.fecha_hora ?? new Date(),
    stock_actual_corregido:
      movimientoDatos.stock_actual_corregido === undefined ||
      movimientoDatos.stock_actual_corregido === null ||
      movimientoDatos.stock_actual_corregido === ''
        ? null
        : parseStockActualCorregido(movimientoDatos.stock_actual_corregido),
    stock_inicial_corregido:
      movimientoDatos.stock_inicial_corregido === undefined ||
      movimientoDatos.stock_inicial_corregido === null ||
      movimientoDatos.stock_inicial_corregido === ''
        ? null
        : parseStockInicialCorregido(movimientoDatos.stock_inicial_corregido),
    observaciones: movimientoDatos.observaciones ?? null
  }
}

const normalizarTrasladoMovimientoDatos = (movimientoDatos) => {
  if (!movimientoDatos.motivo_movimiento || !movimientoDatos.motivo_movimiento.trim()) {
    throw new Error('motivo_movimiento es obligatorio')
  }

  const almacenDestinoId = parsePositiveInteger(
    movimientoDatos.almacen_destino_id,
    'almacen_destino_id'
  )

  const almacenOrigenId = parsePositiveInteger(
    movimientoDatos.almacen_origen_id,
    'almacen_origen_id',
    false
  )

  if (almacenOrigenId != null && almacenDestinoId === almacenOrigenId) {
    throw new Error('almacen_destino_id no puede ser igual a almacen_origen_id')
  }

  return {
    usuario_id: parsePositiveInteger(movimientoDatos.usuario_id, 'usuario_id', false),
    item_inventario_id: parsePositiveInteger(
      movimientoDatos.item_inventario_id,
      'item_inventario_id'
    ),
    cantidad: parseCantidad(movimientoDatos.cantidad),
    motivo_movimiento: movimientoDatos.motivo_movimiento.trim(),
    fecha_hora: movimientoDatos.fecha_hora ?? new Date(),
    observaciones: movimientoDatos.observaciones ?? null,
    almacen_origen_id: almacenOrigenId,
    almacen_destino_id: almacenDestinoId
  }
}

const normalizarTextoClave = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const obtenerLoteUnico = async (itemInventarioId, t) => {
  const lotes = await obtenerLotesPorItemInventarioId(itemInventarioId, t)

  if (lotes.length === 0) {
    throw new Error('No se encontro un lote asociado al item_inventario_id')
  }

  if (lotes.length > 1) {
    throw new Error('El item_inventario_id esta asociado a mas de un lote')
  }

  return lotes[0]
}

const resolverPosicionOrigen = (posiciones, almacenOrigenId) => {
  if (almacenOrigenId != null) {
    const posicion = posiciones.find(
      (item) => Number(item.almacen_id) === Number(almacenOrigenId)
    )

    if (!posicion) {
      throw new Error('No existe una posicion de stock para el almacen_origen_id')
    }

    return posicion
  }

  const posicionesConStock = posiciones.filter((item) => Number(item.stock_actual) > 0)

  if (posicionesConStock.length === 0) {
    throw new Error('El item no tiene stock disponible en ningun almacen')
  }

  if (posicionesConStock.length > 1) {
    throw new Error('almacen_origen_id es obligatorio cuando el item esta en varios almacenes')
  }

  return posicionesConStock[0]
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

    const lote = await obtenerLoteUnico(movimientoNormalizado.item_inventario_id, tx)
    const delta = parseDelta(tipoMovimiento.delta)
    if (delta !== 1 && delta !== -1) {
      throw new Error('El tipo de movimiento no corresponde a una entrada o salida')
    }

    const esEntrada = delta === 1

    if (esEntrada && movimientoNormalizado.almacen_destino_id == null) {
      throw new Error('almacen_destino_id es obligatorio para una entrada')
    }

    if (esEntrada) {
      await asegurarPosicionStockRepo(
        movimientoNormalizado.item_inventario_id,
        movimientoNormalizado.almacen_destino_id,
        tx
      )
    }

    const posiciones = await bloquearPosicionesStockItemRepo(
      movimientoNormalizado.item_inventario_id,
      tx
    )

    let almacenOrigenId = null
    let almacenDestinoId = null
    let saldoOrigen = null
    let saldoDestino = null
    let cantidadConSigno

    if (esEntrada) {
      almacenDestinoId = movimientoNormalizado.almacen_destino_id
      const posicionDestino = posiciones.find(
        (item) => Number(item.almacen_id) === Number(almacenDestinoId)
      )
      const nuevoStockDestino =
        Number(posicionDestino?.stock_actual ?? 0) + movimientoNormalizado.cantidad

      await actualizarStockPosicionRepo(
        movimientoNormalizado.item_inventario_id,
        almacenDestinoId,
        nuevoStockDestino,
        tx
      )
      cantidadConSigno = movimientoNormalizado.cantidad
      saldoDestino = nuevoStockDestino
    } else {
      const posicionOrigen = resolverPosicionOrigen(
        posiciones,
        movimientoNormalizado.almacen_origen_id
      )
      almacenOrigenId = Number(posicionOrigen.almacen_id)
      const stockOrigen = Number(posicionOrigen.stock_actual)

      if (movimientoNormalizado.cantidad > stockOrigen) {
        throw new Error('La cantidad supera el stock disponible en el almacen de origen')
      }

      const nuevoStockOrigen = stockOrigen - movimientoNormalizado.cantidad
      await actualizarStockPosicionRepo(
        movimientoNormalizado.item_inventario_id,
        almacenOrigenId,
        nuevoStockOrigen,
        tx
      )
      cantidadConSigno = -movimientoNormalizado.cantidad
      saldoOrigen = nuevoStockOrigen
    }

    const stockSincronizado = await sincronizarStockTotalLoteRepo(
      movimientoNormalizado.item_inventario_id,
      tx
    )

    const movimientoCreado = await createMovimientoAlmacen(
      {
        ...movimientoNormalizado,
        cantidad: cantidadConSigno,
        saldo: esEntrada ? saldoDestino : saldoOrigen,
        saldo_origen: saldoOrigen,
        saldo_destino: saldoDestino,
        almacen_origen_id: almacenOrigenId,
        almacen_destino_id: almacenDestinoId
      },
      tx
    )

    return {
      ...movimientoCreado,
      lote_tabla: lote.lote_tabla,
      stock_total_resultante: stockSincronizado.stock_total
    }
  })
}

export const createMovimientoAlmacenService = async (movimientoDatos) => {
  return await procesarMovimientoAlmacenService(movimientoDatos)
}

export const createAjusteMovimientoAlmacenService = async (movimientoDatos, t = db) => {
  const movimientoNormalizado = normalizarAjusteMovimientoDatos(movimientoDatos)

  return await t.tx(async (tx) => {
    const tipoMovimiento = await obtenerTipoMovimientoAlmacenPorId(3, tx)

    if (!tipoMovimiento) {
      throw new Error('tipo_movimientos_almacen_id no encontrado')
    }

    const lote = await obtenerLoteUnico(movimientoNormalizado.item_inventario_id, tx)
    const motivoNormalizado = normalizarTextoClave(movimientoNormalizado.motivo_movimiento)

    if (
      motivoNormalizado === 'regularizacion por conteo fisico' &&
      movimientoNormalizado.almacen_id != null
    ) {
      await asegurarPosicionStockRepo(
        movimientoNormalizado.item_inventario_id,
        movimientoNormalizado.almacen_id,
        tx
      )
    }

    const posiciones = await bloquearPosicionesStockItemRepo(
      movimientoNormalizado.item_inventario_id,
      tx
    )
    const posicionAjustada = resolverPosicionOrigen(posiciones, movimientoNormalizado.almacen_id)
    const almacenAjustadoId = Number(posicionAjustada.almacen_id)
    const stockPosicionAnterior = Number(posicionAjustada.stock_actual)
    const stockTotalAnterior = posiciones.reduce(
      (total, posicion) => total + Number(posicion.stock_actual),
      0
    )
    const stockInicialActual = Number(lote.stock_inicial ?? 0)
    let cantidad = 0
    let saldo = stockPosicionAnterior
    let loteActualizado

    if (motivoNormalizado === 'regularizacion por conteo fisico') {
      if (movimientoNormalizado.stock_actual_corregido == null) {
        throw new Error('stock_actual_corregido es obligatorio')
      }

      const stockTotalResultante =
        stockTotalAnterior - stockPosicionAnterior + movimientoNormalizado.stock_actual_corregido

      if (stockTotalResultante > stockInicialActual) {
        throw new Error('stock_actual_corregido no puede ser mayor que stock_inicial')
      }

      cantidad = movimientoNormalizado.stock_actual_corregido - stockPosicionAnterior
      saldo = movimientoNormalizado.stock_actual_corregido

      await actualizarStockPosicionRepo(
        movimientoNormalizado.item_inventario_id,
        almacenAjustadoId,
        movimientoNormalizado.stock_actual_corregido,
        tx
      )

      await sincronizarStockTotalLoteRepo(movimientoNormalizado.item_inventario_id, tx)
      loteActualizado = await obtenerLoteUnico(movimientoNormalizado.item_inventario_id, tx)
    } else if (motivoNormalizado === 'error de registro de stock inicial') {
      const nuevoStockInicial =
        movimientoNormalizado.stock_inicial_corregido ??
        movimientoNormalizado.stock_actual_corregido

      if (nuevoStockInicial == null) {
        throw new Error('stock_inicial_corregido es obligatorio')
      }

      if (nuevoStockInicial < stockTotalAnterior) {
        throw new Error('stock_inicial_corregido no puede ser menor que stock_actual')
      }

      cantidad = 0
      saldo = stockPosicionAnterior
      await actualizarStockInicialLotePorAjuste(lote, nuevoStockInicial, tx)
      await sincronizarStockTotalLoteRepo(movimientoNormalizado.item_inventario_id, tx)
      loteActualizado = await obtenerLoteUnico(movimientoNormalizado.item_inventario_id, tx)
    } else {
      throw new Error('motivo_movimiento no es valido para ajuste')
    }

    const movimientoCreado = await createMovimientoAlmacen(
      {
        usuario_id: movimientoNormalizado.usuario_id,
        item_inventario_id: movimientoNormalizado.item_inventario_id,
        motivo_movimiento: movimientoNormalizado.motivo_movimiento,
        fecha_hora: movimientoNormalizado.fecha_hora,
        cantidad,
        saldo,
        saldo_origen: saldo,
        saldo_destino: saldo,
        observaciones: movimientoNormalizado.observaciones,
        almacen_origen_id: almacenAjustadoId,
        almacen_destino_id: almacenAjustadoId,
        tipo_movimientos_almacen_id: Number(tipoMovimiento.tipo_mov_id ?? 3)
      },
      tx
    )

    return {
      ...movimientoCreado,
      lote_tabla: lote.lote_tabla,
      stock_inicial_anterior: stockInicialActual,
      stock_actual_anterior: stockPosicionAnterior,
      stock_inicial_resultante: loteActualizado.stock_inicial,
      stock_actual_resultante: loteActualizado.stock_actual,
      almacen_id: almacenAjustadoId
    }
  })
}

export const createTrasladoMovimientoAlmacenService = async (movimientoDatos, t = db) => {
  const movimientoNormalizado = normalizarTrasladoMovimientoDatos(movimientoDatos)

  return await t.tx(async (tx) => {
    const tipoMovimiento = await obtenerTipoMovimientoAlmacenPorId(4, tx)

    if (!tipoMovimiento) {
      throw new Error('tipo_movimientos_almacen_id no encontrado')
    }

    const lote = await obtenerLoteUnico(movimientoNormalizado.item_inventario_id, tx)

    await asegurarPosicionStockRepo(
      movimientoNormalizado.item_inventario_id,
      movimientoNormalizado.almacen_destino_id,
      tx
    )

    const posiciones = await bloquearPosicionesStockItemRepo(
      movimientoNormalizado.item_inventario_id,
      tx
    )
    const posicionOrigen = resolverPosicionOrigen(
      posiciones,
      movimientoNormalizado.almacen_origen_id
    )
    const almacenOrigenId = Number(posicionOrigen.almacen_id)

    if (movimientoNormalizado.almacen_destino_id === almacenOrigenId) {
      throw new Error('almacen_destino_id no puede ser igual a almacen_origen_id')
    }

    const posicionDestino = posiciones.find(
      (posicion) =>
        Number(posicion.almacen_id) === Number(movimientoNormalizado.almacen_destino_id)
    )
    const stockOrigen = Number(posicionOrigen.stock_actual)
    const stockDestino = Number(posicionDestino?.stock_actual ?? 0)

    if (movimientoNormalizado.cantidad > stockOrigen) {
      throw new Error('La cantidad supera el stock disponible en el almacen de origen')
    }

    const saldoOrigen = stockOrigen - movimientoNormalizado.cantidad
    const saldoDestino = stockDestino + movimientoNormalizado.cantidad

    await actualizarStockPosicionRepo(
      movimientoNormalizado.item_inventario_id,
      almacenOrigenId,
      saldoOrigen,
      tx
    )
    await actualizarStockPosicionRepo(
      movimientoNormalizado.item_inventario_id,
      movimientoNormalizado.almacen_destino_id,
      saldoDestino,
      tx
    )
    const stockSincronizado = await sincronizarStockTotalLoteRepo(
      movimientoNormalizado.item_inventario_id,
      tx
    )

    const movimientoCreado = await createMovimientoAlmacen(
      {
        usuario_id: movimientoNormalizado.usuario_id,
        item_inventario_id: movimientoNormalizado.item_inventario_id,
        motivo_movimiento: movimientoNormalizado.motivo_movimiento,
        fecha_hora: movimientoNormalizado.fecha_hora,
        cantidad: movimientoNormalizado.cantidad,
        saldo: saldoOrigen,
        saldo_origen: saldoOrigen,
        saldo_destino: saldoDestino,
        observaciones: movimientoNormalizado.observaciones,
        almacen_origen_id: almacenOrigenId,
        almacen_destino_id: movimientoNormalizado.almacen_destino_id,
        tipo_movimientos_almacen_id: Number(tipoMovimiento.tipo_mov_id ?? 4)
      },
      tx
    )

    return {
      ...movimientoCreado,
      lote_tabla: lote.lote_tabla,
      stock_total_resultante: stockSincronizado.stock_total,
      stock_origen_resultante: saldoOrigen,
      stock_destino_resultante: saldoDestino
    }
  })
}

export const updateMovimientoAlmacenService = async (movimiento_id, movimientoDatos) => {
  const movimientoId = parsePositiveInteger(movimiento_id, 'id')

  return await updateMovimientoAlmacen(movimientoId, {
    ...normalizarMovimientoDatos(movimientoDatos),
    saldo: movimientoDatos.saldo ?? null
  })
}

export const deleteMovimientoAlmacenService = async (movimiento_id) => {
  const movimientoId = parsePositiveInteger(movimiento_id, 'id')
  return await deleteMovimientoAlmacen(movimientoId)
}
