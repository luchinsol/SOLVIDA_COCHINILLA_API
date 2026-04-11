import {
  crearUnidadMedidaService,
  obtenerUnidadesMedidaPorPropiedadService,
  obtenerUnidadesMedidaService
} from "../services/unidades_medida_services.js";

export const obtenerUnidadesMedidaController = async (req, res) => {
  try {
    const data = await obtenerUnidadesMedidaService();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerUnidadesMedidaPorPropiedadController = async (req, res) => {
  try {
    const { propiedadMedida } = req.params;
    const data = await obtenerUnidadesMedidaPorPropiedadService(propiedadMedida);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const crearUnidadMedidaController = async (req, res) => {
  try {
    const data = await crearUnidadMedidaService(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
