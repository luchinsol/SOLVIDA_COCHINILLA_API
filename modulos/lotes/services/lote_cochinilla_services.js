import {
  crearLoteCochinillaPorCompraRepo,
  crearLoteCochinillaPorMezclaRepo,
  listarLotesCochinillaRepo,
  obtenerLoteCochinillaPorIdRepo,
  actualizarAnalisisLoteCochinillaRepo,
  actualizarConsumoLoteCochinillaRepo,
  actualizarMasaLoteCochinillaPorDeltaRepo,
  eliminarLoteCochinillaRepo
} from '../repositories/lote_cochinilla_repositories.js'




/* ======================================================
   HELPERS: generación de código
====================================================== */

// ejemplo simple de código para compra:
// COCH-COMP-<proveedor_id>-<yyyymmdd>-<calidad>
const generarCodigoLoteCompra = (data) => {
  const now = new Date(data.fecha_compra ?? new Date())

  // fecha: YYYYMMDD
  const fecha = now.toISOString().slice(0, 10).replace(/-/g, '')

  // hora: HHMMSS
  const hora = now.toTimeString().slice(0, 8).replace(/:/g, '')

  const proveedor = data.proveedor_id
  const calidad = (data.calidad ?? 'SIN-CALIDAD').toUpperCase()

  return `COCH-COMP-${proveedor}-${fecha}-${hora}-${calidad}`
}

// ejemplo simple de código para mezcla:
// COCH-PREP-<yyyymmddhhmmss>
const generarCodigoLoteMezcla = () => {
  const now = new Date()

  const fecha = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const hora = now.toTimeString().slice(0, 8).replace(/:/g, '')  // HHMMSS

  return `COCH-PREP-${fecha}-${hora}`
}

/* ======================================================
   CREATE: compra
====================================================== */
export const crearLoteCochinillaPorCompraService = async (data) => {
  if (!data.proveedor_id) {
    throw new Error('proveedor_id es obligatorio')
  }

  if (!data.fecha_compra) {
    throw new Error('fecha_compra es obligatoria')
  }

  if (!data.masa_total_kg || Number(data.masa_total_kg) <= 0) {
    throw new Error('masa_total_kg debe ser mayor a 0')
  }

  if (data.costo_total_dolares == null || Number(data.costo_total_dolares) <= 0) {
    throw new Error('costo_total_dolares debe ser mayor a 0')
  }

  const masaTotalKg = Number(data.masa_total_kg)
  const costoTotalDolares = Number(data.costo_total_dolares)
  const costoKiloDolares = costoTotalDolares / masaTotalKg

  const codigoLote = generarCodigoLoteCompra(data)

  return await crearLoteCochinillaPorCompraRepo({
    ...data,
    codigo_lote: codigoLote,
    tipo_lote: 'comprado',
    estado: 'por analizar',
    costo_total_dolares: costoTotalDolares,
    costo_kilo_dolares: costoKiloDolares
  })
}
/* ======================================================
   CREATE: mezcla / preparado
====================================================== */
export const crearLoteCochinillaPorMezclaService = async (data) => {
  if (data.masa_total_kg != null && Number(data.masa_total_kg) < 0) {
    throw new Error('masa_total_kg no puede ser negativa')
  }

  const codigoLote = generarCodigoLoteMezcla(data)

  return await crearLoteCochinillaPorMezclaRepo({
    ...data,
    masa_total_kg: data.masa_total_kg ?? 0,
    codigo_lote: codigoLote,
    tipo_lote: 'preparado',
    estado: 'disponible',
    fecha_creacion: data.fecha_creacion ?? new Date()
  })
}
/* ======================================================
   READ
====================================================== */
export const listarLotesCochinillaService = async () => {
  return await listarLotesCochinillaRepo()
}

export const obtenerLoteCochinillaPorIdService = async (id) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

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

  return await actualizarAnalisisLoteCochinillaRepo(id, {
    analisis_actual_id: data.analisis_actual_id,
    concentracion_ac_actual: data.concentracion_ac_actual,
    humedad_actual: data.humedad_actual
  })
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
  if (data.masa_total_kg == null) {
    throw new Error('masa_total_kg es obligatoria')
  }

  const nuevaMasa = Number(data.masa_total_kg)
  const masaActual = Number(loteActual.masa_total_kg)

  /* ------------------------------------------------------
     3. Validar que la nueva masa no sea negativa
     ¿Para qué?
     - evitar datos imposibles en inventario
  ------------------------------------------------------ */
  if (nuevaMasa < 0) {
    throw new Error('La masa_total_kg no puede ser negativa')
  }

  /* ------------------------------------------------------
     4. Validar que la masa no aumente en un update de consumo
     ¿Para qué?
     - en un consumo, la masa solo puede mantenerse o disminuir
  ------------------------------------------------------ */
  if (nuevaMasa > masaActual) {
    throw new Error('La masa nueva no puede ser mayor que la masa actual del lote')
  }

  /* ------------------------------------------------------
     5. Calcular automáticamente el nuevo estado del lote
     ¿Para qué?
     - no depender de que frontend mande el estado correcto
     - mantener consistencia de negocio
  ------------------------------------------------------ */
  let nuevoEstado = 'disponible'

  if (nuevaMasa === 0) {
    nuevoEstado = 'agotado'
  } else if (nuevaMasa < masaActual) {
    nuevoEstado = 'usado'
  }

  /* ------------------------------------------------------
     6. Guardar la nueva masa y el estado calculado
     ¿Para qué?
     - actualizar la base con una lógica coherente
  ------------------------------------------------------ */
  return await actualizarConsumoLoteCochinillaRepo(id, {
    masa_total_kg: nuevaMasa,
    estado: nuevoEstado
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
====================================================== */
export const eliminarLoteCochinillaService = async (id) => {
  const lote = await obtenerLoteCochinillaPorIdRepo(id)

  if (!lote) {
    throw new Error('Lote de cochinilla no encontrado')
  }

  return await eliminarLoteCochinillaRepo(id)
}