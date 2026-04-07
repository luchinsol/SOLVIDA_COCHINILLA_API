import {getInsumos,createInsumo,updateInsumo,deleteInsumo,getInsumoPdf, getCostoUnitario} from "../repositories/insumo_repositories.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';


export const getInsumoPdfServicePDF = async () => {
 const datos = await getInsumoPdf();
 console.log("Datos obtenidos para PDF:", datos); // Agrega este log para verificar los datos
    
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            
            doc.fontSize(16).text('Insumos', { align: 'center' });
            doc.moveDown();
            
            datos.forEach(item => {
                doc.fontSize(10).text(`ID: ${item.id} - Proveedor: ${item.proveedor_id} - Almacén: ${item.almacen_id} - Porcentaje: ${item.porcentaje}%`, { align: 'left' });
            });
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};


export const getInsumosService = async () => {
  return await getInsumos();
};

export const createInsumoService = async (insumoDatos) => {
  return await createInsumo(insumoDatos);
};

export const updateInsumoService = async (insumo_id, insumoDatos) => {
  return await updateInsumo(insumo_id, insumoDatos);
};

export const deleteInsumoService = async (insumo_id) => {
  return await deleteInsumo(insumo_id);
};

export const getInsumoPdfServiceExcel = async () => {
  return await getCostoUnitario();
}