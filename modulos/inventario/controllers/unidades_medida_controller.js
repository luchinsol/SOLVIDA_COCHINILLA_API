import {
  crearUnidadMedidaService,
  obtenerUnidadesMedidaPorPropiedadService,
  obtenerUnidadesMedidaService
} from "../services/unidades_medida_services.js";
import { handleControllerError } from "../../../utils/handle_controller_error.js";

const normalizeUnidadesMedidaError = (error) => {
  if (
    error.message === 'propiedad_medida es obligatoria' ||
    error.message === 'unidad_de_medida es obligatoria'
  ) {
    error.name = 'ValidationError';
  }

  return error;
};

export const obtenerUnidadesMedidaController = async (req, res) => {
  try {
    const data = await obtenerUnidadesMedidaService();
    res.json(data);
  } catch (error) {
    handleControllerError(res, normalizeUnidadesMedidaError(error));
  }
};

export const obtenerUnidadesMedidaPorPropiedadController = async (req, res) => {
  try {
    const { propiedadMedida } = req.params;
    const data = await obtenerUnidadesMedidaPorPropiedadService(propiedadMedida);
    res.json(data);
  } catch (error) {
    handleControllerError(res, normalizeUnidadesMedidaError(error));
  }
};

export const crearUnidadMedidaController = async (req, res) => {
  try {
    const data = await crearUnidadMedidaService(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleControllerError(res, normalizeUnidadesMedidaError(error));
  }
};
