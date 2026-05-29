import {
  getInsumos,
  getInsumoById,
  getResumenInsumosPorTipo,
  createInsumo,
  deleteInsumo,
  getInsumoPdf,
  getCostoUnitario,
  actualizarEstadoLoteInsumo,
} from "../repositories/lote_insumo_repositories.js";
import {
  actualizarCodigoItemInventarioRepo,
  crearItemInventarioRepo
} from "../repositories/item_inventario_repositories.js";
import {
  procesarMovimientoAlmacenService,
  createAjusteMovimientoAlmacenService
} from "./movimiento_almacen_services.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import db from '../../../config/database.js';

const CAMPOS_NO_VALORADOS = [
  'lote_insumo_id',
  'proveedor_id',
  'almacen_id',
  'item_inventario_id',
  'nombre',
  'concentracion',
  'stock_actual',
  'stock_inicial',
  'tipo_insumo_id',
  'estado_lote',
  'unidad_medida_cantidad',
  'unidad_medida_concentracion',
  'codigo_item',
  'proveedor_nombre',
  'almacen_nombre',
  'tipo_insumo_nombre'
];

const CAMPOS_VALORADOS = [
  ...CAMPOS_NO_VALORADOS,
  'costo_unitario',
  'costo_total_inicial',
  'costo_total_actual',
  'unidad_medida_moneda'
];

const construirVistaInsumo = (registro, puedeVerValorado) => {
  const camposPermitidos = puedeVerValorado ? CAMPOS_VALORADOS : CAMPOS_NO_VALORADOS;

  return camposPermitidos.reduce((resultado, campo) => {
    resultado[campo] = registro[campo] ?? null;
    return resultado;
  }, {});
};

const puedeVerInsumosValorados = (userPermissions = []) =>
  Array.isArray(userPermissions) &&
  userPermissions.includes('lote_insumos.ver.valorado');

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


export const getInsumosService = async (filters = {}, userPermissions = []) => {
  const parsedFilters = {};

  if (filters.almacen_id !== undefined) {
    const almacenId = Number(filters.almacen_id);

    if (!Number.isInteger(almacenId) || almacenId <= 0) {
      throw new Error('almacen_id debe ser un entero positivo');
    }

    parsedFilters.almacen_id = almacenId;
  }

  if (filters.proveedor_id !== undefined) {
    const proveedorId = Number(filters.proveedor_id);

    if (!Number.isInteger(proveedorId) || proveedorId <= 0) {
      throw new Error('proveedor_id debe ser un entero positivo');
    }

    parsedFilters.proveedor_id = proveedorId;
  }

  if (filters.tipo_insumo_id !== undefined) {
    const tipoInsumoId = Number(filters.tipo_insumo_id);

    if (!Number.isInteger(tipoInsumoId) || tipoInsumoId <= 0) {
      throw new Error('tipo_insumo_id debe ser un entero positivo');
    }

    parsedFilters.tipo_insumo_id = tipoInsumoId;
  }

  const insumos = await getInsumos(parsedFilters);
  const puedeVerValorado = puedeVerInsumosValorados(userPermissions);

  return insumos.map((insumo) => construirVistaInsumo(insumo, puedeVerValorado));
};

export const getInsumoByIdService = async (id, userPermissions = []) => {
  const loteInsumoId = Number(id);

  if (!Number.isInteger(loteInsumoId) || loteInsumoId <= 0) {
    throw new Error('id debe ser un entero positivo');
  }

  const loteInsumo = await getInsumoById(loteInsumoId);

  if (!loteInsumo) {
    throw new Error('Lote de insumo no encontrado');
  }

  return construirVistaInsumo(loteInsumo, puedeVerInsumosValorados(userPermissions));
};

export const getResumenInsumosPorTipoService = async (tipoInsumoId) => {
  if (tipoInsumoId === undefined || tipoInsumoId === null || tipoInsumoId === '') {
    throw new Error('tipo_insumo_id es obligatorio');
  }

  const parsedTipoInsumoId = Number(tipoInsumoId);

  if (!Number.isInteger(parsedTipoInsumoId) || parsedTipoInsumoId <= 0) {
    throw new Error('tipo_insumo_id debe ser un entero positivo');
  }

  const resumen = await getResumenInsumosPorTipo(parsedTipoInsumoId);

  if (!resumen) {
    throw new Error('No se encontraron lotes de insumo para ese tipo_insumo_id');
  }

  return resumen;
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

  if (
    insumoDatos.costo_total_inicial === undefined ||
    insumoDatos.costo_total_inicial === null
  ) {
    throw new Error('costo_total_inicial es obligatorio');
  }

  if (insumoDatos.stock_inicial === undefined || insumoDatos.stock_inicial === null) {
    throw new Error('stock_inicial es obligatorio');
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

  if (!Number.isFinite(stockInicial) || stockInicial <= 0) {
    throw new Error('stock_inicial debe ser mayor a 0');
  }

  const stockActual =
    insumoDatos.stock_actual !== undefined && insumoDatos.stock_actual !== null
      ? Number(insumoDatos.stock_actual)
      : stockInicial;

  const costoTotalInicial = Number(insumoDatos.costo_total_inicial);

  if (!Number.isFinite(costoTotalInicial) || costoTotalInicial < 0) {
    throw new Error('costo_total_inicial debe ser un numero valido');
  }

  const costoUnitario = costoTotalInicial / stockInicial;

  const payload = {
    proveedor_id: insumoDatos.proveedor_id ?? null,
    almacen_id: insumoDatos.almacen_id,
    nombre: insumoDatos.nombre,
    concentracion: insumoDatos.concentracion ?? null,
    costo_unitario: costoUnitario,
    stock_actual: 0,
    costo_total_inicial: costoTotalInicial,
    costo_total_actual: costoTotalInicial,
    stock_inicial: stockInicial,
    tipo_insumo_id: insumoDatos.tipo_insumo_id,
    estado_lote_id: 1,
    unidad_medida_cantidad: insumoDatos.unidad_medida_cantidad,
    unidad_medida_moneda: insumoDatos.unidad_medida_moneda,
    unidad_medida_concentracion: insumoDatos.unidad_medida_concentracion
  };

  return await db.tx(async (t) => {
    const itemInventarioCreado = await crearItemInventarioRepo(
      {
        nombre_item: 'Insumos Quimicos',
        codigo_item: 'IQ-PENDIENTE'
      },
      t
    );

    const itemInventario = await actualizarCodigoItemInventarioRepo(
      itemInventarioCreado.item_inventario_id,
      `IQ-${itemInventarioCreado.item_inventario_id}`,
      t
    );

    const loteCreado = await createInsumo(
      {
        ...payload,
        item_inventario_id: itemInventario.item_inventario_id
      },
      t
    );

    await procesarMovimientoAlmacenService(
      {
        item_inventario_id: itemInventario.item_inventario_id,
        tipo_movimientos_almacen_id: 1,
        motivo_movimiento: 'compra',
        cantidad: stockInicial,
        observaciones: 'Ingreso inicial por compra de lote_insumo',
        almacen_origen_id: null,
        almacen_destino_id: insumoDatos.almacen_id
      },
      t
    );

    return await getInsumoById(loteCreado.lote_insumo_id);
  });
};

export const actualizarEstadoLoteInsumoService = async (id, estado_lote_id) => {
  if (estado_lote_id === undefined || estado_lote_id === null || estado_lote_id === '') {
    throw new Error('estado_lote_id es obligatorio');
  }

  const estadoLoteId = Number(estado_lote_id);

  if (!Number.isInteger(estadoLoteId) || estadoLoteId <= 0) {
    throw new Error('estado_lote_id debe ser un entero positivo');
  }

  const loteActualizado = await actualizarEstadoLoteInsumo(id, estadoLoteId);

  if (!loteActualizado) {
    throw new Error('Lote de insumo no encontrado');
  }

  return loteActualizado;
};

export const actualizarStockActualInsumoService = async (id, stock_actual, options = {}) => {
  if (stock_actual === undefined || stock_actual === null) {
    throw new Error('stock_actual es obligatorio');
  }

  const nuevoStockActual = Number(stock_actual);

  if (!Number.isFinite(nuevoStockActual) || nuevoStockActual < 0) {
    throw new Error('stock_actual debe ser un numero valido');
  }

  const loteActual = await getInsumoById(id);

  if (!loteActual) {
    throw new Error('Lote de insumo no encontrado');
  }

  const stockInicial = Number(loteActual.stock_inicial);
  const costoUnitario = Number(loteActual.costo_unitario);

  if (nuevoStockActual > stockInicial) {
    throw new Error('stock_actual no puede ser mayor que stock_inicial');
  }

  if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
    throw new Error('costo_unitario del lote no es valido');
  }

  await createAjusteMovimientoAlmacenService({
    usuario_id: options.usuario_id ?? null,
    item_inventario_id: loteActual.item_inventario_id,
    motivo_movimiento: options.motivo_movimiento ?? 'regularizacion por conteo fisico',
    stock_actual_corregido: nuevoStockActual,
    observaciones: options.observaciones ?? 'Ajuste de stock desde lote_insumo'
  });

  return await getInsumoById(id);
};

export const deleteInsumoService = async (insumo_id) => {
  return await deleteInsumo(insumo_id);
};

export const getInsumoPdfServiceExcel = async () => {
  return await getCostoUnitario();
}
