BEGIN;

CREATE TABLE IF NOT EXISTS laboratorio.cliente_servicio_analisis (
  cliente_id BIGSERIAL PRIMARY KEY,
  nombre_razon_social TEXT,
  ruc TEXT,
  dni TEXT,
  telefono1 TEXT NOT NULL,
  telefono2 TEXT,
  correo TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cliente_ruc_formato
    CHECK (ruc IS NULL OR ruc ~ '^[0-9]{11}$'),
  CONSTRAINT cliente_dni_formato
    CHECK (dni IS NULL OR dni ~ '^[0-9]{8}$'),
  CONSTRAINT cliente_telefono1_obligatorio
    CHECK (BTRIM(telefono1) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS cliente_ruc_unique
  ON laboratorio.cliente_servicio_analisis (ruc)
  WHERE ruc IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cliente_dni_unique
  ON laboratorio.cliente_servicio_analisis (dni)
  WHERE dni IS NOT NULL;

INSERT INTO seguridad.permiso (codigo, descripcion, recurso, accion, alcance, modulo_id)
SELECT
  'cliente_laboratorio.ver',
  'Ver clientes del laboratorio',
  'cliente_laboratorio',
  'ver',
  'laboratorio',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM seguridad.permiso WHERE codigo = 'cliente_laboratorio.ver'
);

INSERT INTO seguridad.permiso (codigo, descripcion, recurso, accion, alcance, modulo_id)
SELECT
  'cliente_laboratorio.crear',
  'Crear clientes del laboratorio',
  'cliente_laboratorio',
  'crear',
  'laboratorio',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM seguridad.permiso WHERE codigo = 'cliente_laboratorio.crear'
);

INSERT INTO seguridad.permiso (codigo, descripcion, recurso, accion, alcance, modulo_id)
SELECT
  'cliente_laboratorio.editar',
  'Editar clientes del laboratorio',
  'cliente_laboratorio',
  'editar',
  'laboratorio',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM seguridad.permiso WHERE codigo = 'cliente_laboratorio.editar'
);

COMMIT;
