import db from '../../../config/database.js'

export const listarTiposPorNombreItemRepo = async (nombreItem) => {
  if (nombreItem === 'Insumos Quimicos') {
    return await db.any(
      `SELECT DISTINCT
         nombre AS tipo
       FROM inventario.tipo_insumos
       ORDER BY nombre ASC`
    )
  }

  if (nombreItem === 'Carmin') {
    return await db.any(
      `SELECT DISTINCT
         tipo_lote AS tipo
       FROM lotes.lote_carmin
       WHERE tipo_lote IS NOT NULL AND TRIM(tipo_lote) <> ''
       ORDER BY tipo_lote ASC`
    )
  }

  if (nombreItem === 'Cochinilla') {
    return await db.any(
      `SELECT DISTINCT
         tipo_lote AS tipo
       FROM lotes.lote_cochinilla
       WHERE tipo_lote IS NOT NULL AND TRIM(tipo_lote) <> ''
       ORDER BY tipo_lote ASC`
    )
  }

  if (nombreItem === 'Extracto') {
    return await db.any(
      `SELECT DISTINCT
         tipo_extracto AS tipo
       FROM lotes.extracto
       WHERE tipo_extracto IS NOT NULL AND TRIM(tipo_extracto) <> ''
       ORDER BY tipo_extracto ASC`
    )
  }

  return []
}

export const crearItemInventarioRepo = async (data, t = db) => {
  return await t.one(
    `INSERT INTO inventario.item_inventario
     (nombre_item, codigo_item)
     VALUES ($1, $2)
     RETURNING *`,
    [
      data.nombre_item,
      data.codigo_item
    ]
  )
}

export const actualizarCodigoItemInventarioRepo = async (id, codigoItem, t = db) => {
  return await t.one(
    `UPDATE inventario.item_inventario
     SET codigo_item = $1
     WHERE item_inventario_id = $2
     RETURNING *`,
    [codigoItem, id]
  )
}
