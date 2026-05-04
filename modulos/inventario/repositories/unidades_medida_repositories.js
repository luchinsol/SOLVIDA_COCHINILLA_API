import db from "../../../config/database.js";

export const obtenerUnidadesMedidaRepo = async () => {
  const query =
    "SELECT * FROM inventario.unidades_medida ORDER BY unidades_medida_id ASC";
  return await db.query(query);
};

export const obtenerUnidadesMedidaPorPropiedadRepo = async (propiedadesMedida) => {
  const query = `
    SELECT *
    FROM inventario.unidades_medida
    WHERE LOWER(propiedad_medida) IN ($1:csv)
    ORDER BY unidades_medida_id ASC
  `;
  return await db.query(
    query,
    [propiedadesMedida.map((propiedad) => propiedad.toLowerCase())]
  );
};

export const crearUnidadMedidaRepo = async (data) => {
  const query =
    "INSERT INTO inventario.unidades_medida (propiedad_medida, unidad_de_medida) VALUES ($1, $2) RETURNING *";
  return await db.one(query, [data.propiedad_medida, data.unidad_de_medida]);
};
