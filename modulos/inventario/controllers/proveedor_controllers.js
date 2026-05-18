import {
    obtenerProveedoresService,
    crearProveedorService,
    actualizarProveedorService,
    eliminarProveedorService,
    actualizarActivoProveedorService,
    actualizarNombreItemProveeService
} from '../services/proveedor_services.js';
import { handleControllerError } from '../../../utils/handle_controller_error.js';

const normalizeProveedorError = (error) => {
    if (error.message === 'Proveedor no encontrado') {
        error.name = 'NotFoundError';
    }

    if (
        error.message === 'nombre_razon_social es obligatorio' ||
        error.message === 'nombre_item_provee es obligatorio' ||
        error.message === 'Debe enviar el valor de activo' ||
        error.message === 'Debe enviar el nombre_item_provee'
    ) {
        error.name = 'ValidationError';
    }

    return error;
};

export const obtenerProveedoresController = async (req, res) => {
    try {
        const { nombre_item_provee } = req.query;
        const proveedores = await obtenerProveedoresService(nombre_item_provee);
        res.json(proveedores);
    } catch (error) {
        handleControllerError(res, normalizeProveedorError(error));
    }
}   

export const crearProveedorController = async (req, res) => {
    try {
        const proveedorDatos = req.body;
        const nuevoProveedor = await crearProveedorService(proveedorDatos);
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        handleControllerError(res, normalizeProveedorError(error));
    }
};

export const actualizarProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const proveedorDatos = req.body;
        const proveedorActualizado = await actualizarProveedorService(id, proveedorDatos);
        res.json(proveedorActualizado);
    } catch (error) {
        handleControllerError(res, normalizeProveedorError(error));
    }
};

export const actualizarActivoProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const { activo } = req.body;
        const proveedorActualizado = await actualizarActivoProveedorService(id, activo);
        res.json(proveedorActualizado);
    } catch (error) {
        handleControllerError(res, normalizeProveedorError(error));
    }
};

export const actualizarNombreItemProveeController = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre_item_provee } = req.body;
        const proveedorActualizado = await actualizarNombreItemProveeService(id, nombre_item_provee);
        res.json(proveedorActualizado);
    } catch (error) {
        handleControllerError(res, normalizeProveedorError(error));
    }
};

export const eliminarProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const resultado = await eliminarProveedorService(id);
        res.json(resultado);
    } catch (error) {
        handleControllerError(res, normalizeProveedorError(error));
    }
}
