import {
  actualizarCodigoProcesoExtraccionRepo,
  crearProcesoExtraccionRepo
} from '../repositories/proceso_extraccion_repositories.js'

const parseRequiredNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} es obligatorio`)
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} debe ser un numero mayor a 0`)
  }

  return parsed
}

const parseRequiredInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} es obligatorio`)
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} debe ser un entero positivo`)
  }

  return parsed
}

const generarCodigoProcesoExtraccion = ({ proceso_extraccion_id }) => {
  return `PEX-${proceso_extraccion_id}`
}

export const crearProcesoExtraccionService = async (data) => {
  const payloadNormalizado = {
    receta_extraccion_id: parseRequiredInteger(data.receta_extraccion_id, 'receta_extraccion_id'),
    usuario_id: parseRequiredInteger(data.usuario_id, 'usuario_id'),
    lote_cochinilla_id: parseRequiredInteger(data.lote_cochinilla_id, 'lote_cochinilla_id'),
    masa_cochinilla_kg: parseRequiredNumber(data.masa_cochinilla_kg, 'masa_cochinilla_kg'),
    codigo_proceso: null,
    estado_proceso_id: 1
  }

  const procesoCreado = await crearProcesoExtraccionRepo(payloadNormalizado)

  const codigoProceso = generarCodigoProcesoExtraccion({
    proceso_extraccion_id: procesoCreado.proceso_extraccion_id
  })

  return await actualizarCodigoProcesoExtraccionRepo(
    procesoCreado.proceso_extraccion_id,
    codigoProceso
  )
}
