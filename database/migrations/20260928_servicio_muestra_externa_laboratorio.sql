BEGIN;

CREATE SEQUENCE IF NOT EXISTS laboratorio.servicio_analisis_codigo_recibo_seq;
CREATE SEQUENCE IF NOT EXISTS laboratorio.muestra_externa_codigo_muestra_seq;

CREATE TABLE IF NOT EXISTS laboratorio.servicio_analisis (
  servicio_id BIGSERIAL PRIMARY KEY,
  codigo_recibo TEXT NOT NULL UNIQUE DEFAULT (
    'REC-' || LPAD(NEXTVAL('laboratorio.servicio_analisis_codigo_recibo_seq')::TEXT, 6, '0')
  ),
  cliente_id BIGINT NOT NULL,
  fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
  usuario_recepcion_id BIGINT NOT NULL,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'recibido',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_servicio_analisis_cliente
    FOREIGN KEY (cliente_id)
    REFERENCES laboratorio.cliente_servicio_analisis (cliente_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_servicio_analisis_usuario_recepcion
    FOREIGN KEY (usuario_recepcion_id)
    REFERENCES seguridad.usuario (id)
    ON DELETE RESTRICT,
  CONSTRAINT servicio_analisis_estado_valido CHECK (
    estado IN (
      'recibido',
      'entregado_laboratorio',
      'en_analisis',
      'finalizado',
      'entregado_cliente',
      'cancelado'
    )
  ),
  CONSTRAINT servicio_analisis_codigo_recibo_no_vacio
    CHECK (BTRIM(codigo_recibo) <> '')
);

CREATE TABLE IF NOT EXISTS laboratorio.muestra_externa_laboratorio (
  muestra_id BIGSERIAL PRIMARY KEY,
  servicio_id BIGINT NOT NULL,
  codigo_muestra TEXT NOT NULL UNIQUE DEFAULT (
    'MUE-' || LPAD(NEXTVAL('laboratorio.muestra_externa_codigo_muestra_seq')::TEXT, 6, '0')
  ),
  nombre_muestra TEXT NOT NULL,
  lote_externo TEXT,
  cantidad_recibida NUMERIC(14, 4) NOT NULL,
  unidad_medida_id BIGINT NOT NULL,
  estado_muestra TEXT NOT NULL DEFAULT 'recibida',
  fecha_retencion_hasta DATE,
  almacen_actual_id BIGINT,
  lote_cochinilla_destino_id BIGINT,
  observaciones TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_muestra_externa_servicio
    FOREIGN KEY (servicio_id)
    REFERENCES laboratorio.servicio_analisis (servicio_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_muestra_externa_unidad_medida
    FOREIGN KEY (unidad_medida_id)
    REFERENCES inventario.unidades_medida (unidades_medida_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_muestra_externa_almacen_actual
    FOREIGN KEY (almacen_actual_id)
    REFERENCES inventario.almacen (almacen_id)
    ON DELETE SET NULL,
  CONSTRAINT fk_muestra_externa_lote_destino
    FOREIGN KEY (lote_cochinilla_destino_id)
    REFERENCES lotes.lote_cochinilla (lote_cochinilla_id)
    ON DELETE SET NULL,
  CONSTRAINT muestra_externa_nombre_no_vacio
    CHECK (BTRIM(nombre_muestra) <> ''),
  CONSTRAINT muestra_externa_codigo_no_vacio
    CHECK (BTRIM(codigo_muestra) <> ''),
  CONSTRAINT muestra_externa_cantidad_positiva
    CHECK (cantidad_recibida > 0),
  CONSTRAINT muestra_externa_estado_valido CHECK (
    estado_muestra IN (
      'recibida',
      'entregada_laboratorio',
      'en_analisis',
      'en_retencion',
      'transferida_inventario',
      'devuelta_cliente',
      'descartada'
    )
  )
);

CREATE INDEX IF NOT EXISTS servicio_analisis_cliente_idx
  ON laboratorio.servicio_analisis (cliente_id);

CREATE INDEX IF NOT EXISTS servicio_analisis_fecha_recepcion_idx
  ON laboratorio.servicio_analisis (fecha_recepcion DESC);

CREATE INDEX IF NOT EXISTS muestra_externa_servicio_idx
  ON laboratorio.muestra_externa_laboratorio (servicio_id);

CREATE INDEX IF NOT EXISTS muestra_externa_estado_idx
  ON laboratorio.muestra_externa_laboratorio (estado_muestra);

ALTER TABLE laboratorio.solicitud_analisis_laboratorio
  ADD COLUMN IF NOT EXISTS muestra_id BIGINT;

ALTER TABLE laboratorio.solicitud_analisis_laboratorio
  ALTER COLUMN item_inventario_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_solicitud_analisis_muestra_externa'
      AND conrelid = 'laboratorio.solicitud_analisis_laboratorio'::regclass
  ) THEN
    ALTER TABLE laboratorio.solicitud_analisis_laboratorio
      ADD CONSTRAINT fk_solicitud_analisis_muestra_externa
      FOREIGN KEY (muestra_id)
      REFERENCES laboratorio.muestra_externa_laboratorio (muestra_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'solicitud_analisis_origen_unico'
      AND conrelid = 'laboratorio.solicitud_analisis_laboratorio'::regclass
  ) THEN
    ALTER TABLE laboratorio.solicitud_analisis_laboratorio
      ADD CONSTRAINT solicitud_analisis_origen_unico CHECK (
        (item_inventario_id IS NOT NULL AND muestra_id IS NULL)
        OR
        (item_inventario_id IS NULL AND muestra_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS solicitud_analisis_muestra_idx
  ON laboratorio.solicitud_analisis_laboratorio (muestra_id)
  WHERE muestra_id IS NOT NULL;

COMMIT;
