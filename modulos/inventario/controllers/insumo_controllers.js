import {} from '../services/insumo_services.js';

export const getInsumosController = async (req, res) => {
  try {
    const insumos = await getInsumos();
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};      

export const createInsumoController = async (req, res) => {
  const insumoDatos = req.body;
  try {
    const nuevoInsumo = await createInsumo(insumoDatos);
    res.status(201).json(nuevoInsumo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInsumoController = async (req, res) => {
  const { id } = req.params;
  const insumoDatos = req.body;
  try {
    const insumoActualizado = await updateInsumo(id, insumoDatos);
    res.json(insumoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};