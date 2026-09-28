BEGIN;

UPDATE laboratorio.servicio_analisis sa
SET estado = 'finalizado',
    modificado_en = NOW()
WHERE EXISTS (
    SELECT 1
    FROM laboratorio.muestra_externa_laboratorio mel
    WHERE mel.servicio_id = sa.servicio_id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM laboratorio.muestra_externa_laboratorio mel
    WHERE mel.servicio_id = sa.servicio_id
      AND mel.estado_muestra NOT IN (
        'en_retencion',
        'transferida_inventario',
        'devuelta_cliente',
        'descartada'
      )
  );

COMMIT;
