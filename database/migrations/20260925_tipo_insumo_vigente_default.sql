UPDATE inventario.tipo_insumos
SET vigente = true
WHERE vigente IS NULL;

ALTER TABLE inventario.tipo_insumos
  ALTER COLUMN vigente SET DEFAULT true,
  ALTER COLUMN vigente SET NOT NULL;
