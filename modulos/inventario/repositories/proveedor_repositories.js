import db from '../../config/database.js';

export const getProveedores = async () => {
    const rows = await db.query('SELECT * FROM inventario.proveedores');
    return rows;
};

export const createProveedor = async (proveedorDatos) => {
    
    const result = await db.one(
        'INSERT INTO inventario.proveedores (nombre, contacto, telefono) VALUES ($1, $2, $3)',
        [proveedorDatos.nombre, proveedorDatos.contacto, proveedorDatos.telefono]
    );
    return { id: result.insertId, ...proveedorDatos };
}

export const updateProveedor = async (id, proveedorDatos) => {
    
    const resultado = await db.one(
        'UPDATE inventario.proveedores SET nombre = $1, contacto = $2, telefono = $3 WHERE id = $4',
        [proveedorDatos.nombre, proveedorDatos.contacto, proveedorDatos.telefono, id]
    );
    return resultado
}

export const deleteProveedor = async (id) => {
    await db.one('DELETE FROM inventario.proveedores WHERE id = $1', [id]);
    return { message: 'Proveedor eliminado' };
}