import {
    obtenerTodosAlmacenesRepo,
    crearAlmacenRepo,
    actualizarAlmacenRepo,
    eliminarAlmacenRepo,
    actualizarNombreAlmacenRepo,
    actualizarTipoAlmacenRepo,
    actualizarUbicacionAlmacenRepo,
    actualizarActivoAlmacenRepo
} from "../repositories/almacen_repositories.js";

export const obtenerTodosAlmacenesService = async () => {
    const almacenes = await obtenerTodosAlmacenesRepo();
    return almacenes;
}

export const crearAlmacenService = async (datos) => {
    const nuevoAlmacen = await crearAlmacenRepo(datos);
    return nuevoAlmacen;
}

export const actualizarAlmacenService = async (id, datos) => {
    const almacenActualizado = await actualizarAlmacenRepo(id, datos);
    return almacenActualizado;
}

export const actualizarNombreAlmacenService = async (id, nombre) => {
    if (!nombre) {
        throw new Error('Debe enviar el nombre');
    }

    const almacenActualizado = await actualizarNombreAlmacenRepo(id, nombre);

    if (!almacenActualizado) {
        throw new Error('Almacen no encontrado');
    }

    return almacenActualizado;
}

export const actualizarTipoAlmacenService = async (id, tipo_almacen) => {
    if (!tipo_almacen) {
        throw new Error('Debe enviar el tipo_almacen');
    }

    const almacenActualizado = await actualizarTipoAlmacenRepo(id, tipo_almacen);

    if (!almacenActualizado) {
        throw new Error('Almacen no encontrado');
    }

    return almacenActualizado;
}

export const actualizarUbicacionAlmacenService = async (id, ubicacion) => {
    if (!ubicacion) {
        throw new Error('Debe enviar la ubicacion');
    }

    const almacenActualizado = await actualizarUbicacionAlmacenRepo(id, ubicacion);

    if (!almacenActualizado) {
        throw new Error('Almacen no encontrado');
    }

    return almacenActualizado;
}

export const actualizarActivoAlmacenService = async (id, activo) => {
    if (activo === undefined || activo === null) {
        throw new Error('Debe enviar el valor de activo');
    }

    const almacenActualizado = await actualizarActivoAlmacenRepo(id, activo);

    if (!almacenActualizado) {
        throw new Error('Almacen no encontrado');
    }

    return almacenActualizado;
}

export const eliminarAlmacenService = async (id) => {
    const eliminado = await eliminarAlmacenRepo(id);
    return eliminado;
}
