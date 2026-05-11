import {
  crearItemInventarioRepo,
  listarItemsInventarioRepo,
  listarTiposPorNombreItemRepo
} from '../repositories/item_inventario_repositories.js'

const NOMBRES_ITEM_VALIDOS = [
  'Carmin',
  'Extracto',
  'Insumos Quimicos',
  'Cochinilla'
]

export const listarNombresItemService = async () => {
  return NOMBRES_ITEM_VALIDOS.map((nombre_item) => ({ nombre_item }))
}

export const listarItemsInventarioService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.nombre_item !== undefined && filters.nombre_item !== '') {
    parsedFilters.nombre_item = String(filters.nombre_item).trim()
  }

  if (filters.proveedor_nombre !== undefined && filters.proveedor_nombre !== '') {
    parsedFilters.proveedor_nombre = String(filters.proveedor_nombre).trim()
  }

  if (filters.tipo !== undefined && filters.tipo !== '') {
    parsedFilters.tipo = String(filters.tipo).trim()
  }

  if (filters.almacen_nombre !== undefined && filters.almacen_nombre !== '') {
    parsedFilters.almacen_nombre = String(filters.almacen_nombre).trim()
  }

  if (filters.codigo !== undefined && filters.codigo !== '') {
    parsedFilters.codigo = String(filters.codigo).trim()
  }

  return await listarItemsInventarioRepo(parsedFilters)
}

export const listarTiposPorNombreItemService = async (nombreItem) => {
  if (!nombreItem || !String(nombreItem).trim()) {
    throw new Error('nombre_item es obligatorio')
  }

  const nombreItemNormalizado = String(nombreItem).trim()

  if (!NOMBRES_ITEM_VALIDOS.includes(nombreItemNormalizado)) {
    throw new Error('nombre_item no es válido')
  }

  return await listarTiposPorNombreItemRepo(nombreItemNormalizado)
}

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
