import {getInsumos,createInsumo,updateInsumo,deleteInsumo,getInsumoPdf, getCostoUnitario} from "../repositories/lote_insumo_repositories.js";
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
  if (!insumoDatos.almacen_id) {
    throw new Error('almacen_id es obligatorio');
  }

  if (!insumoDatos.nombre) {
    throw new Error('nombre es obligatorio');
  }

  if (!insumoDatos.tipo_insumo_id) {
    throw new Error('tipo_insumo_id es obligatorio');
  }

  if (insumoDatos.costo_total === undefined || insumoDatos.costo_total === null) {
    throw new Error('costo_total es obligatorio');
  }

  if (!insumoDatos.unidad_medida_cantidad) {
    throw new Error('unidad_medida_cantidad es obligatoria');
  }

  if (!insumoDatos.unidad_medida_moneda) {
    throw new Error('unidad_medida_moneda es obligatoria');
  }

  if (!insumoDatos.unidad_medida_concentracion) {
    throw new Error('unidad_medida_concentracion es obligatoria');
  }

  const stockInicial =
    insumoDatos.stock_inicial !== undefined && insumoDatos.stock_inicial !== null
      ? Number(insumoDatos.stock_inicial)
      : null;

  const stockActual =
    insumoDatos.stock_actual !== undefined && insumoDatos.stock_actual !== null
      ? Number(insumoDatos.stock_actual)
      : stockInicial;

  const costoUnitario =
    insumoDatos.costo_unitario !== undefined && insumoDatos.costo_unitario !== null
      ? Number(insumoDatos.costo_unitario)
      : null;

  const costoTotal = Number(insumoDatos.costo_total);

  const payload = {
    proveedor_id: insumoDatos.proveedor_id ?? null,
    almacen_id: insumoDatos.almacen_id,
    nombre: insumoDatos.nombre,
    concentracion: insumoDatos.concentracion ?? null,
    costo_unitario: costoUnitario,
    stock_actual: stockActual,
    costo_total: costoTotal,
    stock_inicial: stockInicial,
    tipo_insumo_id: insumoDatos.tipo_insumo_id,
    unidad_medida_cantidad: insumoDatos.unidad_medida_cantidad,
    unidad_medida_moneda: insumoDatos.unidad_medida_moneda,
    unidad_medida_concentracion: insumoDatos.unidad_medida_concentracion
  };

  return await createInsumo(payload);
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
