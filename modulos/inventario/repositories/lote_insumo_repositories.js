import db from "../../../config/database.js";


export const getInsumoPdf = async () => {
  // Datos ficticios
    const datosFicticios = [
        { id: 1, proveedor_id: 3, almacen_id: 1, porcentaje: 50 },
        { id: 2, proveedor_id: 2, almacen_id: 2, porcentaje: 30 },
        { id: 3, proveedor_id: 1, almacen_id: 3, porcentaje: 20 }
    ];

    // Esto simula la promesa de la DB
    return new Promise((resolve) => {
        resolve(datosFicticios);
    });

    // Si luego quieres volver a la DB, descomenta:
    // const query = `SELECT * FROM lotes.composicion_lote_cochinilla`;
    // const result = await db.query(query);
    // return result.rows;
};


export const getInsumos = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.almacen_id) {
    values.push(filters.almacen_id);
    conditions.push(`li.almacen_id = $${values.length}`);
  }

  if (filters.proveedor_id) {
    values.push(filters.proveedor_id);
    conditions.push(`li.proveedor_id = $${values.length}`);
  }

  if (filters.tipo_insumo_id) {
    values.push(filters.tipo_insumo_id);
    conditions.push(`li.tipo_insumo_id = $${values.length}`);
  }

  const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT
      li.*,
      ii.codigo_item,
      p.nombre_razon_social AS proveedor_nombre,
      a.nombre AS almacen_nombre,
      ti.nombre AS tipo_insumo_nombre
    FROM inventario.lote_insumo li
    LEFT JOIN inventario.item_inventario ii
      ON li.item_inventario_id = ii.item_inventario_id
    LEFT JOIN inventario.proveedor p
      ON li.proveedor_id = p.proveedor_id
    LEFT JOIN inventario.almacen a
      ON li.almacen_id = a.almacen_id
    LEFT JOIN inventario.tipo_insumos ti
      ON li.tipo_insumo_id = ti.tipo_insumo_id
    ${whereClause}
    ORDER BY li.lote_insumo_id ASC
  `;
  const rows = await db.query(query, values);
  return rows;
};

export const getInsumoById = async (id) => {
  const query = `
    SELECT
      li.*,
      ii.codigo_item,
      p.nombre_razon_social AS proveedor_nombre,
      a.nombre AS almacen_nombre,
      ti.nombre AS tipo_insumo_nombre
    FROM inventario.lote_insumo li
    LEFT JOIN inventario.item_inventario ii
      ON li.item_inventario_id = ii.item_inventario_id
    LEFT JOIN inventario.proveedor p
      ON li.proveedor_id = p.proveedor_id
    LEFT JOIN inventario.almacen a
      ON li.almacen_id = a.almacen_id
    LEFT JOIN inventario.tipo_insumos ti
      ON li.tipo_insumo_id = ti.tipo_insumo_id
    WHERE li.lote_insumo_id = $1
  `;
  return await db.oneOrNone(query, [id]);
};

export const getResumenInsumosPorTipo = async (tipoInsumoId) => {
  const query = `
    SELECT
      ti.tipo_insumo_id,
      ti.nombre AS tipo,
      COALESCE(SUM(li.costo_total_actual), 0) AS costo_total,
      COALESCE(SUM(li.stock_actual), 0) AS stock_actual,
      MAX(li.unidad_medida_cantidad) AS unidad_medida_cantidad,
      MAX(li.unidad_medida_moneda) AS unidad_medida_moneda,
      CASE
        WHEN COALESCE(SUM(li.stock_actual), 0) = 0 THEN 0
        ELSE COALESCE(SUM(li.costo_total_actual), 0) / SUM(li.stock_actual)
      END AS costo_unitario
    FROM inventario.lote_insumo li
    INNER JOIN inventario.tipo_insumos ti
      ON li.tipo_insumo_id = ti.tipo_insumo_id
    WHERE ti.tipo_insumo_id = $1
    GROUP BY ti.tipo_insumo_id, ti.nombre
  `;

  return await db.oneOrNone(query, [tipoInsumoId]);
};



//CREATE INSUMO
export const createInsumo = async (insumoDatos, t = db) => {
  const query =
    "INSERT INTO inventario.lote_insumo (proveedor_id, almacen_id, item_inventario_id, nombre, concentracion, costo_unitario, stock_actual, creado_en, costo_total_inicial, stock_inicial, tipo_insumo_id, unidad_medida_cantidad, unidad_medida_moneda, unidad_medida_concentracion, costo_total_actual, estado_lote_id, modificado_en) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13, $14, $15, NOW()) RETURNING *";
  const result = await t.one(query, [
    insumoDatos.proveedor_id,
    insumoDatos.almacen_id,
    insumoDatos.item_inventario_id,
    insumoDatos.nombre,
    insumoDatos.concentracion,
    insumoDatos.costo_unitario,
    insumoDatos.stock_actual,
    insumoDatos.costo_total_inicial,
    insumoDatos.stock_inicial,
    insumoDatos.tipo_insumo_id,
    insumoDatos.unidad_medida_cantidad,
    insumoDatos.unidad_medida_moneda,
    insumoDatos.unidad_medida_concentracion,
    insumoDatos.costo_total_actual,
    insumoDatos.estado_lote_id,
  ]);
  return result;
};

export const actualizarEstadoLoteInsumo = async (id, estado_lote_id, t = db) => {
  const query =
    "UPDATE inventario.lote_insumo SET estado_lote_id = $1, modificado_en = NOW() WHERE lote_insumo_id = $2 RETURNING *";
  return await t.oneOrNone(query, [estado_lote_id, id]);
};

export const actualizarStockActualInsumo = async (id, stock_actual, costo_total_actual) => {
  const query =
    "UPDATE inventario.lote_insumo SET stock_actual = $1, costo_total_actual = $2, modificado_en = NOW() WHERE lote_insumo_id = $3 RETURNING *";
  return await db.oneOrNone(query, [stock_actual, costo_total_actual, id]);
};

export const deleteInsumo = async (insumo_id) => {
  const query =
    "UPDATE inventario.insumo SET activo = false WHERE insumo_id = $1";
  const [result] = await db.query(query, [insumo_id]);
  return result.rowCount;
};

export const getCostoUnitario = async () => {
  const query = "SELECT SUM(costo_unitario) FROM inventario.insumo AS total;";
  const result = await db.one(query);
  return result.costo_unitario;
}
