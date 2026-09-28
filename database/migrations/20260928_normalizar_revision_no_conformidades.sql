BEGIN;

UPDATE laboratorio.analisis_laboratorio al
SET estado_analisis_id = 4,
    modificado_en = NOW()
WHERE al.estado_analisis_id = 3
  AND EXISTS (
    SELECT 1
    FROM laboratorio.ensayo_laboratorio el
    WHERE el.analisis_id = al.analisis_id
      AND el.conforme = false
      AND el.no_conformidad_abierta = true
  );

COMMIT;
