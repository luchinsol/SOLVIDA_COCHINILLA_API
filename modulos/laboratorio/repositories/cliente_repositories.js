import db from '../../../config/database.js'

const CAMPOS_CLIENTE = `
  cliente_id,
  nombre_razon_social,
  ruc,
  dni,
  telefono1,
  telefono2,
  correo,
  activo,
  creado_en,
  modificado_en
`

export const listarClientesRepo = async ({ activo, buscar }) => {
  const condiciones = []
  const valores = []

  if (activo !== null) {
    valores.push(activo)
    condiciones.push(`activo = $${valores.length}`)
  }

  if (buscar) {
    valores.push(`%${buscar}%`)
    condiciones.push(`(
      COALESCE(nombre_razon_social, '') ILIKE $${valores.length}
      OR COALESCE(ruc, '') ILIKE $${valores.length}
      OR COALESCE(dni, '') ILIKE $${valores.length}
      OR telefono1 ILIKE $${valores.length}
      OR COALESCE(telefono2, '') ILIKE $${valores.length}
      OR COALESCE(correo, '') ILIKE $${valores.length}
    )`)
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''

  return db.any(
    `SELECT ${CAMPOS_CLIENTE}
     FROM laboratorio.cliente_servicio_analisis
     ${where}
     ORDER BY COALESCE(nombre_razon_social, ''), cliente_id`,
    valores
  )
}

export const obtenerClientePorIdRepo = async (clienteId) => db.oneOrNone(
  `SELECT ${CAMPOS_CLIENTE}
   FROM laboratorio.cliente_servicio_analisis
   WHERE cliente_id = $1`,
  [clienteId]
)

export const crearClienteRepo = async (cliente) => db.one(
  `INSERT INTO laboratorio.cliente_servicio_analisis (
     nombre_razon_social, ruc, dni, telefono1, telefono2, correo
   ) VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING ${CAMPOS_CLIENTE}`,
  [
    cliente.nombre_razon_social,
    cliente.ruc,
    cliente.dni,
    cliente.telefono1,
    cliente.telefono2,
    cliente.correo
  ]
)

export const actualizarClienteRepo = async (clienteId, cliente) => db.oneOrNone(
  `UPDATE laboratorio.cliente_servicio_analisis
   SET nombre_razon_social = $1,
       ruc = $2,
       dni = $3,
       telefono1 = $4,
       telefono2 = $5,
       correo = $6,
       modificado_en = NOW()
   WHERE cliente_id = $7
   RETURNING ${CAMPOS_CLIENTE}`,
  [
    cliente.nombre_razon_social,
    cliente.ruc,
    cliente.dni,
    cliente.telefono1,
    cliente.telefono2,
    cliente.correo,
    clienteId
  ]
)

export const actualizarEstadoClienteRepo = async (clienteId, activo) => db.oneOrNone(
  `UPDATE laboratorio.cliente_servicio_analisis
   SET activo = $1,
       modificado_en = NOW()
   WHERE cliente_id = $2
   RETURNING ${CAMPOS_CLIENTE}`,
  [activo, clienteId]
)
