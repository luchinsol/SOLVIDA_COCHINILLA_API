import {getInsumoPdfServicePDF,getInsumosService,createInsumoService,updateInsumoService,deleteInsumoService} from '../services/lote_insumo_services.js';

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

export const deleteInsumoController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteInsumoService(id);
    res.json({ message: 'Insumo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}