import db from '../../../config/database.js'

export const getProveedores = async (tiposProveedor = []) => {
    if (!tiposProveedor.length) {
        const rows = await db.query('SELECT * FROM inventario.proveedor ORDER BY proveedor_id ASC');
        return rows;
    }

    const rows = await db.query(
        `SELECT *
        FROM inventario.proveedor
        WHERE LOWER(tipo_proveedor) IN ($1:csv)
        ORDER BY proveedor_id ASC`,
        [tiposProveedor.map(tipo => tipo.toLowerCase())]
    );
    return rows;
};

export const createProveedor = async (proveedorDatos) => {
    const result = await db.one(
        `INSERT INTO inventario.proveedor
        (nombre_razon_social, tipo_proveedor, telefono, correo, direccion, activo, ruc)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            proveedorDatos.nombre_razon_social,
            proveedorDatos.tipo_proveedor,
            proveedorDatos.telefono,
            proveedorDatos.correo,
            proveedorDatos.direccion,
            proveedorDatos.activo,
            proveedorDatos.ruc
        ]
    );
    return result;
}

export const updateProveedor = async (id, proveedorDatos) => {
    const resultado = await db.one(
        `UPDATE inventario.proveedor
        SET nombre_razon_social = $1, tipo_proveedor = $2, telefono = $3, correo = $4, direccion = $5, activo = $6, ruc = $7
        WHERE proveedor_id = $8
        RETURNING *`,
        [
            proveedorDatos.nombre_razon_social,
            proveedorDatos.tipo_proveedor,
            proveedorDatos.telefono,
            proveedorDatos.correo,
            proveedorDatos.direccion,
            proveedorDatos.activo,
            proveedorDatos.ruc,
            id
        ]
    );
    return resultado
}

export const actualizarActivoProveedor = async (id, activo) => {
    return await db.oneOrNone(
        `UPDATE inventario.proveedor
        SET activo = $1
        WHERE proveedor_id = $2
        RETURNING *`,
        [activo, id]
    );
}

export const actualizarTipoProveedor = async (id, tipo_proveedor) => {
    return await db.oneOrNone(
        `UPDATE inventario.proveedor
        SET tipo_proveedor = $1
        WHERE proveedor_id = $2
        RETURNING *`,
        [tipo_proveedor, id]
    );
}

export const deleteProveedor = async (id) => {
    await db.one('DELETE FROM inventario.proveedor WHERE proveedor_id = $1 RETURNING *', [id]);
    return { message: 'Proveedor eliminado' };
}
