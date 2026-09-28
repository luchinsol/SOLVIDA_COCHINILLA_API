BEGIN;

INSERT INTO seguridad.permiso (codigo, descripcion, recurso, accion, alcance, modulo_id)
SELECT
  'servicio_analisis.crear',
  'Registrar servicios de analisis externos',
  'servicio_analisis',
  'crear',
  'laboratorio',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM seguridad.permiso WHERE codigo = 'servicio_analisis.crear'
);

COMMIT;
