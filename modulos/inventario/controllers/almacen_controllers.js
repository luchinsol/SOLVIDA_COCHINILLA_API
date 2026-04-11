import {
    obtenerTodosAlmacenesService,
    crearAlmacenService,
    actualizarAlmacenService,
    eliminarAlmacenService,
    actualizarNombreAlmacenService,
    actualizarTipoAlmacenService,
    actualizarUbicacionAlmacenService,
    actualizarActivoAlmacenService
} from "../services/almacen_services.js";
import { handleControllerError } from "../../../utils/handle_controller_error.js";

const normalizeAlmacenError = (error) => {
    if (error.message === 'Almacen no encontrado') {
        error.name = 'NotFoundError';
    }

    if (
        error.message === 'Debe enviar el nombre' ||
        error.message === 'Debe enviar el tipo_almacen' ||
        error.message === 'Debe enviar la ubicacion' ||
        error.message === 'Debe enviar el valor de activo'
    ) {
        error.name = 'ValidationError';
    }

    return error;
};

export const obtenerTodosAlmacenesController = async (req, res) => {
    try {
        const almacenes = await obtenerTodosAlmacenesService();
        res.json(almacenes);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const crearAlmacenController = async (req, res) => {
    
    const { nombre, tipo_almacen, ubicacion, activo } = req.body;
    try {
        
        const almacen = {
            nombre: nombre ?? null,
            tipo_almacen: tipo_almacen ?? null,
            ubicacion: ubicacion ?? null,
            activo: activo ?? true,
        }

        const nuevoAlmacen = await crearAlmacenService(almacen);
        res.status(201).json(nuevoAlmacen);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const actualizarAlmacenController = async (req, res) => {
    const { id } = req.params;
    try {
        const datos = req.body;
        const almacenActualizado = await actualizarAlmacenService(id, datos);
        res.json(almacenActualizado);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const actualizarNombreAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const almacenActualizado = await actualizarNombreAlmacenService(id, nombre);
        res.json(almacenActualizado);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const actualizarTipoAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { tipo_almacen } = req.body;
    try {
        const almacenActualizado = await actualizarTipoAlmacenService(id, tipo_almacen);
        res.json(almacenActualizado);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const actualizarUbicacionAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { ubicacion } = req.body;
    try {
        const almacenActualizado = await actualizarUbicacionAlmacenService(id, ubicacion);
        res.json(almacenActualizado);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const actualizarActivoAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        const almacenActualizado = await actualizarActivoAlmacenService(id, activo);
        res.json(almacenActualizado);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}

export const eliminarAlmacenController = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await eliminarAlmacenService(id);
        res.json(eliminado);
    } catch (error) {
        handleControllerError(res, normalizeAlmacenError(error));
    }
}
