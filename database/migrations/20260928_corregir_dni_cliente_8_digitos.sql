BEGIN;

ALTER TABLE laboratorio.cliente_servicio_analisis
  DROP CONSTRAINT IF EXISTS cliente_dni_formato;

ALTER TABLE laboratorio.cliente_servicio_analisis
  ADD CONSTRAINT cliente_dni_formato
  CHECK (dni IS NULL OR dni ~ '^[0-9]{8}$');

COMMIT;
