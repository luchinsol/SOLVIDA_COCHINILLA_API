import {
  crearExtractoRepo,
  actualizarEstadoLoteExtractoRepo,
  actualizarStockActualExtractoRepo,
  listarExtractosRepo,
  obtenerExtractoPorIdRepo,
  obtenerResumenExtractosRepo
} from '../repositories/extracto_repositories.js'
import {
  actualizarCodigoItemInventarioRepo,
  crearItemInventarioRepo
} from '../../inventario/repositories/item_inventario_repositories.js'
import { createAjusteMovimientoAlmacenService } from '../../inventario/services/movimiento_almacen_services.js'
import {
  crearSolicitudAnalisisLaboratorioRepo,
  crearSolicitudParametroLaboratorioRepo
} from '../../laboratorio/repositories/solicitud_analisis_repositories.js'
import db from '../../../config/database.js'

const crearSolicitudAnalisisInicialExtracto = async (
  { item_inventario_id, usuario_id, observacion_laboratorio },
  t
) => {
  const solicitud = await crearSolicitudAnalisisLaboratorioRepo(
    {
      item_inventario_id,
      usuario_id,
      observacion_laboratorio:
        observacion_laboratorio ??
        'Solicitud automatica para analisis de acido carminico y color cielab'
    },
    t
  )

  await crearSolicitudParametroLaboratorioRepo(solicitud.solicitud_id, 'acido_carminico', t)
  await crearSolicitudParametroLaboratorioRepo(solicitud.solicitud_id, 'color_cielab', t)

  return solicitud
}

export const crearExtractoService = async (data) => {
  if (data.almacen_id == null || data.almacen_id === '') {
    throw new Error('almacen_id es obligatorio')
  }

  const almacenId = Number(data.almacen_id)

  if (!Number.isInteger(almacenId) || almacenId <= 0) {
    throw new Error('almacen_id debe ser un entero positivo')
  }

  if (data.proceso_filtrado_id == null || data.proceso_filtrado_id === '') {
    throw new Error('proceso_filtrado_id es obligatorio')
  }

  const procesoFiltradoId = Number(data.proceso_filtrado_id)

  if (!Number.isInteger(procesoFiltradoId) || procesoFiltradoId <= 0) {
    throw new Error('proceso_filtrado_id debe ser un entero positivo')
  }

  if (!data.nombre_extracto || !data.nombre_extracto.trim()) {
    throw new Error('nombre_extracto es obligatorio')
  }

  if (!data.tipo_extracto || !data.tipo_extracto.trim()) {
    throw new Error('tipo_extracto es obligatorio')
  }

  if (data.stock_inicial == null || data.stock_inicial === '') {
    throw new Error('stock_inicial es obligatorio')
  }

  if (data.costo_total_inicial == null || data.costo_total_inicial === '') {
    throw new Error('costo_total_inicial es obligatorio')
  }

  const stockInicial = Number(data.stock_inicial)
  const costoTotalInicial = Number(data.costo_total_inicial)

  if (Number.isNaN(stockInicial)) {
    throw new Error('stock_inicial debe ser numérico')
  }

  if (stockInicial < 0) {
    throw new Error('stock_inicial no puede ser negativo')
  }

  if (Number.isNaN(costoTotalInicial) || costoTotalInicial < 0) {
    throw new Error('costo_total_inicial debe ser numerico')
  }

  const costoUnitario = stockInicial > 0 ? costoTotalInicial / stockInicial : 0

  return await db.tx(async (t) => {
    const itemInventarioCreado = await crearItemInventarioRepo(
      {
        nombre_item: 'Extracto',
        codigo_item: 'EXT-PENDIENTE'
      },
      t
    )

    const itemInventario = await actualizarCodigoItemInventarioRepo(
      itemInventarioCreado.item_inventario_id,
      `EXT-${itemInventarioCreado.item_inventario_id}`,
      t
    )

    const extractoCreado = await crearExtractoRepo({
      item_inventario_id: itemInventario.item_inventario_id,
      almacen_id: almacenId,
      proceso_filtrado_id: procesoFiltradoId,
      nombre_extracto: data.nombre_extracto.trim(),
      tipo_extracto: data.tipo_extracto.trim(),
      stock_inicial: stockInicial,
      stock_actual: stockInicial,
      costo_total_inicial: costoTotalInicial,
      costo_total_actual: costoTotalInicial,
      costo_unitario: costoUnitario,
      estado_lote: 'disponible',
      observaciones: data.observaciones ?? null,
      unidad_medida_stock: data.unidad_medida_stock ?? 'kg',
      unidad_medida_dinero: 'USD'
    }, t)

    await crearSolicitudAnalisisInicialExtracto(
      {
        item_inventario_id: itemInventario.item_inventario_id,
        usuario_id: data.creado_por ?? 1,
        observacion_laboratorio: data.observacion_laboratorio ?? null
      },
      t
    )

    return extractoCreado
  })
}

export const listarExtractosService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.tipo_extracto !== undefined && filters.tipo_extracto.trim() !== '') {
    parsedFilters.tipo_extracto = filters.tipo_extracto.trim()
  }

  if (filters.estado_lote !== undefined && filters.estado_lote.trim() !== '') {
    parsedFilters.estado_lote = filters.estado_lote.trim()
  }

  if (filters.almacen_id !== undefined && filters.almacen_id !== '') {
    const almacenId = Number(filters.almacen_id)

    if (!Number.isInteger(almacenId) || almacenId <= 0) {
      throw new Error('almacen_id debe ser un entero positivo')
    }

    parsedFilters.almacen_id = almacenId
  }

  if (filters.proceso_filtrado_id !== undefined && filters.proceso_filtrado_id !== '') {
    const procesoFiltradoId = Number(filters.proceso_filtrado_id)

    if (!Number.isInteger(procesoFiltradoId) || procesoFiltradoId <= 0) {
      throw new Error('proceso_filtrado_id debe ser un entero positivo')
    }

    parsedFilters.proceso_filtrado_id = procesoFiltradoId
  }

  return await listarExtractosRepo(parsedFilters)
}

export const obtenerResumenExtractosService = async () => {
  return await obtenerResumenExtractosRepo()
}

export const actualizarEstadoLoteExtractoService = async (id, estadoLoteId) => {
  const extractoId = Number(id)

  if (!Number.isInteger(extractoId) || extractoId <= 0) {
    throw new Error('id debe ser un entero positivo')
  }

  const extracto = await obtenerExtractoPorIdRepo(extractoId)

  if (!extracto) {
    throw new Error('Extracto no encontrado')
  }

  if (estadoLoteId == null || estadoLoteId === '') {
    throw new Error('estado_lote_id es obligatorio')
  }

  const parsedEstadoLoteId = Number(estadoLoteId)

  if (!Number.isInteger(parsedEstadoLoteId) || parsedEstadoLoteId <= 0) {
    throw new Error('estado_lote_id debe ser un entero positivo')
  }

  return await actualizarEstadoLoteExtractoRepo(extractoId, parsedEstadoLoteId)
}

export const actualizarStockActualExtractoService = async (id, stockActual, options = {}) => {
  const extractoId = Number(id)

  if (!Number.isInteger(extractoId) || extractoId <= 0) {
    throw new Error('id debe ser un entero positivo')
  }

  const extracto = await obtenerExtractoPorIdRepo(extractoId)

  if (!extracto) {
    throw new Error('Extracto no encontrado')
  }

  if (stockActual == null || stockActual === '') {
    throw new Error('stock_actual es obligatorio')
  }

  const nuevoStockActual = Number(stockActual)

  if (Number.isNaN(nuevoStockActual)) {
    throw new Error('stock_actual debe ser numérico')
  }

  if (nuevoStockActual < 0) {
    throw new Error('stock_actual no puede ser negativo')
  }

  const stockInicial = Number(extracto.stock_inicial)

  if (nuevoStockActual > stockInicial) {
    throw new Error('stock_actual no puede ser mayor que stock_inicial')
  }

  await createAjusteMovimientoAlmacenService({
    usuario_id: options.usuario_id ?? null,
    item_inventario_id: extracto.item_inventario_id,
    motivo_movimiento: options.motivo_movimiento ?? 'regularizacion por conteo fisico',
    stock_actual_corregido: nuevoStockActual,
    observaciones: options.observaciones ?? 'Ajuste de stock desde extracto'
  })

  return await obtenerExtractoPorIdRepo(extractoId)
}
