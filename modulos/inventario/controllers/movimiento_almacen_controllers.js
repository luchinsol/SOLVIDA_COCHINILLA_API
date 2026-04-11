import {
    getMovimientosAlmacenService,
    createMovimientoAlmacenService,
    updateMovimientoAlmacenService,
    deleteMovimientoAlmacenService
} from '../services/movimiento_almacen_services.js';
import { handleControllerError } from '../../../utils/handle_controller_error.js';

const normalizeMovimientoAlmacenError = (error) => {
    return error;
};

export const getMovimientosAlmacenController = async (req, res) => {
    try {
        const movimientos = await getMovimientosAlmacenService();
        res.json(movimientos);
    } catch (error) {
        handleControllerError(res, normalizeMovimientoAlmacenError(error));
    }
}

export const createMovimientoAlmacenController = async (req, res) => {
    const movimientoDatos = req.body;
    try {
        const nuevoMovimiento = await createMovimientoAlmacenService(movimientoDatos);
        res.status(201).json(nuevoMovimiento);
    } catch (error) {
        handleControllerError(res, normalizeMovimientoAlmacenError(error));
    }
}

export const updateMovimientoAlmacenController = async (req, res) => {
    const { id } = req.params;
    const movimientoDatos = req.body;
    try {
        const movimientoActualizado = await updateMovimientoAlmacenService(id, movimientoDatos);
        res.json(movimientoActualizado);
    } catch (error) {
        handleControllerError(res, normalizeMovimientoAlmacenError(error));
    }
}

export const deleteMovimientoAlmacenController = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await deleteMovimientoAlmacenService(id);
        res.json(eliminado);
    } catch (error) {
        handleControllerError(res, normalizeMovimientoAlmacenError(error));
    }
}
