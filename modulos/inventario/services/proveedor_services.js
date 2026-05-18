import {
    getProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    actualizarActivoProveedor,
    actualizarNombreItemProvee
} from '../repositories/proveedor_repositories.js';

export const obtenerProveedoresService = async (nombreItemProvee) => {
    const nombresItemProvee = nombreItemProvee
        ? nombreItemProvee
            .split(',')
            .map(nombre => nombre.trim())
            .filter(Boolean)
        : [];

    return await getProveedores(nombresItemProvee);
};

export const crearProveedorService = async (proveedorDatos) => {
    if (!proveedorDatos.nombre_razon_social) {
        const error = new Error('nombre_razon_social es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (!proveedorDatos.nombre_item_provee) {
        const error = new Error('nombre_item_provee es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    const payload = {
        nombre_razon_social: proveedorDatos.nombre_razon_social,
        nombre_item_provee: proveedorDatos.nombre_item_provee,
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

export const actualizarNombreItemProveeService = async (id, nombre_item_provee) => {
    if (!nombre_item_provee) {
        throw new Error('Debe enviar el nombre_item_provee');
    }

    const proveedorActualizado = await actualizarNombreItemProvee(id, nombre_item_provee);

    if (!proveedorActualizado) {
        throw new Error('Proveedor no encontrado');
    }

    return proveedorActualizado;
};

export const eliminarProveedorService = async (id) => {
    return await deleteProveedor(id);
};
