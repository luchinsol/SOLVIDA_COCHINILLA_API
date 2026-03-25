// CONTROLLER DE PROCESO MEZCLADO

import {
  listarProcesoMezcladoService,
  obtenerProcesoMezcladoPorIdService,
  crearProcesoMezcladoService,
  iniciarProcesoMezcladoService,
  finalizarProcesoMezcladoService,
  eliminarProcesoMezcladoService
} from '../services/proceso_mezclado_services.js'

// LISTAR
export const listarProcesoMezclado = async (req, res) => {
  try {
    const data = await listarProcesoMezcladoService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// OBTENER POR ID
export const obtenerProcesoMezcladoPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerProcesoMezcladoPorIdService(id)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// CREAR
export const crearProcesoMezclado = async (req, res) => {
  try {
    const data = await crearProcesoMezcladoService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// INICIAR
export const iniciarProcesoMezclado = async (req, res) => {
  try {
    const { id } = req.params
    const data = await iniciarProcesoMezcladoService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// FINALIZAR
export const finalizarProcesoMezclado = async (req, res) => {
  try {
    const { id } = req.params
    const data = await finalizarProcesoMezcladoService(id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ELIMINAR
export const eliminarProcesoMezclado = async (req, res) => {
  try {
    const { id } = req.params
    await eliminarProcesoMezcladoService(id)
    res.json({ mensaje: 'Proceso eliminado correctamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}