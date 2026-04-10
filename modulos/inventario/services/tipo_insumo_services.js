// services/tipo_insumo_services.js

import {
  actualizarControladoTipoInsumoRepo,
  actualizarVigenciaTipoInsumoRepo,
  createTipoInsumo,
  obtenerTiposInsumoRepo
} from '../repositories/tipo_insumo_repositories.js';

export const obtenerTiposInsumoService = async () => {
  const tiposInsumo = await obtenerTiposInsumoRepo();
  return tiposInsumo;
};

export const actualizarVigenciaTipoInsumoService = async (id, vigente) => {
  if (vigente === undefined || vigente === null) {
    throw new Error('Debe enviar el valor de vigente');
  }

  const tipoInsumoActualizado = await actualizarVigenciaTipoInsumoRepo(id, vigente);

  if (!tipoInsumoActualizado) {
    throw new Error('Tipo de insumo no encontrado');
  }

  return tipoInsumoActualizado;
};

export const actualizarControladoTipoInsumoService = async (id, controlado) => {
  if (controlado === undefined || controlado === null) {
    throw new Error('Debe enviar el valor de controlado');
  }

  const tipoInsumoActualizado = await actualizarControladoTipoInsumoRepo(id, controlado);

  if (!tipoInsumoActualizado) {
    throw new Error('Tipo de insumo no encontrado');
  }

  return tipoInsumoActualizado;
};

export const crearTipoInsumoService = async (data) => {
  const { nombre, controlado, descripcion, vigente } = data;

  // 🔴 validaciones
  if (!nombre) {
    throw new Error('El nombre es obligatorio');
  }

  if (controlado === undefined || controlado === null) {
    throw new Error('El campo controlado es obligatorio');
  }

  // 🟡 opcional: descripcion
  const tipoInsumoData = {
    nombre,
    controlado,
    descripcion: descripcion || null,
    vigente: vigente ?? true
  };

  // 🟢 llamar repository
  const result = await createTipoInsumo(tipoInsumoData);

  return result;
};
