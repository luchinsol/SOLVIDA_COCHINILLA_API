import {getMovimientosAlmacen,updateMovimientoAlmacen,createMovimientoAlmacen,deleteMovimientoAlmacen} from '../repositories/movimiento_almacen_repositories.js'

export const getMovimientosAlmacenService = async () => {
    const movimientos = await getMovimientosAlmacen();
    return movimientos;
}

export const createMovimientoAlmacenService = async (movimientoDatos) => {
    const nuevoMovimiento = await createMovimientoAlmacen(movimientoDatos);
    return nuevoMovimiento;
}

export const updateMovimientoAlmacenService = async (movimiento_id, movimientoDatos) => {
    const movimientoActualizado = await updateMovimientoAlmacen(movimiento_id, movimientoDatos);
    return movimientoActualizado;
}

export const deleteMovimientoAlmacenService = async (movimiento_id) => {
    const eliminado = await deleteMovimientoAlmacen(movimiento_id);
    return eliminado;
}   

