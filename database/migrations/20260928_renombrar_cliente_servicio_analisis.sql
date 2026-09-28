BEGIN;

DO $$
BEGIN
  IF TO_REGCLASS('laboratorio.cliente') IS NOT NULL
     AND TO_REGCLASS('laboratorio.cliente_servicio_analisis') IS NULL THEN
    ALTER TABLE laboratorio.cliente
      RENAME TO cliente_servicio_analisis;
  END IF;
END $$;

COMMIT;
