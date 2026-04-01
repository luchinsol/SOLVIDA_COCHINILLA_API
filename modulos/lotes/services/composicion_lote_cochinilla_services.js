import db from '../../../config/database.js'

import {
  obtenerLoteCochinillaPorIdRepo,
  actualizarMasaLoteCochinillaPorDeltaRepo,
  actualizarConsumoLoteCochinillaRepo,
  actualizarCostosYMasaLoteCochinillaRepo
} from '../repositories/lote_cochinilla_repositories.js'
import {
  listarComposicionesLoteCochinillaRepo,
  obtenerComposicionLoteCochinillaPorIdRepo,
  obtenerComposicionesPorLoteResultanteRepo,
  obtenerComposicionesPorLoteComponenteRepo,
  crearComposicionLoteCochinillaRepo,
  actualizarComposicionLoteCochinillaRepo,
  actualizarPorcentajesPorLoteResultanteRepo,
  eliminarComposicionLoteCochinillaRepo
} from '../repositories/composicion_lote_cochinilla_repositories.js'

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';



export const generarPDFComposicionService = async () => {
    const datos = await listarComposicionesLoteCochinillaRepo();
    
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
    const datos = await listarComposicionesLoteCochinillaRepo();
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



/* ======================================================
   READ: listar todas las composiciones
====================================================== */
export const listarComposicionesLoteCochinillaService = async () => {
  return await listarComposicionesLoteCochinillaRepo()
}

/* ======================================================
   READ: obtener composición por id
====================================================== */
export const obtenerComposicionLoteCochinillaPorIdService = async (id) => {
  const composicion = await obtenerComposicionLoteCochinillaPorIdRepo(id)

  if (!composicion) {
    throw new Error('Composición de lote de cochinilla no encontrada')
  }

  return composicion
}

/* ======================================================
   READ: obtener composiciones por lote resultante
====================================================== */
export const obtenerComposicionesPorLoteResultanteService = async (loteResultanteId) => {
  return await obtenerComposicionesPorLoteResultanteRepo(loteResultanteId)
}

/* ======================================================
   READ: obtener composiciones por lote componente
====================================================== */
export const obtenerComposicionesPorLoteComponenteService = async (loteComponenteId) => {
  return await obtenerComposicionesPorLoteComponenteRepo(loteComponenteId)
}

/* ======================================================
   CREATE: crear composición
   - crea la fila
   - resta masa al lote componente
   - suma masa al lote resultante
   - recalcula porcentajes
   - actualiza costos totales y costos por kilo de ambos lotes
====================================================== */
export const crearComposicionLoteCochinillaService = async (data) => {
  console.log('1. inicio service', data)

  if (!data.lote_resultante_id) {
    throw new Error('lote_resultante_id es obligatorio')
  }

  if (!data.lote_componente_id) {
    throw new Error('lote_componente_id es obligatorio')
  }

  if (Number(data.lote_resultante_id) === Number(data.lote_componente_id)) {
    throw new Error('Un lote no puede componerse de sí mismo')
  }

  if (data.peso_utilizado_kg == null || Number(data.peso_utilizado_kg) <= 0) {
    throw new Error('peso_utilizado_kg debe ser mayor a 0')
  }

  const peso = Number(data.peso_utilizado_kg)
  console.log('2. validaciones ok, peso =', peso)

  return await db.tx(async (t) => {
    console.log('3. entró a la transacción')

    const loteResultante = await obtenerLoteCochinillaPorIdRepo(data.lote_resultante_id, t)
    console.log('4. lote resultante encontrado', loteResultante?.lote_cochinilla_id)

    const loteComponente = await obtenerLoteCochinillaPorIdRepo(data.lote_componente_id, t)
    console.log('5. lote componente encontrado', loteComponente?.lote_cochinilla_id)

    if (!loteResultante) {
      throw new Error('Lote resultante no encontrado')
    }

    if (!loteComponente) {
      throw new Error('Lote componente no encontrado')
    }

    if (Number(loteComponente.masa_total_kg) < peso) {
      throw new Error('El lote componente no tiene masa suficiente')
    }

    const costoKiloComponente = Number(loteComponente.costo_kilo_dolares ?? 0)
    const costoTotalComponenteAnterior = Number(loteComponente.costo_total_dolares ?? 0)
    const masaComponenteAnterior = Number(loteComponente.masa_total_kg ?? 0)

    const costoAportado = peso * costoKiloComponente

    const nuevaMasaComponente = masaComponenteAnterior - peso
    const nuevoCostoTotalComponente = costoTotalComponenteAnterior - costoAportado
    const nuevoCostoKiloComponente = costoKiloComponente

    const masaResultanteAnterior = Number(loteResultante.masa_total_kg ?? 0)
    const costoTotalResultanteAnterior = Number(loteResultante.costo_total_dolares ?? 0)

    const nuevaMasaResultante = masaResultanteAnterior + peso
    const nuevoCostoTotalResultante = costoTotalResultanteAnterior + costoAportado
    const nuevoCostoKiloResultante =
      nuevaMasaResultante === 0 ? 0 : nuevoCostoTotalResultante / nuevaMasaResultante

    const nuevaComposicion = await crearComposicionLoteCochinillaRepo(
      {
        ...data,
        porcentaje_participacion: null
      },
      t
    )

    // actualizar masa y costos del lote componente
    const loteComponenteActualizado = await actualizarCostosYMasaLoteCochinillaRepo(
      data.lote_componente_id,
      {
        masa_total_kg: nuevaMasaComponente,
        costo_total_dolares: nuevoCostoTotalComponente,
        costo_kilo_dolares: nuevoCostoKiloComponente
      },
      t
    )

    // actualizar masa y costos del lote resultante
    await actualizarCostosYMasaLoteCochinillaRepo(
      data.lote_resultante_id,
      {
        masa_total_kg: nuevaMasaResultante,
        costo_total_dolares: nuevoCostoTotalResultante,
        costo_kilo_dolares: nuevoCostoKiloResultante
      },
      t
    )

    // actualizar estado del lote componente
    const nuevoEstadoComponente =
      Number(loteComponenteActualizado.masa_total_kg) === 0 ? 'agotado' : 'usado'

    await actualizarConsumoLoteCochinillaRepo(
      data.lote_componente_id,
      {
        masa_total_kg: loteComponenteActualizado.masa_total_kg,
        estado: nuevoEstadoComponente
      },
      t
    )

    await actualizarPorcentajesPorLoteResultanteRepo(data.lote_resultante_id, t)

    return nuevaComposicion
  })
}


/* ======================================================
   UPDATE: actualizar composición
   - ajusta peso
   - corrige masas por diferencia
   - recalcula porcentajes
   - recalcula costos totales y costos por kilo de ambos lotes
====================================================== */
export const actualizarComposicionLoteCochinillaService = async (id, data) => {
  const composicionActual = await obtenerComposicionLoteCochinillaPorIdRepo(id)

  if (!composicionActual) {
    throw new Error('Composición de lote de cochinilla no encontrada')
  }

  if (data.peso_utilizado_kg == null || Number(data.peso_utilizado_kg) <= 0) {
    throw new Error('peso_utilizado_kg debe ser mayor a 0')
  }

  const pesoAnterior = Number(composicionActual.peso_utilizado_kg)
  const pesoNuevo = Number(data.peso_utilizado_kg)
  const diferencia = pesoNuevo - pesoAnterior

  return await db.tx(async (t) => {
    const loteComponente = await obtenerLoteCochinillaPorIdRepo(
      composicionActual.lote_componente_id,
      t
    )

    const loteResultante = await obtenerLoteCochinillaPorIdRepo(
      composicionActual.lote_resultante_id,
      t
    )

    if (!loteComponente) {
      throw new Error('Lote componente no encontrado')
    }

    if (!loteResultante) {
      throw new Error('Lote resultante no encontrado')
    }

    if (diferencia > 0 && Number(loteComponente.masa_total_kg) < diferencia) {
      throw new Error('El lote componente no tiene masa suficiente para aumentar el peso utilizado')
    }

    const costoKiloComponente = Number(loteComponente.costo_kilo_dolares ?? 0)

    const masaComponenteAnterior = Number(loteComponente.masa_total_kg ?? 0)
    const masaResultanteAnterior = Number(loteResultante.masa_total_kg ?? 0)

    const costoTotalResultanteAnterior = Number(loteResultante.costo_total_dolares ?? 0)

    const valorMovimiento = diferencia * costoKiloComponente

    const nuevaMasaComponente = masaComponenteAnterior - diferencia
    const nuevoCostoTotalComponente = nuevaMasaComponente * costoKiloComponente
    const nuevoCostoKiloComponente = costoKiloComponente

    const nuevaMasaResultante = masaResultanteAnterior + diferencia
    const nuevoCostoTotalResultante = costoTotalResultanteAnterior + valorMovimiento
    const nuevoCostoKiloResultante =
      nuevaMasaResultante === 0 ? 0 : nuevoCostoTotalResultante / nuevaMasaResultante

    const composicionActualizada = await actualizarComposicionLoteCochinillaRepo(
      id,
      {
        peso_utilizado_kg: pesoNuevo,
        porcentaje_participacion: composicionActual.porcentaje_participacion,
        observaciones: data.observaciones ?? null
      },
      t
    )

    if (diferencia !== 0) {
      const loteComponenteActualizado = await actualizarCostosYMasaLoteCochinillaRepo(
        composicionActual.lote_componente_id,
        {
          masa_total_kg: nuevaMasaComponente,
          costo_total_dolares: nuevoCostoTotalComponente,
          costo_kilo_dolares: nuevoCostoKiloComponente
        },
        t
      )

      await actualizarCostosYMasaLoteCochinillaRepo(
        composicionActual.lote_resultante_id,
        {
          masa_total_kg: nuevaMasaResultante,
          costo_total_dolares: nuevoCostoTotalResultante,
          costo_kilo_dolares: nuevoCostoKiloResultante
        },
        t
      )

      const nuevoEstadoComponente =
        Number(loteComponenteActualizado.masa_total_kg) === 0 ? 'agotado' : 'usado'

      await actualizarConsumoLoteCochinillaRepo(
        composicionActual.lote_componente_id,
        {
          masa_total_kg: loteComponenteActualizado.masa_total_kg,
          estado: nuevoEstadoComponente
        },
        t
      )
    }

    await actualizarPorcentajesPorLoteResultanteRepo(
      composicionActual.lote_resultante_id,
      t
    )

    return composicionActualizada
  })
}

/* ======================================================
   UPDATE: recalcular porcentajes manualmente
====================================================== */
export const actualizarPorcentajesPorLoteResultanteService = async (loteResultanteId) => {
  return await actualizarPorcentajesPorLoteResultanteRepo(loteResultanteId)
}

/* ======================================================
   DELETE: eliminar composición
   - devuelve masa al lote componente
   - resta masa al lote resultante
   - recalcula porcentajes
   - recalcula costos totales y costos por kilo de ambos lotes
====================================================== */
export const eliminarComposicionLoteCochinillaService = async (id) => {
  const composicionActual = await obtenerComposicionLoteCochinillaPorIdRepo(id)

  if (!composicionActual) {
    throw new Error('Composición de lote de cochinilla no encontrada')
  }

  const peso = Number(composicionActual.peso_utilizado_kg)

  return await db.tx(async (t) => {
    const loteComponente = await obtenerLoteCochinillaPorIdRepo(
      composicionActual.lote_componente_id,
      t
    )

    const loteResultante = await obtenerLoteCochinillaPorIdRepo(
      composicionActual.lote_resultante_id,
      t
    )

    if (!loteComponente) {
      throw new Error('Lote componente no encontrado')
    }

    if (!loteResultante) {
      throw new Error('Lote resultante no encontrado')
    }

    const costoKiloComponente = Number(loteComponente.costo_kilo_dolares ?? 0)

    const masaComponenteAnterior = Number(loteComponente.masa_total_kg ?? 0)
    const masaResultanteAnterior = Number(loteResultante.masa_total_kg ?? 0)

    const costoTotalResultanteAnterior = Number(loteResultante.costo_total_dolares ?? 0)

    const valorMovimiento = peso * costoKiloComponente

    const nuevaMasaComponente = masaComponenteAnterior + peso
    const nuevoCostoTotalComponente = nuevaMasaComponente * costoKiloComponente
    const nuevoCostoKiloComponente = costoKiloComponente

    const nuevaMasaResultante = masaResultanteAnterior - peso
    const nuevoCostoTotalResultante = costoTotalResultanteAnterior - valorMovimiento
    const nuevoCostoKiloResultante =
      nuevaMasaResultante === 0 ? 0 : nuevoCostoTotalResultante / nuevaMasaResultante

    const eliminada = await eliminarComposicionLoteCochinillaRepo(id, t)

    const loteComponenteActualizado = await actualizarCostosYMasaLoteCochinillaRepo(
      composicionActual.lote_componente_id,
      {
        masa_total_kg: nuevaMasaComponente,
        costo_total_dolares: nuevoCostoTotalComponente,
        costo_kilo_dolares: nuevoCostoKiloComponente
      },
      t
    )

    await actualizarCostosYMasaLoteCochinillaRepo(
      composicionActual.lote_resultante_id,
      {
        masa_total_kg: nuevaMasaResultante,
        costo_total_dolares: nuevoCostoTotalResultante,
        costo_kilo_dolares: nuevoCostoKiloResultante
      },
      t
    )

    const nuevoEstadoComponente =
      Number(loteComponenteActualizado.masa_total_kg) === 0 ? 'agotado' : 'usado'

    await actualizarConsumoLoteCochinillaRepo(
      composicionActual.lote_componente_id,
      {
        masa_total_kg: loteComponenteActualizado.masa_total_kg,
        estado: nuevoEstadoComponente
      },
      t
    )

    await actualizarPorcentajesPorLoteResultanteRepo(
      composicionActual.lote_resultante_id,
      t
    )

    return eliminada
  })
}