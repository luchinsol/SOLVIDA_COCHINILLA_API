import {
    getProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    actualizarActivoProveedor,
    actualizarTipoProveedor
} from '../repositories/proveedor_repositories.js';

export const obtenerProveedoresService = async (tipoProveedor) => {
    const tiposProveedor = tipoProveedor
        ? tipoProveedor
            .split(',')
            .map(tipo => tipo.trim())
            .filter(Boolean)
        : [];

    return await getProveedores(tiposProveedor);
};

export const crearProveedorService = async (proveedorDatos) => {
    if (!proveedorDatos.nombre_razon_social) {
        const error = new Error('nombre_razon_social es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (!proveedorDatos.tipo_proveedor) {
        const error = new Error('tipo_proveedor es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    const payload = {
        nombre_razon_social: proveedorDatos.nombre_razon_social,
        tipo_proveedor: proveedorDatos.tipo_proveedor,
        telefono: proveedorDatos.telefono ?? null,
        correo: proveedorDatos.correo ?? null,
        direccion: proveedorDatos.direccion ?? null,
        activo: proveedorDatos.activo ?? true,
        ruc: proveedorDatos.ruc ?? null
    };

    return await createProveedor(payload);
};

export const actualizarProveedorService = async (id, proveedorDatos) => {
    return await updateProveedor(id, proveedorDatos);
};

export const actualizarActivoProveedorService = async (id, activo) => {
    if (activo === undefined || activo === null) {
        throw new Error('Debe enviar el valor de activo');
    }

    const proveedorActualizado = await actualizarActivoProveedor(id, activo);

    if (!proveedorActualizado) {
        throw new Error('Proveedor no encontrado');
    }

    return proveedorActualizado;
};

export const actualizarTipoProveedorService = async (id, tipo_proveedor) => {
    if (!tipo_proveedor) {
        throw new Error('Debe enviar el tipo_proveedor');
    }

    const proveedorActualizado = await actualizarTipoProveedor(id, tipo_proveedor);

    if (!proveedorActualizado) {
        throw new Error('Proveedor no encontrado');
    }

    return proveedorActualizado;
};

export const eliminarProveedorService = async (id) => {
    return await deleteProveedor(id);
};
