import {
  generarPDFComposicionService,
  generarExcelComposicionService,
  listarComposicionesLoteCochinillaService,
  obtenerComposicionLoteCochinillaPorIdService,
  obtenerComposicionesPorLoteResultanteService,
  obtenerComposicionesPorLoteComponenteService,
  crearComposicionLoteCochinillaService,
  actualizarComposicionLoteCochinillaService,
  eliminarComposicionLoteCochinillaService
} from '../services/composicion_lote_cochinilla_services.js'






/* ======================================================
   EXPORTS
====================================================== */




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

// generar Excel
export const generarExcelComposicion = async (req, res) => {
  try {
    const excelBuffer = await generarExcelComposicionService()

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=composicion_lote_cochinilla.xlsx'
    )
    res.send(excelBuffer)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ======================================================
   READ
====================================================== */

// listar todas las composiciones
export const listarComposicionesLoteCochinilla = async (req, res) => {
  try {
    const data = await listarComposicionesLoteCochinillaService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// obtener composición por id
export const obtenerComposicionLoteCochinillaPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerComposicionLoteCochinillaPorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// obtener composiciones por lote resultante
export const obtenerComposicionesPorLoteResultante = async (req, res) => {
  try {
    const { loteResultanteId } = req.params
    const data = await obtenerComposicionesPorLoteResultanteService(loteResultanteId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// obtener composiciones por lote componente
export const obtenerComposicionesPorLoteComponente = async (req, res) => {
  try {
    const { loteComponenteId } = req.params
    const data = await obtenerComposicionesPorLoteComponenteService(loteComponenteId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ======================================================
   CREATE
====================================================== */

export const crearComposicionLoteCochinilla = async (req, res) => {
  try {

    const data = await crearComposicionLoteCochinillaService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   UPDATE
====================================================== */

// actualizar composición
export const actualizarComposicionLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarComposicionLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// recalcular porcentajes manualmente por lote resultante
export const actualizarPorcentajesPorLoteResultante = async (req, res) => {
  try {
    const { loteResultanteId } = req.params
    const data = await actualizarPorcentajesPorLoteResultanteService(loteResultanteId)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* ======================================================
   DELETE
====================================================== */

// eliminar composición
export const eliminarComposicionLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await eliminarComposicionLoteCochinillaService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}