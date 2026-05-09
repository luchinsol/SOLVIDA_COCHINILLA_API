import { crearItemInventarioRepo } from '../repositories/item_inventario_repositories.js'

const NOMBRES_ITEM_VALIDOS = [
  'Carmin',
  'Extracto',
  'Insumos Quimicos',
  'Cochinilla'
]

export const crearItemInventarioService = async (data) => {
  if (!data.nombre_item || !data.nombre_item.trim()) {
    throw new Error('nombre_item es obligatorio')
  }

  if (!data.codigo_item || !data.codigo_item.trim()) {
    throw new Error('codigo_item es obligatorio')
  }

  const nombreItem = data.nombre_item.trim()

  if (!NOMBRES_ITEM_VALIDOS.includes(nombreItem)) {
    throw new Error('nombre_item no es válido')
  }

  return await crearItemInventarioRepo({
    nombre_item: nombreItem,
    codigo_item: data.codigo_item.trim()
  })
}
