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


export const getInsumos = async () => {
  const query = "SELECT * FROM inventario.lote_insumo";
  const rows = await db.query(query);
  return rows;
};

export const getInsumoById = async (id) => {
  const query = "SELECT * FROM inventario.lote_insumo WHERE lote_insumo_id = $1";
  return await db.oneOrNone(query, [id]);
};



//CREATE INSUMO
export const createInsumo = async (insumoDatos) => {
  const query =
    "INSERT INTO inventario.lote_insumo (proveedor_id, almacen_id, nombre, concentracion, costo_unitario, stock_actual, costo_total, stock_inicial, tipo_insumo_id, estado_lote, unidad_medida_cantidad, unidad_medida_moneda, unidad_medida_concentracion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *";
  const result = await db.one(query, [
    insumoDatos.proveedor_id,
    insumoDatos.almacen_id,
    insumoDatos.nombre,
    insumoDatos.concentracion,
    insumoDatos.costo_unitario,
    insumoDatos.stock_actual,
    insumoDatos.costo_total,
    insumoDatos.stock_inicial,
    insumoDatos.tipo_insumo_id,
    insumoDatos.estado_lote,
    insumoDatos.unidad_medida_cantidad,
    insumoDatos.unidad_medida_moneda,
    insumoDatos.unidad_medida_concentracion,
  ]);
  return result;
};

export const actualizarEstadoLoteInsumo = async (id, estado_lote) => {
  const query =
    "UPDATE inventario.lote_insumo SET estado_lote = $1 WHERE lote_insumo_id = $2 RETURNING *";
  return await db.oneOrNone(query, [estado_lote, id]);
};

export const actualizarStockActualInsumo = async (id, stock_actual, costo_total) => {
  const query =
    "UPDATE inventario.lote_insumo SET stock_actual = $1, costo_total = $2 WHERE lote_insumo_id = $3 RETURNING *";
  return await db.oneOrNone(query, [stock_actual, costo_total, id]);
};

export const updateInsumo = async (insumo_id, insumoDatos) => {
  const query =
    "UPDATE inventario.insumo SET proveedor_id = $1, almacen_id = $2, nombre = $3, tipo_insumo = $4, unidad_medida = $5, concentracion = $6, costo_unitario = $7, clasificacion_controlada = $8, stock_actual = $9 WHERE insumo_id = $10";
  const result = await db.query(query, [
    insumoDatos.proveedor_id,
    insumoDatos.almacen_id,
    insumoDatos.nombre,
    insumoDatos.tipo_insumo,
    insumoDatos.unidad_medida,
    insumoDatos.concentracion,
    insumoDatos.costo_unitario,
    insumoDatos.clasificacion_controlada,
    insumoDatos.stock_actual,
    insumo_id,
  ]);
  return result;
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
