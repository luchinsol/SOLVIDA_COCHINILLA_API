import { getAllComposicionLoteCochinilla} from '../repositories/composicion_lote_cochinilla_repositories.js'
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Logica de negocio para composicion lote cochinilla y que esta funcion se use para generar
// un pdf descargable



export const generarPDFComposicionService = async () => {
    const datos = await getAllComposicionLoteCochinilla();
    
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            
            doc.fontSize(16).text('Composición Lote Cochinilla', { align: 'center' });
            doc.moveDown();
            
            datos.forEach(item => {
                doc.fontSize(10).text(`ID: ${item.id} - Componente: ${item.componente}`, { align: 'left' });
            });
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generarExcelComposicionService = async () => {
    const datos = await getAllComposicionLoteCochinilla();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Composición');
    
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Componente', key: 'componente', width: 20 }
    ];
    
    datos.forEach(item => {
        worksheet.addRow(item);
    });
    
    return await workbook.xlsx.writeBuffer();
}

