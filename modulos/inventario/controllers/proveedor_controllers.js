import {
    obtenerProveedoresService,
    crearProveedorService,
    actualizarProveedorService,
    eliminarProveedorService,
    actualizarActivoProveedorService,
    actualizarTipoProveedorService
} from '../services/proveedor_services.js';

export const obtenerProveedoresController = async (req, res) => {
    try {
        const { tipo_proveedor } = req.query;
        const proveedores = await obtenerProveedoresService(tipo_proveedor);
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
}   

export const crearProveedorController = async (req, res) => {
    try {
        const proveedorDatos = req.body;
        const nuevoProveedor = await crearProveedorService(proveedorDatos);
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const actualizarProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const proveedorDatos = req.body;
        const proveedorActualizado = await actualizarProveedorService(id, proveedorDatos);
        res.json(proveedorActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
};

export const actualizarActivoProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const { activo } = req.body;
        const proveedorActualizado = await actualizarActivoProveedorService(id, activo);
        res.json(proveedorActualizado);
    } catch (error) {
        const status = error.message === 'Proveedor no encontrado' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const actualizarTipoProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const { tipo_proveedor } = req.body;
        const proveedorActualizado = await actualizarTipoProveedorService(id, tipo_proveedor);
        res.json(proveedorActualizado);
    } catch (error) {
        const status = error.message === 'Proveedor no encontrado' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const eliminarProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const resultado = await eliminarProveedorService(id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
}
