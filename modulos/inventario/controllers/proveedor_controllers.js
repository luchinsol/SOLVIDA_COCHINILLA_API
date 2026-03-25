import {obtenerProveedoresService,crearProveedorService,actualizarProveedorService,eliminarProveedorService} from '../services/proveedor_services.js';

export const obtenerProveedoresController = async (req, res) => {
    try {
        const proveedores = await obtenerProveedoresService();
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
        res.status(500).json({ error: 'Error al crear proveedor' });
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

export const eliminarProveedorController = async (req, res) => {
    try {
        const id = req.params.id;
        const resultado = await eliminarProveedorService(id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
}