import db from '../../../config/database.js'
/*
export const getAllComposicionLoteCochinilla = async () => {
    const query = `SELECT * FROM lotes.composicion_lote_cochinilla`;
    const result = await db.query(query);
    return result.rows;
};
*/

export const getAllComposicionLoteCochinilla = async () => {
    // Datos ficticios
    const datosFicticios = [
        { id: 1, componente: 'Carmin de cochinilla', porcentaje: 50 },
        { id: 2, componente: 'Azúcar', porcentaje: 30 },
        { id: 3, componente: 'Agua', porcentaje: 20 }
    ];

    // Esto simula la promesa de la DB
    return new Promise((resolve) => {
        resolve(datosFicticios);
    });

    // Si luego quieres volver a la DB, descomenta:
    // const query = `SELECT * FROM lotes.composicion_lote_cochinilla`;
    // const result = await db.query(query);
    // return result.rows;
};

export const createComposicionLoteCochinilla = async (lote_resultante_id, lote_componente_id, peso_utilizado_kg, porcentaje_participacion, observaciones) => {
    const query = `
        INSERT INTO lotes.composicion_lote_cochinilla 
        (lote_resultante_id, lote_componente_id, peso_utilizado_kg, porcentaje_participacion, observaciones, creado_en)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
    `;
    const result = await db.one(query, [lote_resultante_id, lote_componente_id, peso_utilizado_kg, porcentaje_participacion, observaciones]);
    return result;
};