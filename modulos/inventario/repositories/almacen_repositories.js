import db from '../../../config/database.js';

export const obtenerTodosAlmacenesRepo = async () => {
    const query = 'SELECT * FROM almacen';
    return await db.query(query);
}

export const crearAlmacenRepo = async (datos) => {
    const query = 'INSERT INTO almacen (nombre, tipo_almacen,ubicacion,activo) VALUES ($1, $2, $3, $4) RETURNING *';
    return await db.one(query, [datos.nombre, datos.tipo_almacen, datos.ubicacion, datos.activo]);
}

export const actualizarAlmacenRepo = async (id, datos) => {
    const query = 'UPDATE almacen SET nombre = $1, tipo_almacen = $2, ubicacion = $3, activo = $4 WHERE id = $5 RETURNING *';
    return await db.one(query, [datos.nombre, datos.tipo_almacen, datos.ubicacion, datos.activo, id]);
}

export const eliminarAlmacenRepo = async (id) => {
    const query = 'DELETE FROM almacen WHERE id = $1 RETURNING *';
    return await db.one (query, [id]);
}
