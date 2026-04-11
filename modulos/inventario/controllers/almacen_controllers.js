import {
    obtenerTodosAlmacenesService,
    crearAlmacenService,
    actualizarAlmacenService,
    eliminarAlmacenService,
    actualizarNombreAlmacenService,
    actualizarTipoAlmacenService,
    actualizarUbicacionAlmacenService,
    actualizarActivoAlmacenService
} from "../services/almacen_services.js";

export const obtenerTodosAlmacenesController = async (req, res) => {
    try {
        const almacenes = await obtenerTodosAlmacenesService();
        res.json(almacenes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const crearAlmacenController = async (req, res) => {
    
    const { nombre, tipo_almacen, ubicacion, activo } = req.body;
    try {
        
        const almacen = {
            nombre: nombre ?? null,
            tipo_almacen: tipo_almacen ?? null,
            ubicacion: ubicacion ?? null,
            activo: activo ?? true,
        }

        const nuevoAlmacen = await crearAlmacenService(almacen);
        res.status(201).json(nuevoAlmacen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const actualizarAlmacenController = async (req, res) => {
    const { id } = req.params;
    try {
        const datos = req.body;
        const almacenActualizado = await actualizarAlmacenService(id, datos);
        res.json(almacenActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const actualizarNombreAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const almacenActualizado = await actualizarNombreAlmacenService(id, nombre);
        res.json(almacenActualizado);
    } catch (error) {
        const status = error.message === 'Almacen no encontrado' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

export const actualizarTipoAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { tipo_almacen } = req.body;
    try {
        const almacenActualizado = await actualizarTipoAlmacenService(id, tipo_almacen);
        res.json(almacenActualizado);
    } catch (error) {
        const status = error.message === 'Almacen no encontrado' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

export const actualizarUbicacionAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { ubicacion } = req.body;
    try {
        const almacenActualizado = await actualizarUbicacionAlmacenService(id, ubicacion);
        res.json(almacenActualizado);
    } catch (error) {
        const status = error.message === 'Almacen no encontrado' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

export const actualizarActivoAlmacenController = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        const almacenActualizado = await actualizarActivoAlmacenService(id, activo);
        res.json(almacenActualizado);
    } catch (error) {
        const status = error.message === 'Almacen no encontrado' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

export const eliminarAlmacenController = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await eliminarAlmacenService(id);
        res.json(eliminado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
