BEGIN;

ALTER TABLE laboratorio.cliente_servicio_analisis
  ALTER COLUMN nombre_razon_social SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cliente_servicio_nombre_no_vacio'
      AND conrelid = 'laboratorio.cliente_servicio_analisis'::regclass
  ) THEN
    ALTER TABLE laboratorio.cliente_servicio_analisis
      ADD CONSTRAINT cliente_servicio_nombre_no_vacio
      CHECK (BTRIM(nombre_razon_social) <> '');
  END IF;
END $$;

COMMIT;
