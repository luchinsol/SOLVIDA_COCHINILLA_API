import {
  listarRolesRepo,
  listarRolesActivosRepo,
  crearRolesRepo,
  actualizarRolesRepo,
  eliminarRolesRepo
} from '../repositories/roles_repositories.js';

export const listarRolesService = async () => {
  const roles = await listarRolesRepo();
  return roles;
}

export const listarRolesActivosService = async () => {
  const roles = await listarRolesActivosRepo();
  return roles;
}

export const createRoleService = async (rol) => {
  const newRole = await crearRolesRepo(rol);
  return newRole;
}

export const updateRoleService = async (id, rol) => {
  const updatedRole = await actualizarRolesRepo(id, rol);
  return updatedRole;
}

export const deleteRoleService = async (id) => {
  const deleted = await eliminarRolesRepo(id);
  return deleted;
} 
