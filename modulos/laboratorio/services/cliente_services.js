import {
  actualizarClienteRepo,
  actualizarEstadoClienteRepo,
  crearClienteRepo,
  listarClientesRepo,
  obtenerClientePorIdRepo
} from '../repositories/cliente_repositories.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const textoOpcional = (valor) => {
  if (valor === undefined || valor === null) return null
  const texto = String(valor).trim()
  return texto || null
}

const validarId = (valor) => {
  const id = Number(valor)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('cliente_id debe ser un entero positivo')
  }
  return id
}

const validarDatosCliente = (datos = {}) => {
  const nombreRazonSocial = textoOpcional(datos.nombre_razon_social)
  const ruc = textoOpcional(datos.ruc)
  const dni = textoOpcional(datos.dni)
  const telefono1 = textoOpcional(datos.telefono1)
  const telefono2 = textoOpcional(datos.telefono2)
  const correo = textoOpcional(datos.correo)?.toLowerCase() ?? null

  if (!nombreRazonSocial) {
    throw new Error('nombre_razon_social es obligatorio')
  }

  if (!telefono1) {
    throw new Error('telefono1 es obligatorio')
  }

  if (ruc && !/^\d{11}$/.test(ruc)) {
    throw new Error('ruc debe tener exactamente 11 digitos')
  }

  if (dni && !/^\d{8}$/.test(dni)) {
    throw new Error('dni debe tener exactamente 8 digitos')
  }

  if (correo && !EMAIL_REGEX.test(correo)) {
    throw new Error('correo debe tener un formato valido')
  }

  return {
    nombre_razon_social: nombreRazonSocial,
    ruc,
    dni,
    telefono1,
    telefono2,
    correo
  }
}

const parsearFiltroActivo = (valor) => {
  if (valor === undefined || valor === null || valor === '') return null
  if (valor === true || valor === 'true') return true
  if (valor === false || valor === 'false') return false
  throw new Error('activo debe ser true o false')
}

export const listarClientesService = async (filtros = {}) => listarClientesRepo({
  activo: parsearFiltroActivo(filtros.activo),
  buscar: textoOpcional(filtros.buscar)
})

export const obtenerClientePorIdService = async (clienteId) => {
  const cliente = await obtenerClientePorIdRepo(validarId(clienteId))
  if (!cliente) throw new Error('Cliente no encontrado')
  return cliente
}

export const crearClienteService = async (datos) => crearClienteRepo(
  validarDatosCliente(datos)
)

export const actualizarClienteService = async (clienteId, datos) => {
  const cliente = await actualizarClienteRepo(
    validarId(clienteId),
    validarDatosCliente(datos)
  )
  if (!cliente) throw new Error('Cliente no encontrado')
  return cliente
}

export const actualizarEstadoClienteService = async (clienteId, activo) => {
  if (typeof activo !== 'boolean') {
    throw new Error('activo debe ser booleano')
  }

  const cliente = await actualizarEstadoClienteRepo(validarId(clienteId), activo)
  if (!cliente) throw new Error('Cliente no encontrado')
  return cliente
}
