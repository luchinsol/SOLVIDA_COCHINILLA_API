import db from '../../../config/database.js'
import {
  crearAnalisis,
  obtenerTodosAnalisis,
  obtenerAnalisisNoConformes,
  actualizarAnalisis,
  eliminarAnalisis,
  contarMuestrasAnalizadasHoy,
  contarNoConformidadesHoy
} from '../repositories/laboratorio_repositories.js'
import { actualizarAnalisisLoteCochinillaRepo } from '../../lotes/repositories/lote_cochinilla_repositories.js'


export const obtenerTodosAnalisisService = async () => {
    const analisis = await obtenerTodosAnalisis();
    return analisis;
}

export const contarMuestrasAnalizadasHoyService = async () => {
  return await contarMuestrasAnalizadasHoy()
}

export const contarNoConformidadesHoyService = async () => {
  return await contarNoConformidadesHoy()
}

export const obtenerAnalisisNoConformesService = async () => {
  return await obtenerAnalisisNoConformes()
}

export const crearAnalisisService = async (datos) => {
  return await db.tx(async (t) => {
    const analisisCreado = await crearAnalisis(datos, t)

    console.log('analisis creado:', analisisCreado)

    if (datos.tipo_material === 'cochinilla') {
      await actualizarAnalisisLoteCochinillaRepo(
        datos.material_id,
        {
          analisis_actual_id: analisisCreado.analisis_id,
          concentracion_ac_actual: datos.concentracion_ac,
          humedad_actual: datos.humedad
        },
        t
      )
    }

    return analisisCreado
  })
}
export const actualizarAnalisisService = async (analisis_id, analisisDatos) => {
    const analisisActualizado = await actualizarAnalisis(analisis_id, analisisDatos);
    return analisisActualizado;
}

export const eliminarAnalisisService = async (analisis_id) => {
    const eliminado = await eliminarAnalisis(analisis_id);
    return eliminado;
}
