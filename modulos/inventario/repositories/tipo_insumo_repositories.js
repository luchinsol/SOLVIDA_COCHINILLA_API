import db from "../../../config/database.js";

export const obtenerTiposInsumoRepo = async () => {
  const query = "SELECT * FROM inventario.tipo_insumos ORDER BY tipo_insumo_id ASC";
  return await db.query(query);
};

export const actualizarVigenciaTipoInsumoRepo = async (id, vigente) => {
  const query =
    "UPDATE inventario.tipo_insumos SET vigente = $1 WHERE tipo_insumo_id = $2 RETURNING *";
  return await db.oneOrNone(query, [vigente, id]);
};

export const actualizarControladoTipoInsumoRepo = async (id, controlado) => {
  const query =
    "UPDATE inventario.tipo_insumos SET controlado = $1 WHERE tipo_insumo_id = $2 RETURNING *";
  return await db.oneOrNone(query, [controlado, id]);
};

//create tipo_insumo
export const createTipoInsumo = async (tipoInsumoDatos) => {
  const query =
    "INSERT INTO inventario.tipo_insumos (nombre, controlado, descripcion, vigente) VALUES ($1, $2, $3, $4) RETURNING *";
  const result = await db.one(query, [
    tipoInsumoDatos.nombre,
    tipoInsumoDatos.controlado,
    tipoInsumoDatos.descripcion,
    tipoInsumoDatos.vigente,
  ]);
  return result;
};
