import { obtenerSolicitudAnalisisPendientePorItemInventarioService } from '../services/solicitud_analisis_services.js'

export const obtenerSolicitudAnalisisPendientePorItemInventarioController = async (req, res) => {
  try {
    const solicitud = await obtenerSolicitudAnalisisPendientePorItemInventarioService(
      req.params.item_inventario_id
    )
    res.json(solicitud)
  } catch (error) {
    if (
      error.message.includes('item_inventario_id debe ser') ||
      error.message.includes('solicitud de analisis no encontrada')
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Error al obtener la solicitud de analisis pendiente' })
  }
}
