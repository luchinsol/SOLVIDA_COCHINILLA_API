BEGIN;

CREATE TABLE IF NOT EXISTS inventario.stock_item_almacen (
  item_inventario_id bigint NOT NULL,
  almacen_id bigint NOT NULL,
  stock_actual numeric(14, 4) NOT NULL DEFAULT 0,
  creado_en timestamp without time zone NOT NULL DEFAULT NOW(),
  modificado_en timestamp without time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_stock_item_almacen
    PRIMARY KEY (item_inventario_id, almacen_id),
  CONSTRAINT fk_stock_item_almacen_item
    FOREIGN KEY (item_inventario_id)
    REFERENCES inventario.item_inventario (item_inventario_id),
  CONSTRAINT fk_stock_item_almacen_almacen
    FOREIGN KEY (almacen_id)
    REFERENCES inventario.almacen (almacen_id),
  CONSTRAINT ck_stock_item_almacen_no_negativo
    CHECK (stock_actual >= 0)
);

ALTER TABLE inventario.movimiento_almacen
  ADD COLUMN IF NOT EXISTS saldo_origen numeric(14, 4),
  ADD COLUMN IF NOT EXISTS saldo_destino numeric(14, 4);

WITH lotes AS (
  SELECT item_inventario_id, almacen_id, COALESCE(stock_actual, 0) AS stock_actual
  FROM inventario.lote_insumo
  UNION ALL
  SELECT item_inventario_id, almacen_id, COALESCE(stock_actual, 0)
  FROM lotes.lote_cochinilla
  UNION ALL
  SELECT item_inventario_id, almacen_id, COALESCE(stock_actual, 0)
  FROM lotes.lote_carmin
  UNION ALL
  SELECT item_inventario_id, almacen_id, COALESCE(stock_actual, 0)
  FROM lotes.extracto
)
INSERT INTO inventario.stock_item_almacen (
  item_inventario_id,
  almacen_id,
  stock_actual
)
SELECT item_inventario_id, almacen_id, stock_actual
FROM lotes
WHERE item_inventario_id IS NOT NULL
  AND almacen_id IS NOT NULL
ON CONFLICT (item_inventario_id, almacen_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_stock_item_almacen_almacen
  ON inventario.stock_item_almacen (almacen_id, item_inventario_id);

CREATE INDEX IF NOT EXISTS idx_movimiento_almacen_item_fecha
  ON inventario.movimiento_almacen (item_inventario_id, fecha_hora DESC);

CREATE INDEX IF NOT EXISTS idx_movimiento_almacen_origen_fecha
  ON inventario.movimiento_almacen (almacen_origen_id, fecha_hora DESC);

CREATE INDEX IF NOT EXISTS idx_movimiento_almacen_destino_fecha
  ON inventario.movimiento_almacen (almacen_destino_id, fecha_hora DESC);

COMMIT;
