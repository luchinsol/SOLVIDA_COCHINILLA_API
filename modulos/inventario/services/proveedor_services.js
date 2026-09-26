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
    const nombreRazonSocial = String(proveedorDatos.nombre_razon_social ?? '').trim();
    const telefono = proveedorDatos.telefono == null ? '' : String(proveedorDatos.telefono).trim();
    const correo = proveedorDatos.correo == null ? '' : String(proveedorDatos.correo).trim();
    const direccion = proveedorDatos.direccion == null ? '' : String(proveedorDatos.direccion).trim();
    const ruc = proveedorDatos.ruc == null ? '' : String(proveedorDatos.ruc).trim();

    if (!nombreRazonSocial) {
        const error = new Error('nombre_razon_social es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (telefono && !/^\d{9}$/.test(telefono)) {
        throw new Error('telefono debe tener exactamente 9 digitos');
    }

    if (ruc && !/^\d{11}$/.test(ruc)) {
        throw new Error('ruc debe tener exactamente 11 digitos');
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        throw new Error('correo debe tener un formato valido');
    }

    const payload = {
        nombre_razon_social: nombreRazonSocial,
        telefono: telefono || null,
        correo: correo || null,
        direccion: direccion || null,
        activo: true,
        ruc: ruc || null
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
