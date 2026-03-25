import {obtenerTodosAnalisisService,crearAnalisisService,actualizarAnalisisService,eliminarAnalisisService} from '../services/laboratorio_services.js'

export const obtenerTodosAnalisisController = async (req, res) => {
    try {
        const analisis = await obtenerTodosAnalisisService();
        res.json(analisis);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener análisis' });
    }
}

export const crearAnalisisController = async (req, res) => {
    try {
        const analisisDatos = req.body;
        const nuevoAnalisis = await crearAnalisisService(analisisDatos);
        res.status(201).json(nuevoAnalisis);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear análisis' });
    }
};

export const actualizarAnalisisController = async (req, res) => {
    try {
        const analisis_id = req.params.id;
        const analisisDatos = req.body;
        const analisisActualizado = await actualizarAnalisisService(analisis_id, analisisDatos);
        res.json(analisisActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar análisis' });
    }
};

export const eliminarAnalisisController = async (req, res) => {
    try {
        const analisis_id = req.params.id;
        const resultado = await eliminarAnalisisService(analisis_id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar análisis' });
    }
}
