import db from '../../../config/database.js';

export const obtenerTodosAlmacenesRepo = async () => {
    const query = `
      SELECT
        almacen_id::int AS almacen_id,
        nombre,
        tipo_almacen,
        ubicacion,
        activo,
        creado_en
      FROM inventario.almacen
    `;
    console.log('Ejecutando query:', query);
    return await db.query(query);
}

export const crearAlmacenRepo = async (datos) => {
    const query = 'INSERT INTO inventario.almacen (nombre, tipo_almacen,ubicacion,activo) VALUES ($1, $2, $3, $4) RETURNING *';
    return await db.one(query, [datos.nombre, datos.tipo_almacen, datos.ubicacion, datos.activo]);
}

export const actualizarAlmacenRepo = async (id, datos) => {
    const query = 'UPDATE inventario.almacen SET nombre = $1, tipo_almacen = $2, ubicacion = $3, activo = $4 WHERE almacen_id = $5 RETURNING *';
    return await db.one(query, [datos.nombre, datos.tipo_almacen, datos.ubicacion, datos.activo, id]);
}

export const actualizarNombreAlmacenRepo = async (id, nombre) => {
    const query = 'UPDATE inventario.almacen SET nombre = $1 WHERE almacen_id = $2 RETURNING *';
    return await db.oneOrNone(query, [nombre, id]);
}

export const actualizarTipoAlmacenRepo = async (id, tipo_almacen) => {
    const query = 'UPDATE inventario.almacen SET tipo_almacen = $1 WHERE almacen_id = $2 RETURNING *';
    return await db.oneOrNone(query, [tipo_almacen, id]);
}

export const actualizarUbicacionAlmacenRepo = async (id, ubicacion) => {
    const query = 'UPDATE inventario.almacen SET ubicacion = $1 WHERE almacen_id = $2 RETURNING *';
    return await db.oneOrNone(query, [ubicacion, id]);
}

export const actualizarActivoAlmacenRepo = async (id, activo) => {
    const query = 'UPDATE inventario.almacen SET activo = $1 WHERE almacen_id = $2 RETURNING *';
    return await db.oneOrNone(query, [activo, id]);
}

export const eliminarAlmacenRepo = async (id) => {
    const query = 'DELETE FROM inventario.almacen WHERE almacen_id = $1 RETURNING *';
    return await db.one (query, [id]);
}
