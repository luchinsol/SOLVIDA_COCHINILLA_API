import {
  crearUnidadMedidaRepo,
  obtenerUnidadesMedidaPorPropiedadRepo,
  obtenerUnidadesMedidaRepo
} from "../repositories/unidades_medida_repositories.js";

export const obtenerUnidadesMedidaService = async () => {
  return await obtenerUnidadesMedidaRepo();
};

export const obtenerUnidadesMedidaPorPropiedadService = async (propiedadMedida) => {
  if (!propiedadMedida) {
    throw new Error("propiedad_medida es obligatoria");
  }

  return await obtenerUnidadesMedidaPorPropiedadRepo(propiedadMedida);
};

export const crearUnidadMedidaService = async (data) => {
  if (!data.propiedad_medida) {
    throw new Error("propiedad_medida es obligatoria");
  }

  if (!data.unidad_de_medida) {
    throw new Error("unidad_de_medida es obligatoria");
  }

  return await crearUnidadMedidaRepo({
    propiedad_medida: data.propiedad_medida,
    unidad_de_medida: data.unidad_de_medida
  });
};
