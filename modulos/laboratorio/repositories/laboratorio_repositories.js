import db from '../../../config/database.js';


export const obtenerTodosAnalisis = async () => {
    const query = 'SELECT * FROM analisis';
    return db.query(query);
};

export const crearAnalisis = async (datos) => {
    const query = `
        INSERT INTO analisis (usuario_id, proceso_extraccion_id, tipo_material, material_id, tipo_analisis, fecha_hora, concentracion_ac, humedad, color_l, color_a, color_b, observaciones)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    return db.query(query, [datos.usuario_id, datos.proceso_extraccion_id, datos.tipo_material, datos.material_id, datos.tipo_analisis, datos.fecha_hora, datos.concentracion_ac, datos.humedad, datos.color_l, datos.color_a, datos.color_b, datos.observaciones]);
};

export const actualizarAnalisis = async (id, datos) => {
    const query = `
        UPDATE analisis SET usuario_id=$1, proceso_extraccion_id=$2, tipo_material=$3, material_id=$4, tipo_analisis=$5, fecha_hora=$6, concentracion_ac=$7, humedad=$8, color_l=$9, color_a=$10, color_b=$11, observaciones=$12
        WHERE analisis_id = $13
    `;
    return db.query(query, [datos.usuario_id, datos.proceso_extraccion_id, datos.tipo_material, datos.material_id, datos.tipo_analisis, datos.fecha_hora, datos.concentracion_ac, datos.humedad, datos.color_l, datos.color_a, datos.color_b, datos.observaciones, id]);
};

export const eliminarAnalisis = async (id) => {
    const query = 'DELETE FROM analisis WHERE analisis_id = $1';
    return db.query(query, [id]);
};