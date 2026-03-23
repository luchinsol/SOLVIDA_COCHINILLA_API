import { obtenerTodosAlmacenesService,crearAlmacenService,actualizarAlmacenService,eliminarAlmacenService } from "../services/almacen_services.js";

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

export const eliminarAlmacenController = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await eliminarAlmacenService(id);
        res.json(eliminado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}