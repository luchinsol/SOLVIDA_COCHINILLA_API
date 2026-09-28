BEGIN;

ALTER TABLE laboratorio.analisis_laboratorio
  ADD COLUMN IF NOT EXISTS muestra_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_analisis_muestra_externa'
      AND conrelid = 'laboratorio.analisis_laboratorio'::regclass
  ) THEN
    ALTER TABLE laboratorio.analisis_laboratorio
      ADD CONSTRAINT fk_analisis_muestra_externa
      FOREIGN KEY (muestra_id)
      REFERENCES laboratorio.muestra_externa_laboratorio (muestra_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS analisis_muestra_externa_idx
  ON laboratorio.analisis_laboratorio (muestra_id)
  WHERE muestra_id IS NOT NULL;

COMMIT;
