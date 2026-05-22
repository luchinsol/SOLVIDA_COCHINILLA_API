import { listarModulosService } from '../services/modulo_services.js'

export const getModulos = async (_, res) => {
  try {
    const modulos = await listarModulosService()
    res.status(200).json(modulos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
