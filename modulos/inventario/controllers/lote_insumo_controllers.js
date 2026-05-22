import {
  getInsumoPdfServicePDF,
  getInsumosService,
  getInsumoByIdService,
  getResumenInsumosPorTipoService,
  createInsumoService,
  deleteInsumoService,
  actualizarEstadoLoteInsumoService,
  actualizarStockActualInsumoService
} from '../services/lote_insumo_services.js';
import { handleControllerError } from '../../../utils/handle_controller_error.js';

const normalizeLoteInsumoError = (error) => {
  if (error.message === 'Lote de insumo no encontrado') {
    error.name = 'NotFoundError';
  }

  if (
    error.message === 'id debe ser un entero positivo' ||
    error.message === 'almacen_id debe ser un entero positivo' ||
    error.message === 'proveedor_id debe ser un entero positivo' ||
    error.message === 'tipo_insumo_id debe ser un entero positivo' ||
    error.message === 'almacen_id es obligatorio' ||
    error.message === 'nombre es obligatorio' ||
    error.message === 'tipo_insumo_id es obligatorio' ||
    error.message === 'costo_total_inicial es obligatorio' ||
    error.message === 'stock_inicial es obligatorio' ||
    error.message === 'unidad_medida_cantidad es obligatoria' ||
    error.message === 'unidad_medida_moneda es obligatoria' ||
    error.message === 'unidad_medida_concentracion es obligatoria' ||
    error.message === 'stock_inicial debe ser mayor a 0' ||
    error.message === 'costo_total_inicial debe ser un numero valido' ||
    error.message === 'estado_lote es obligatorio' ||
    error.message === 'stock_actual es obligatorio' ||
    error.message === 'stock_actual debe ser un numero valido' ||
    error.message === 'stock_actual no puede ser mayor que stock_inicial' ||
    error.message === 'costo_unitario del lote no es valido'
  ) {
    error.name = 'ValidationError';
  }

  if (error.message === 'No se encontraron lotes de insumo para ese tipo_insumo_id') {
    error.name = 'NotFoundError';
  }

  return error;
};

export const getInsumoPdfController = async (req, res) => {
  try {
    const pdfBuffer = await getInsumoPdfServicePDF();
     res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=insumos.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        handleControllerError(res, normalizeLoteInsumoError(error));
    }
}


export const getInsumosController = async (req, res) => {
  try {
    const { almacen_id, proveedor_id, tipo_insumo_id } = req.query;
    const insumos = await getInsumosService({
      almacen_id,
      proveedor_id,
      tipo_insumo_id
    }, req.userPermissions);
    res.json(insumos);
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
};      

export const getInsumoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const insumo = await getInsumoByIdService(id, req.userPermissions);
    res.json(insumo);
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
};

export const getResumenInsumosPorTipoController = async (req, res) => {
  try {
    const { tipo_insumo_id } = req.query;
    const resumen = await getResumenInsumosPorTipoService(tipo_insumo_id);
    res.json(resumen);
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
};

export const createInsumoController = async (req, res) => {
  const insumoDatos = req.body;
  try {
    const nuevoInsumo = await createInsumoService(insumoDatos);
    res.status(201).json(nuevoInsumo);
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
};

export const actualizarEstadoLoteInsumoController = async (req, res) => {
  const { id } = req.params;
  const { estado_lote } = req.body;
  try {
    const loteActualizado = await actualizarEstadoLoteInsumoService(id, estado_lote);
    res.json(loteActualizado);
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
};

export const actualizarStockActualInsumoController = async (req, res) => {
  const { id } = req.params;
  const { stock_actual } = req.body;
  try {
    const loteActualizado = await actualizarStockActualInsumoService(id, stock_actual, {
      usuario_id: req.body.usuario_id,
      motivo_movimiento: req.body.motivo_movimiento,
      observaciones: req.body.observaciones
    });
    res.json(loteActualizado);
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
};

export const deleteInsumoController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteInsumoService(id);
    res.json({ message: 'Insumo eliminado' });
  } catch (error) {
    handleControllerError(res, normalizeLoteInsumoError(error));
  }
}
