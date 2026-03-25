import { generarPDFComposicionService } from '../services/composicion_lote_cochinilla_services.js';

export const generarPDFComposicionController = async (req, res) => {
    try {
       
        const pdfBuffer = await generarPDFComposicionService();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=composicion_lote.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}