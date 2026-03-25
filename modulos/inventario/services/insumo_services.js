import {getInsumos,createInsumo,updateInsumo,deleteInsumo} from "../repositories/insumo_repositories.js";

export const getInsumos = async () => {
  return await getInsumos();
};

export const createInsumo = async (insumoDatos) => {
  return await createInsumo(insumoDatos);
};

export const updateInsumo = async (insumo_id, insumoDatos) => {
  return await updateInsumo(insumo_id, insumoDatos);
};

export const deleteInsumo = async (insumo_id) => {
  return await deleteInsumo(insumo_id);
};