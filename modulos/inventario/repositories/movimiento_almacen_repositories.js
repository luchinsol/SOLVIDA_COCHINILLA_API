import db from "../../../config/database";

export const getMovimientosAlmacen = async () => {
  const query = "SELECT * FROM inventario.movimientos_almacen";
  const rows = await db.query(query);
  return rows;
};

export const createMovimientoAlmacen = async (movimientoDatos) => {
    const query = `
        INSERT INTO inventario.movimientos_almacen
            (usuario_id, almacen_id, tipo_material, material_id, tipo_movimiento, motivo_movimiento, fecha_hora, cantidad, unidad, observaciones)
        VALUES  
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING movimiento_id
    `;
    const result = await db.one(query, [
        movimientoDatos.usuario_id,
        movimientoDatos.almacen_id,
        movimientoDatos.tipo_material,
        movimientoDatos.material_id,
        movimientoDatos.tipo_movimiento,
        movimientoDatos.motivo_movimiento,
        movimientoDatos.fecha_hora,
        movimientoDatos.cantidad,
        movimientoDatos.unidad,
        movimientoDatos.observaciones,
    ]);
    return result;
};

export const updateMovimientoAlmacen = async (movimiento_id, movimientoDatos) => {
    const query = `
        UPDATE inventario.movimientos_almacen
        SET usuario_id = $1, almacen_id = $2, tipo_material = $3, material_id = $4, tipo_movimiento = $5, motivo_movimiento = $6, fecha_hora = $7, cantidad = $8, unidad = $9, observaciones = $10
        WHERE movimiento_id = $11
    `;
    const result = await db.query(query, [
        movimientoDatos.usuario_id,
        movimientoDatos.almacen_id,
        movimientoDatos.tipo_material,
        movimientoDatos.material_id,
        movimientoDatos.tipo_movimiento,
        movimientoDatos.motivo_movimiento,
        movimientoDatos.fecha_hora,
        movimientoDatos.cantidad,
        movimientoDatos.unidad,
        movimientoDatos.observaciones,
        movimiento_id,
    ]);
    return result;
};

export const deleteMovimientoAlmacen = async (movimiento_id) => {
    const query = "DELETE FROM inventario.movimientos_almacen WHERE movimiento_id = $1";
    const result = await db.result(query, [movimiento_id]);
    return result.rowCount > 0;
};