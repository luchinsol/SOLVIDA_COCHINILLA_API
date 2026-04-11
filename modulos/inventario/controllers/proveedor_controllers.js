import {
    obtenerProveedoresService,
    crearProveedorService,
    actualizarProveedorService,
    eliminarProveedorService,
    actualizarActivoProveedorService,
    actualizarTipoProveedorService
} from '../services/proveedor_services.js';
import { handleControllerError } from '../../../utils/handle_controller_error.js';

const normalizeProveedorError = (error) => {
    if (error.message === 'Proveedor no encontrado') {
        error.name = 'NotFoundError';
    }

    if (
        error.message === 'nombre_razon_social es obligatorio' ||
        error.message === 'tipo_proveedor es obligatorio' ||
        error.message === 'Debe enviar el valor de activo' ||
        error.message === 'Debe enviar el tipo_proveedor'
    ) {
        error.name = 'ValidationError';
    }

    return error;
};

export const obtenerProveedoresController = async (req, res) => {
    try {
        const { tipo_proveedor } = req.query;
        const proveedores = await obtenerProveedoresService(tipo_proveedor);
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

export const actualizarTipoProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const { tipo_proveedor } = req.body;
        const proveedorActualizado = await actualizarTipoProveedorService(id, tipo_proveedor);
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
