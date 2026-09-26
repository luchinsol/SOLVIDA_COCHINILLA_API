BEGIN;

ALTER TABLE inventario.proveedor
  ALTER COLUMN nombre_item_provee DROP NOT NULL;

COMMIT;
