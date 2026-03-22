import { obtenerTodosAlmacenesRepo,crearAlmacenRepo,actualizarAlmacenRepo,eliminarAlmacenRepo } from "../repositories/almacen_repositories";

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

export const eliminarAlmacenService = async (id) => {
    const eliminado = await eliminarAlmacenRepo(id);
    return eliminado;
}