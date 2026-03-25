import {getProveedores,createProveedor,updateProveedor,deleteProveedor} from '../repositories/proveedor_repositories.js';

export const obtenerProveedoresService = async () => {
    return await getProveedores();
};

export const crearProveedorService = async (proveedorDatos) => {
    return await createProveedor(proveedorDatos);
};

export const actualizarProveedorService = async (id, proveedorDatos) => {
    return await updateProveedor(id, proveedorDatos);
};

export const eliminarProveedorService = async (id) => {
    return await deleteProveedor(id);
};