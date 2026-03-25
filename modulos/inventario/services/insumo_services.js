import {getInsumos,createInsumo,updateInsumo,deleteInsumo} from "../repositories/insumo_repositories.js";

export const getInsumosService = async () => {
  return await getInsumos();
};

export const createInsumoService = async (insumoDatos) => {
  return await createInsumo(insumoDatos);
};

export const updateInsumoService = async (insumo_id, insumoDatos) => {
  return await updateInsumo(insumo_id, insumoDatos);
};

export const deleteInsumoService = async (insumo_id) => {
  return await deleteInsumo(insumo_id);
};