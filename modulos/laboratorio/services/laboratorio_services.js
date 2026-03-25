import {crearAnalisis,obtenerTodosAnalisis,actualizarAnalisis,eliminarAnalisis} from '../repositories/laboratorio_repositories.js'

export const obtenerTodosAnalisisService = async () => {
    const analisis = await obtenerTodosAnalisis();
    return analisis;
}

export const crearAnalisisService = async (analisisDatos) => {
    const nuevoAnalisis = await crearAnalisis(analisisDatos);
    return nuevoAnalisis;
}

export const actualizarAnalisisService = async (analisis_id, analisisDatos) => {
    const analisisActualizado = await actualizarAnalisis(analisis_id, analisisDatos);
    return analisisActualizado;
}

export const eliminarAnalisisService = async (analisis_id) => {
    const eliminado = await eliminarAnalisis(analisis_id);
    return eliminado;
}