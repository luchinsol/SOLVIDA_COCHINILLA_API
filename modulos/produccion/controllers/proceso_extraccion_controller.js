import { crearProcesoExtraccionService } from '../services/proceso_extraccion_services.js'

export const crearProcesoExtraccion = async (req, res) => {
  try {
    const data = await crearProcesoExtraccionService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
