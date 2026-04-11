import {
  getInsumoPdfServicePDF,
  getInsumosService,
  createInsumoService,
  updateInsumoService,
  deleteInsumoService,
  actualizarEstadoLoteInsumoService,
  actualizarStockActualInsumoService
} from '../services/lote_insumo_services.js';

export const getInsumoPdfController = async (req, res) => {
  try {
    const pdfBuffer = await getInsumoPdfServicePDF();
     res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=insumos.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export const getInsumosController = async (req, res) => {
  try {
    const insumos = await getInsumosService();
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};      

export const createInsumoController = async (req, res) => {
  const insumoDatos = req.body;
  try {
    const nuevoInsumo = await createInsumoService(insumoDatos);
    res.status(201).json(nuevoInsumo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInsumoController = async (req, res) => {
  const { id } = req.params;
  const insumoDatos = req.body;
  try {
    const insumoActualizado = await updateInsumoService(id, insumoDatos);
    res.json(insumoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarEstadoLoteInsumoController = async (req, res) => {
  const { id } = req.params;
  const { estado_lote } = req.body;
  try {
    const loteActualizado = await actualizarEstadoLoteInsumoService(id, estado_lote);
    res.json(loteActualizado);
  } catch (error) {
    const status = error.message === 'Lote de insumo no encontrado' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const actualizarStockActualInsumoController = async (req, res) => {
  const { id } = req.params;
  const { stock_actual } = req.body;
  try {
    const loteActualizado = await actualizarStockActualInsumoService(id, stock_actual);
    res.json(loteActualizado);
  } catch (error) {
    const status = error.message === 'Lote de insumo no encontrado' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const deleteInsumoController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteInsumoService(id);
    res.json({ message: 'Insumo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
