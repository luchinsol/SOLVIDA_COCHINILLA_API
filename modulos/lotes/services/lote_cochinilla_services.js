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
  eliminarComposicionLoteCochinillaRepo
} from '../repositories/composicion_lote_cochinilla_repositories.js'

import {
  crearLoteCochinillaPorCompraRepo,
  crearLoteCochinillaPorMezclaRepo,
  listarLotesCochinillaRepo,
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




/* ======================================================
   HELPERS: generación de código
====================================================== */

// ejemplo simple de código para compra:
// COCH-COMP-<proveedor_id>-<yyyymmdd>-<calidad>
const generarCodigoLoteCompra = (data) => {
  const fechaBase = new Date(data.fecha_compra)
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

  if (!data.fecha_compra) {
    throw new Error('fecha_compra es obligatoria')
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
        stock_inicial: stockInicial,
        stock_actual: 0,
        estado_lote: 'por analizar',
        costo_total_inicial: costoTotalInicial,
        costo_total_actual: costoTotalInicial,
        costo_unitario: costoUnitario,
        unidad_medida_stock: 'kg',
        unidad_medida_dinero: 'UDS'
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

  if (data.stock_inicial != null && Number(data.stock_inicial) < 0) {
    throw new Error('stock_inicial no puede ser negativo')
  }

  const stockInicial = Number(data.stock_inicial ?? 0)
  const costoTotalInicial = Number(data.costo_total_inicial ?? 0)
  const costoUnitario = stockInicial > 0 ? costoTotalInicial / stockInicial : 0

  const codigoLote = generarCodigoLoteMezcla(data)

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

    return await crearLoteCochinillaPorMezclaRepo(
      {
        ...data,
        item_inventario_id: itemInventario.item_inventario_id,
        creado_por: data.creado_por ?? null,
        stock_inicial: stockInicial,
        stock_actual: data.stock_actual ?? stockInicial,
        costo_total_inicial: costoTotalInicial,
        costo_total_actual: data.costo_total_actual ?? costoTotalInicial,
        costo_unitario: costoUnitario,
        codigo_lote: codigoLote,
        tipo_lote: 'preparado',
        estado_lote: 'por analizar',
        fecha_creacion: data.fecha_creacion ?? new Date()
      },
      t
    )
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
