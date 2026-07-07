import db from '../../../config/database.js'
import {
  procesarMovimientoAlmacenService,
  createAjusteMovimientoAlmacenService
} from '../../inventario/services/movimiento_almacen_services.js'
import {
  actualizarCodigoItemInventarioRepo,
  crearItemInventarioRepo
} from '../../inventario/repositories/item_inventario_repositories.js'

import {
  obtenerComposicionesPorLoteResultanteRepo,
  eliminarComposicionLoteCochinillaRepo,
  crearComposicionLoteCochinillaRepo,
  actualizarPorcentajesPorLoteResultanteRepo
} from '../repositories/composicion_lote_cochinilla_repositories.js'

import {
  crearLoteCochinillaPorCompraRepo,
  crearLoteCochinillaPorMezclaRepo,
  listarLotesCochinillaRepo,
  listarLotesCochinillaDisponiblesRepo,
  obtenerLoteCochinillaPorIdRepo,
  obtenerResumenLotesCochinillaRepo,
  actualizarAnalisisLoteCochinillaRepo,
  actualizarEstadoLoteCochinillaRepo,
  actualizarStockActualLoteCochinillaRepo,
  actualizarConsumoLoteCochinillaRepo,
  actualizarMasaLoteCochinillaPorDeltaRepo,
  actualizarCostosYMasaLoteCochinillaRepo,
  eliminarLoteCochinillaRepo
} from '../repositories/lote_cochinilla_repositories.js'
import {
  crearSolicitudAnalisisLaboratorioRepo,
  crearSolicitudParametroLaboratorioRepo
} from '../../laboratorio/repositories/solicitud_analisis_repositories.js'




/* ======================================================
   HELPERS: generación de código
====================================================== */

// ejemplo simple de código para compra:
// COCH-COMP-<proveedor_id>-<yyyymmdd>-<calidad>
const generarCodigoLoteCompra = (data) => {
  const fechaBase = new Date(data.fecha_creacion ?? data.fecha_compra)
  const ahora = new Date()

  const fecha = fechaBase.toISOString().slice(0, 10).replace(/-/g, '')
  const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, '')
  const milisegundos = String(ahora.getMilliseconds()).padStart(3, '0')

  const proveedor = data.proveedor_id
  const calidad = (data.calidad_cochinilla ?? 'SIN-CALIDAD').toUpperCase()

  return `COCH-COMP-${proveedor}-${fecha}-${hora}${milisegundos}-${calidad}`
}

// ejemplo simple de código para mezcla:
// COCH-PREP-<yyyymmddhhmmss>
const generarCodigoLoteMezcla = () => {
  const now = new Date()

  const fecha = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const hora = now.toTimeString().slice(0, 8).replace(/:/g, '')  // HHMMSS

  return `COCH-PREP-${fecha}-${hora}`
}

const calcularCostoPuntoAcDolares = ({
  costo_total_actual,
  stock_actual,
  concentracion_ac_actual
}) => {
  const costoTotalActual = Number(costo_total_actual)
  const stockActual = Number(stock_actual)
  const concentracionActual = Number(concentracion_ac_actual)

  if (
    Number.isNaN(costoTotalActual) ||
    Number.isNaN(stockActual) ||
    Number.isNaN(concentracionActual) ||
    stockActual <= 0 ||
    concentracionActual <= 0
  ) {
    return null
  }

  return costoTotalActual / (stockActual * concentracionActual)
}

const crearSolicitudAnalisisInicialCochinilla = async (
  { item_inventario_id, usuario_id, observacion_laboratorio },
  t
) => {
  const solicitud = await crearSolicitudAnalisisLaboratorioRepo(
    {
      item_inventario_id,
      usuario_id,
      observacion_laboratorio:
        observacion_laboratorio ??
        'Solicitud automatica de analisis inicial de humedad y acido carminico'
    },
    t
  )

  await crearSolicitudParametroLaboratorioRepo(solicitud.solicitud_id, 'humedad', t)
  await crearSolicitudParametroLaboratorioRepo(solicitud.solicitud_id, 'acido_carminico', t)

  return solicitud
}

export const obtenerResumenLotesCochinillaService = async () => {
  return await obtenerResumenLotesCochinillaRepo()
}

/* ======================================================
   CREATE: compra
====================================================== */
export const crearLoteCochinillaPorCompraService = async (data) => {
  if (!data.proveedor_id) {
    throw new Error('proveedor_id es obligatorio')
  }

  if (!data.almacen_id) {
    throw new Error('almacen_id es obligatorio')
  }

  if (!data.fecha_creacion && !data.fecha_compra) {
    throw new Error('fecha_creacion es obligatoria')
  }

  if (!data.stock_inicial || Number(data.stock_inicial) <= 0) {
    throw new Error('stock_inicial debe ser mayor a 0')
  }

  if (data.costo_total_inicial == null || Number(data.costo_total_inicial) <= 0) {
    throw new Error('costo_total_inicial debe ser mayor a 0')
  }

  const stockInicial = Number(data.stock_inicial)
  const costoTotalInicial = Number(data.costo_total_inicial)
  const costoUnitario = costoTotalInicial / stockInicial
  const fechaCreacion = data.fecha_creacion ?? data.fecha_compra

  const codigoLote = generarCodigoLoteCompra(data)

  return await db.tx(async (t) => {
    const itemInventarioCreado = await crearItemInventarioRepo(
      {
        nombre_item: 'Cochinilla',
        codigo_item: 'COCH-PENDIENTE'
      },
      t
    )

    const itemInventario = await actualizarCodigoItemInventarioRepo(
      itemInventarioCreado.item_inventario_id,
      `COCH-${itemInventarioCreado.item_inventario_id}`,
      t
    )

    const loteCreado = await crearLoteCochinillaPorCompraRepo(
      {
        ...data,
        item_inventario_id: itemInventario.item_inventario_id,
        creado_por: data.creado_por ?? null,
        codigo_lote: codigoLote,
        tipo_lote: 'comprado',
        fecha_creacion: fechaCreacion,
        stock_inicial: stockInicial,
        stock_actual: 0,
        estado_lote_id: 2,
        costo_total_inicial: costoTotalInicial,
        costo_total_actual: costoTotalInicial,
        costo_unitario: costoUnitario,
        unidad_medida_stock: data.unidad_medida_stock ?? data.unidad_medida_cantidad ?? 'kg',
        unidad_medida_dinero: data.unidad_medida_dinero ?? data.unidad_medida_moneda ?? 'USD'
      },
      t
    )

    await procesarMovimientoAlmacenService(
      {
        usuario_id: data.creado_por ?? null,
        item_inventario_id: itemInventario.item_inventario_id,
        tipo_movimientos_almacen_id: 1,
        motivo_movimiento: 'compra',
        cantidad: stockInicial,
        observaciones: 'Ingreso inicial por compra de lote_cochinilla',
        almacen_origen_id: null,
        almacen_destino_id: data.almacen_id
      },
      t
    )

    await crearSolicitudAnalisisInicialCochinilla(
      {
        item_inventario_id: itemInventario.item_inventario_id,
        usuario_id: data.creado_por ?? 1,
        observacion_laboratorio: data.observacion_laboratorio ?? null
      },
      t
    )

    return await obtenerLoteCochinillaPorIdRepo(loteCreado.lote_cochinilla_id)
  })
}
/* ======================================================
   CREATE: mezcla / preparado
====================================================== */
export const crearLoteCochinillaPorMezclaService = async (data) => {
  if (!data.almacen_id) {
    throw new Error('almacen_id es obligatorio')
  }

  if (!Array.isArray(data.componentes) || data.componentes.length === 0) {
    throw new Error('componentes es obligatorio y debe tener al menos un lote componente')
  }

  const codigoLote = generarCodigoLoteMezcla(data)

  return await db.tx(async (t) => {
    let stockInicial = 0
    let costoTotalInicial = 0
    let sumaConcentracionPonderada = 0
    let sumaHumedadPonderada = 0
    let tieneHumedadCompleta = true

    const componentesValidados = []

    for (const componente of data.componentes) {
      if (!componente?.lote_componente_id) {
        throw new Error('Cada componente debe incluir lote_componente_id')
      }

      if (componente.peso_utilizado_kg == null || Number(componente.peso_utilizado_kg) <= 0) {
        throw new Error('Cada componente debe incluir peso_utilizado_kg mayor a 0')
      }

      const loteComponente = await obtenerLoteCochinillaPorIdRepo(
        componente.lote_componente_id,
        t
      )

      if (!loteComponente) {
        throw new Error(`Lote componente ${componente.lote_componente_id} no encontrado`)
      }

      const pesoUtilizado = Number(componente.peso_utilizado_kg)
      const stockActualComponente = Number(loteComponente.stock_actual ?? 0)

      if (pesoUtilizado > stockActualComponente) {
        throw new Error(
          `El lote componente ${componente.lote_componente_id} no tiene stock suficiente`
        )
      }

      if (
        loteComponente.concentracion_ac_actual == null ||
        Number.isNaN(Number(loteComponente.concentracion_ac_actual))
      ) {
        throw new Error(
          `El lote componente ${componente.lote_componente_id} no tiene concentracion_ac_actual valida`
        )
      }

      const concentracionActual = Number(loteComponente.concentracion_ac_actual)
      const humedadActual =
        loteComponente.humedad_actual == null || Number.isNaN(Number(loteComponente.humedad_actual))
          ? null
          : Number(loteComponente.humedad_actual)
      const costoUnitarioComponente = Number(loteComponente.costo_unitario ?? 0)

      stockInicial += pesoUtilizado
      costoTotalInicial += pesoUtilizado * costoUnitarioComponente
      sumaConcentracionPonderada += pesoUtilizado * concentracionActual

      if (humedadActual === null) {
        tieneHumedadCompleta = false
      } else {
        sumaHumedadPonderada += pesoUtilizado * humedadActual
      }

      componentesValidados.push({
        lote_componente_id: Number(componente.lote_componente_id),
        item_inventario_id: Number(loteComponente.item_inventario_id),
        peso_utilizado_kg: pesoUtilizado,
        observaciones: componente.observaciones ?? null
      })
    }

    const costoUnitario = stockInicial > 0 ? costoTotalInicial / stockInicial : 0
    const concentracionActual = stockInicial > 0 ? sumaConcentracionPonderada / stockInicial : null
    const humedadActual =
      stockInicial > 0 && tieneHumedadCompleta ? sumaHumedadPonderada / stockInicial : null

    const itemInventarioCreado = await crearItemInventarioRepo(
      {
        nombre_item: 'Cochinilla',
        codigo_item: 'COCH-PENDIENTE'
      },
      t
    )

    const itemInventario = await actualizarCodigoItemInventarioRepo(
      itemInventarioCreado.item_inventario_id,
      `COCH-${itemInventarioCreado.item_inventario_id}`,
      t
    )

    const loteCreado = await crearLoteCochinillaPorMezclaRepo(
      {
        ...data,
        item_inventario_id: itemInventario.item_inventario_id,
        creado_por: data.creado_por ?? null,
        stock_inicial: stockInicial,
        stock_actual: 0,
        costo_total_inicial: costoTotalInicial,
        costo_total_actual: costoTotalInicial,
        costo_unitario: costoUnitario,
        concentracion_ac_actual: concentracionActual,
        humedad_actual: humedadActual,
        codigo_lote: codigoLote,
        tipo_lote: 'preparado',
        estado_lote_id: 2,
        fecha_creacion: data.fecha_creacion ?? new Date()
      },
      t
    )

    for (const componente of componentesValidados) {
      await crearComposicionLoteCochinillaRepo(
        {
          lote_resultante_id: loteCreado.lote_cochinilla_id,
          lote_componente_id: componente.lote_componente_id,
          peso_utilizado_kg: componente.peso_utilizado_kg,
          porcentaje_participacion: null,
          observaciones: componente.observaciones
        },
        t
      )

      await procesarMovimientoAlmacenService(
        {
          usuario_id: data.creado_por ?? null,
          item_inventario_id: componente.item_inventario_id,
          tipo_movimientos_almacen_id: 2,
          motivo_movimiento: 'mezcla',
          cantidad: componente.peso_utilizado_kg,
          observaciones:
            componente.observaciones ??
            `Salida por mezcla hacia lote ${codigoLote}`,
          almacen_origen_id: null,
          almacen_destino_id: null
        },
        t
      )

      const loteComponente = await obtenerLoteCochinillaPorIdRepo(
        componente.lote_componente_id,
        t
      )

      const nuevoStockActual = Number(loteComponente.stock_actual ?? 0)
      const nuevoEstadoLoteId = nuevoStockActual === 0 ? 4 : 1

      await actualizarEstadoLoteCochinillaRepo(
        componente.lote_componente_id,
        nuevoEstadoLoteId,
        t
      )
    }

    await procesarMovimientoAlmacenService(
      {
        usuario_id: data.creado_por ?? null,
        item_inventario_id: itemInventario.item_inventario_id,
        tipo_movimientos_almacen_id: 1,
        motivo_movimiento: 'mezcla',
        cantidad: stockInicial,
        observaciones: `Ingreso inicial por mezcla de lote_cochinilla ${codigoLote}`,
        almacen_origen_id: null,
        almacen_destino_id: data.almacen_id
      },
      t
    )

    await actualizarPorcentajesPorLoteResultanteRepo(loteCreado.lote_cochinilla_id, t)

    await crearSolicitudAnalisisInicialCochinilla(
      {
        item_inventario_id: itemInventario.item_inventario_id,
        usuario_id: data.creado_por ?? 1,
        observacion_laboratorio: data.observacion_laboratorio ?? null
      },
      t
    )

    return await obtenerLoteCochinillaPorIdRepo(loteCreado.lote_cochinilla_id, t)
  })
}
/* ======================================================
   READ
====================================================== */
export const listarLotesCochinillaService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.almacen_id !== undefined) {
    const almacenId = Number(filters.almacen_id)

    if (!Number.isInteger(almacenId) || almacenId <= 0) {
      throw new Error('almacen_id debe ser un entero positivo')
    }

    parsedFilters.almacen_id = almacenId
  }

  if (filters.proveedor_id !== undefined) {
    const proveedorId = Number(filters.proveedor_id)

    if (!Number.isInteger(proveedorId) || proveedorId <= 0) {
      throw new Error('proveedor_id debe ser un entero positivo')
    }

    parsedFilters.proveedor_id = proveedorId
  }

  if (filters.calidad_cochinilla !== undefined) {
    parsedFilters.calidad_cochinilla = filters.calidad_cochinilla.trim()
  }

  if (filters.tipo_lote !== undefined) {
    parsedFilters.tipo_lote = filters.tipo_lote.trim()
  }

  if (filters.estado_lote !== undefined) {
    parsedFilters.estado_lote = filters.estado_lote.trim()
  }

  return await listarLotesCochinillaRepo(parsedFilters)
}

export const listarLotesCochinillaDisponiblesService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.calidad_cochinilla !== undefined && filters.calidad_cochinilla !== '') {
    parsedFilters.calidad_cochinilla = String(filters.calidad_cochinilla).trim()
  }

  if (filters.almacen_nombre !== undefined && filters.almacen_nombre !== '') {
    parsedFilters.almacen_nombre = String(filters.almacen_nombre).trim()
  }

  if (
    filters.concentracion_ac_actual_min !== undefined &&
    filters.concentracion_ac_actual_min !== ''
  ) {
    const min = Number(filters.concentracion_ac_actual_min)

    if (Number.isNaN(min)) {
      throw new Error('concentracion_ac_actual_min debe ser numerico')
    }

    parsedFilters.concentracion_ac_actual_min = min
  }

  if (
    filters.concentracion_ac_actual_max !== undefined &&
    filters.concentracion_ac_actual_max !== ''
  ) {
    const max = Number(filters.concentracion_ac_actual_max)

    if (Number.isNaN(max)) {
      throw new Error('concentracion_ac_actual_max debe ser numerico')
    }

    parsedFilters.concentracion_ac_actual_max = max
  }

  if (
    parsedFilters.concentracion_ac_actual_min !== undefined &&
    parsedFilters.concentracion_ac_actual_max !== undefined &&
    parsedFilters.concentracion_ac_actual_min > parsedFilters.concentracion_ac_actual_max
  ) {
    throw new Error(
      'concentracion_ac_actual_min no puede ser mayor que concentracion_ac_actual_max'
    )
  }

  return await listarLotesCochinillaDisponiblesRepo(parsedFilters)
}

export const obtenerLoteCochinillaPorIdService = async (id) => {
  const loteId = Number(id)

  if (!Number.isInteger(loteId) || loteId <= 0) {
    throw new Error('id debe ser un entero positivo')
  }

  const lote = await obtenerLoteCochinillaPorIdRepo(loteId)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  return lote
}

/* ======================================================
   UPDATE: análisis
====================================================== */
export const actualizarAnalisisLoteCochinillaService = async (id, data) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  const concentracionActual =
    data.concentracion_ac_actual ?? lote.concentracion_ac_actual ?? null

  const costoPuntoAcDolares = calcularCostoPuntoAcDolares({
    costo_total_actual: lote.costo_total_actual,
    stock_actual: lote.stock_actual,
    concentracion_ac_actual: concentracionActual
  })

  return await actualizarAnalisisLoteCochinillaRepo(id, {
    analisis_actual_id: data.analisis_actual_id,
    concentracion_ac_actual: concentracionActual,
    humedad_actual: data.humedad_actual,
    costo_puntoac_dolares: costoPuntoAcDolares,
    estado_lote: 'disponible'
  })
}

export const actualizarEstadoLoteCochinillaService = async (id, data) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  if (data.estado_lote_id == null || data.estado_lote_id === '') {
    throw new Error('estado_lote_id es obligatorio')
  }

  const estadoLoteId = Number(data.estado_lote_id)

  if (!Number.isInteger(estadoLoteId) || estadoLoteId <= 0) {
    throw new Error('estado_lote_id debe ser un entero positivo')
  }

  return await actualizarEstadoLoteCochinillaRepo(id, estadoLoteId)
}

export const actualizarStockActualLoteCochinillaService = async (id, data) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  if (data.stock_actual == null || data.stock_actual === '') {
    throw new Error('stock_actual es obligatorio')
  }

  const nuevoStockActual = Number(data.stock_actual)

  if (Number.isNaN(nuevoStockActual)) {
    throw new Error('stock_actual debe ser numérico')
  }

  if (nuevoStockActual < 0) {
    throw new Error('stock_actual no puede ser negativo')
  }

  const stockInicial = Number(lote.stock_inicial)

  if (nuevoStockActual > stockInicial) {
    throw new Error('stock_actual no puede ser mayor que stock_inicial')
  }

  await createAjusteMovimientoAlmacenService({
    usuario_id: data.usuario_id ?? null,
    item_inventario_id: lote.item_inventario_id,
    motivo_movimiento: data.motivo_movimiento ?? 'regularizacion por conteo fisico',
    stock_actual_corregido: nuevoStockActual,
    observaciones: data.observaciones ?? 'Ajuste de stock desde lote_cochinilla'
  })

  return await obtenerLoteCochinillaPorIdRepo(id)
}


/* ======================================================
   UPDATE: consumo de lote de cochinilla
   ¿Para qué sirve?
   - actualizar la masa restante del lote luego de usarlo
   - validar que no se aumente masa por error
   - cambiar automáticamente el estado:
     - disponible  -> si no se ha consumido
     - usado       -> si queda algo de masa
     - agotado     -> si la masa llega a 0
====================================================== */
export const actualizarConsumoLoteCochinillaService = async (id, data) => {
  /* ------------------------------------------------------
     1. Buscar el lote actual en base de datos
     ¿Para qué?
     - para saber si el lote existe
     - para conocer la masa actual antes de actualizar
  ------------------------------------------------------ */
  const loteActual = await obtenerLoteCochinillaPorIdRepo(id)

  if (!loteActual) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  /* ------------------------------------------------------
     2. Validar que la nueva masa sí venga en el request
     ¿Para qué?
     - evitar updates incompletos
  ------------------------------------------------------ */
  if (data.stock_actual == null || data.stock_actual === '') {
    throw new Error('stock_actual es obligatorio')
  }

  const nuevoStockActual = Number(data.stock_actual)
  const stockActual = Number(loteActual.stock_actual)

  /* ------------------------------------------------------
     3. Validar que la nueva masa no sea negativa
     ¿Para qué?
     - evitar datos imposibles en inventario
  ------------------------------------------------------ */
  if (Number.isNaN(nuevoStockActual)) {
    throw new Error('stock_actual debe ser numérico')
  }

  if (nuevoStockActual < 0) {
    throw new Error('stock_actual no puede ser negativo')
  }

  /* ------------------------------------------------------
     4. Validar que la masa no aumente en un update de consumo
     ¿Para qué?
     - en un consumo, la masa solo puede mantenerse o disminuir
  ------------------------------------------------------ */
  if (nuevoStockActual > stockActual) {
    throw new Error('stock_actual no puede ser mayor que el stock actual del lote')
  }

  /* ------------------------------------------------------
     5. Calcular automáticamente el nuevo estado del lote
     ¿Para qué?
     - no depender de que frontend mande el estado correcto
     - mantener consistencia de negocio
  ------------------------------------------------------ */
  const nuevoEstadoLoteId = nuevoStockActual === 0 ? 4 : 1

  /* ------------------------------------------------------
     6. Guardar la nueva masa y el estado calculado
     ¿Para qué?
     - actualizar la base con una lógica coherente
  ------------------------------------------------------ */
  return await actualizarConsumoLoteCochinillaRepo(id, {
    stock_actual: nuevoStockActual,
    estado_lote_id: nuevoEstadoLoteId
  })
}


/* ======================================================
   UPDATE: actualizar masa de lote por delta
   delta > 0  => suma masa
   delta < 0  => resta masa
====================================================== */
export const actualizarMasaLoteCochinillaPorDeltaService = async (id, data) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  if (data.delta == null) {
    throw new Error('delta es obligatorio')
  }

  const delta = Number(data.delta)

  if (Number.isNaN(delta)) {
    throw new Error('delta debe ser numérico')
  }

  const masaActual = Number(lote.masa_total_kg)
  const nuevaMasa = masaActual + delta

  if (nuevaMasa < 0) {
    throw new Error('La masa resultante no puede ser negativa')
  }

  const loteActualizado = await actualizarMasaLoteCochinillaPorDeltaRepo(id, delta)

  return loteActualizado
}


/* ======================================================
   DELETE
   - si es comprado: elimina directo
   - si es preparado:
     1. devuelve masas a los componentes
     2. recalcula costo_total_dolares de componentes
     3. mantiene costo_kilo_dolares fijo en componentes
     4. actualiza estado de componentes a "usado"
     5. elimina composiciones hijas
     6. elimina el lote preparado
====================================================== */
export const eliminarLoteCochinillaService = async (id) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  return await db.tx(async (t) => {
    // caso simple: lote comprado
    if (lote.tipo_lote === 'comprado') {
      return await eliminarLoteCochinillaRepo(id, t)
    }

    // caso preparado: devolver masas, recalcular costos y borrar composiciones
    if (lote.tipo_lote === 'preparado') {
      const composiciones = await obtenerComposicionesPorLoteResultanteRepo(id, t)

      for (const composicion of composiciones) {
        const peso = Number(composicion.peso_utilizado_kg)

        const loteComponente = await obtenerLoteCochinillaPorIdRepo(
          composicion.lote_componente_id,
          t
        )

        if (!loteComponente) {
          throw new Error(`Lote componente ${composicion.lote_componente_id} no encontrado`)
        }

        const costoKiloComponente = Number(loteComponente.costo_kilo_dolares ?? 0)
        const masaComponenteAnterior = Number(loteComponente.masa_total_kg ?? 0)

        const nuevaMasaComponente = masaComponenteAnterior + peso
        const nuevoCostoTotalComponente = nuevaMasaComponente * costoKiloComponente
        const nuevoCostoKiloComponente = costoKiloComponente

        // devolver masa y recalcular costos del lote componente
        const loteComponenteActualizado = await actualizarCostosYMasaLoteCochinillaRepo(
          composicion.lote_componente_id,
          {
            masa_total_kg: nuevaMasaComponente,
            costo_total_dolares: nuevoCostoTotalComponente,
            costo_kilo_dolares: nuevoCostoKiloComponente
          },
          t
        )

        // actualizar estado del lote componente a "usado"
        await actualizarConsumoLoteCochinillaRepo(
          composicion.lote_componente_id,
          {
            masa_total_kg: loteComponenteActualizado.masa_total_kg,
            estado: 'usado'
          },
          t
        )

        // eliminar la composición hija
        await eliminarComposicionLoteCochinillaRepo(
          composicion.composicion_lote_cochinilla_id,
          t
        )
      }

      // finalmente eliminar el lote preparado
      return await eliminarLoteCochinillaRepo(id, t)
    }

    throw new Error('tipo_lote no válido para eliminación')
  })
}
