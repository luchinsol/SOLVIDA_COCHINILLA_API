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
  const query = "SELECT * FROM inventario.insumos";
  const rows = await db.query(query);
  return rows;
};

export const createInsumo = async (insumoDatos) => {
  const query =
    "INSERT INTO inventario.insumos (proveedor_id, almacen_id, nombre, tipo_insumo, unidad_medida, concentracion, costo_unitario, clasificacion_controlada, stock_actual, activo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING insumo_id";
  const result = await db.one(query, [
    insumoDatos.proveedor_id,
    insumoDatos.almacen_id,
    insumoDatos.nombre,
    insumoDatos.tipo_insumo,
    insumoDatos.unidad_medida,
    insumoDatos.concentracion,
    insumoDatos.costo_unitario,
    insumoDatos.clasificacion_controlada,
    insumoDatos.stock_actual,
  ]);
  return result;
};

export const updateInsumo = async (insumo_id, insumoDatos) => {
  const query =
    "UPDATE inventario.insumos SET proveedor_id = $1, almacen_id = $2, nombre = $3, tipo_insumo = $4, unidad_medida = $5, concentracion = $6, costo_unitario = $7, clasificacion_controlada = $8, stock_actual = $9 WHERE insumo_id = $10";
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
    "UPDATE inventario.insumos SET activo = false WHERE insumo_id = $1";
  const [result] = await db.query(query, [insumo_id]);
  return result.rowCount;
};
