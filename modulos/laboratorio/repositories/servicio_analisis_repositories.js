import db from '../../../config/database.js'

export const obtenerClienteActivoRepo = async (clienteId, t = db) => t.oneOrNone(
  `SELECT cliente_id::int AS cliente_id, nombre_razon_social, telefono1
   FROM laboratorio.cliente_servicio_analisis
   WHERE cliente_id = $1
     AND activo = true`,
  [clienteId]
)

export const obtenerUnidadesMasaRepo = async (unidadIds, t = db) => t.any(
  `SELECT unidades_medida_id::int AS unidades_medida_id, unidad_de_medida
   FROM inventario.unidades_medida
   WHERE unidades_medida_id IN ($1:csv)
     AND LOWER(propiedad_medida) = 'masa'`,
  [unidadIds]
)

export const crearServicioAnalisisRepo = async (datos, t = db) => t.one(
  `INSERT INTO laboratorio.servicio_analisis (
     cliente_id,
     fecha_recepcion,
     usuario_recepcion_id,
     observaciones
   ) VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4)
   RETURNING
     servicio_id::int AS servicio_id,
     codigo_recibo,
     cliente_id::int AS cliente_id,
     fecha_recepcion,
     usuario_recepcion_id::int AS usuario_recepcion_id,
     observaciones,
     estado,
     creado_en,
     modificado_en`,
  [
    datos.cliente_id,
    datos.fecha_recepcion,
    datos.usuario_recepcion_id,
    datos.observaciones
  ]
)

export const crearMuestraExternaRepo = async (datos, t = db) => t.one(
  `INSERT INTO laboratorio.muestra_externa_laboratorio (
     servicio_id,
     nombre_muestra,
     lote_externo,
     cantidad_recibida,
     unidad_medida_id,
     observaciones
   ) VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING
     muestra_id::int AS muestra_id,
     servicio_id::int AS servicio_id,
     codigo_muestra,
     nombre_muestra,
     lote_externo,
     cantidad_recibida,
     unidad_medida_id::int AS unidad_medida_id,
     estado_muestra,
     observaciones,
     creado_en`,
  [
    datos.servicio_id,
    datos.nombre_muestra,
    datos.lote_externo,
    datos.cantidad_recibida,
    datos.unidad_medida_id,
    datos.observaciones
  ]
)

export const crearSolicitudMuestraRepo = async (datos, t = db) => t.one(
  `INSERT INTO laboratorio.solicitud_analisis_laboratorio (
     item_inventario_id,
     muestra_id,
     usuario_id,
     observacion_laboratorio,
     atendido
   ) VALUES (NULL, $1, $2, $3, false)
   RETURNING
     solicitud_id::int AS solicitud_id,
     muestra_id::int AS muestra_id,
     usuario_id::int AS usuario_id,
     observacion_laboratorio,
     creado_en,
     atendido`,
  [datos.muestra_id, datos.usuario_id, datos.observacion_laboratorio]
)

export const crearParametroSolicitudMuestraRepo = async (datos, t = db) => t.one(
  `INSERT INTO laboratorio.solicitud_parametro_laboratorio (
     solicitud_id,
     tipo_ensayo
   ) VALUES ($1, $2)
   RETURNING
     solicitud_parametro_id::int AS solicitud_parametro_id,
     solicitud_id::int AS solicitud_id,
     tipo_ensayo`,
  [datos.solicitud_id, datos.tipo_ensayo]
)

export const listarServiciosAnalisisRepo = async (filtros, t = db) => {
  const condiciones = []
  const valores = []

  if (filtros.buscar) {
    valores.push(`%${filtros.buscar}%`)
    condiciones.push(`(
      sa.codigo_recibo ILIKE $${valores.length}
      OR c.nombre_razon_social ILIKE $${valores.length}
      OR COALESCE(c.ruc, '') ILIKE $${valores.length}
      OR COALESCE(c.dni, '') ILIKE $${valores.length}
      OR EXISTS (
        SELECT 1
        FROM laboratorio.muestra_externa_laboratorio mel_busqueda
        WHERE mel_busqueda.servicio_id = sa.servicio_id
          AND (
            mel_busqueda.codigo_muestra ILIKE $${valores.length}
            OR mel_busqueda.nombre_muestra ILIKE $${valores.length}
            OR COALESCE(mel_busqueda.lote_externo, '') ILIKE $${valores.length}
          )
      )
    )`)
  }

  if (filtros.estado) {
    valores.push(filtros.estado)
    condiciones.push(`sa.estado = $${valores.length}`)
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const total = await t.one(
    `SELECT COUNT(*)::int AS total
     FROM laboratorio.servicio_analisis sa
     INNER JOIN laboratorio.cliente_servicio_analisis c
       ON c.cliente_id = sa.cliente_id
     ${where}`,
    valores
  )

  const offset = (filtros.pagina - 1) * filtros.limite
  valores.push(filtros.limite, offset)
  const limitePosicion = valores.length - 1
  const offsetPosicion = valores.length

  const servicios = await t.any(
    `SELECT
       sa.servicio_id::int AS servicio_id,
       sa.codigo_recibo,
       TO_CHAR(sa.fecha_recepcion, 'DD/MM/YYYY') AS fecha_recepcion,
       sa.estado,
       sa.observaciones,
       c.cliente_id::int AS cliente_id,
       c.nombre_razon_social AS cliente,
       c.ruc,
       c.dni,
       COALESCE(detalle.cantidad_muestras, 0)::int AS cantidad_muestras,
       COALESCE(detalle.muestras, '[]'::json) AS muestras,
       COALESCE(detalle.ensayos, '[]'::json) AS ensayos
     FROM laboratorio.servicio_analisis sa
     INNER JOIN laboratorio.cliente_servicio_analisis c
       ON c.cliente_id = sa.cliente_id
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*)::int AS cantidad_muestras,
         json_agg(
           json_build_object(
             'muestra_id', mel.muestra_id::int,
             'codigo_muestra', mel.codigo_muestra,
             'nombre_muestra', mel.nombre_muestra,
             'lote_externo', mel.lote_externo,
             'estado_muestra', mel.estado_muestra,
             'ensayos', COALESCE(parametros.ensayos, '[]'::json)
           )
           ORDER BY mel.muestra_id
         ) AS muestras,
         COALESCE(
           (
             SELECT json_agg(ensayo ORDER BY ensayo)
             FROM (
               SELECT DISTINCT spl_general.tipo_ensayo AS ensayo
               FROM laboratorio.muestra_externa_laboratorio mel_general
               INNER JOIN laboratorio.solicitud_analisis_laboratorio sal_general
                 ON sal_general.muestra_id = mel_general.muestra_id
               INNER JOIN laboratorio.solicitud_parametro_laboratorio spl_general
                 ON spl_general.solicitud_id = sal_general.solicitud_id
               WHERE mel_general.servicio_id = sa.servicio_id
             ) ensayos_unicos
           ),
           '[]'::json
         ) AS ensayos
       FROM laboratorio.muestra_externa_laboratorio mel
       LEFT JOIN LATERAL (
         SELECT json_agg(spl.tipo_ensayo ORDER BY spl.solicitud_parametro_id) AS ensayos
         FROM laboratorio.solicitud_analisis_laboratorio sal
         INNER JOIN laboratorio.solicitud_parametro_laboratorio spl
           ON spl.solicitud_id = sal.solicitud_id
         WHERE sal.muestra_id = mel.muestra_id
       ) parametros ON true
       WHERE mel.servicio_id = sa.servicio_id
     ) detalle ON true
     ${where}
     ORDER BY sa.fecha_recepcion DESC, sa.servicio_id DESC
     LIMIT $${limitePosicion}
     OFFSET $${offsetPosicion}`,
    valores
  )

  return { servicios, total: total.total }
}

export const obtenerDetalleServicioAnalisisRepo = async (servicioId, t = db) => {
  const servicio = await t.oneOrNone(
    `SELECT
       sa.servicio_id::int AS servicio_id,
       sa.codigo_recibo,
       TO_CHAR(sa.fecha_recepcion, 'DD/MM/YYYY') AS fecha_recepcion,
       sa.estado,
       sa.observaciones,
       c.cliente_id::int AS cliente_id,
       c.nombre_razon_social AS cliente,
       c.ruc,
       c.dni,
       c.telefono1,
       c.correo
     FROM laboratorio.servicio_analisis sa
     INNER JOIN laboratorio.cliente_servicio_analisis c
       ON c.cliente_id = sa.cliente_id
     WHERE sa.servicio_id = $1`,
    [servicioId]
  )

  if (!servicio) return null

  const muestras = await t.any(
    `SELECT
       mel.muestra_id::int AS muestra_id,
       mel.codigo_muestra,
       mel.nombre_muestra,
       mel.lote_externo,
       mel.cantidad_recibida,
       um.unidad_de_medida,
       mel.estado_muestra,
       mel.observaciones,
       analisis.analisis_id::int AS analisis_id,
       analisis.nombre AS numero_analisis,
       analisis.peso_muestra_g,
       analisis.estado_analisis_id::int AS estado_analisis_id,
       COALESCE(analisis.ensayos, '[]'::jsonb) AS ensayos
     FROM laboratorio.muestra_externa_laboratorio mel
     INNER JOIN inventario.unidades_medida um
       ON um.unidades_medida_id = mel.unidad_medida_id
     LEFT JOIN LATERAL (
       SELECT
         al.analisis_id,
         al.nombre,
         al.peso_muestra_g,
         al.estado_analisis_id,
         COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'ensayo_id', el.ensayo_id::int,
               'tipo_ensayo', el.tipo_ensayo,
               'conforme', el.conforme,
               'peso_ensayo_g', CASE
                 WHEN el.tipo_ensayo = 'humedad' THEN eh.peso_ensayo_g
                 WHEN el.tipo_ensayo = 'acido_carminico' THEN eac.peso_ensayo_g
                 WHEN el.tipo_ensayo = 'color_cielab' THEN ecc.peso_ensayo_g
                 ELSE NULL
               END,
               'resultado', CASE
                 WHEN el.tipo_ensayo = 'humedad' THEN jsonb_build_object(
                   'porcentaje', eh.resultado
                 )
                 WHEN el.tipo_ensayo = 'acido_carminico' THEN jsonb_build_object(
                   'porcentaje', eac.resultado,
                   'absorbancia_nm', eac.absorbancia_nm
                 )
                 WHEN el.tipo_ensayo = 'color_cielab' THEN jsonb_build_object(
                   'l', ecc.resultado_l,
                   'a', ecc.resultado_a,
                   'b', ecc.resultado_b
                 )
                 ELSE '{}'::jsonb
               END
             )
             ORDER BY el.ensayo_id
           ) FILTER (WHERE el.ensayo_id IS NOT NULL),
           '[]'::jsonb
         ) AS ensayos
       FROM laboratorio.analisis_laboratorio al
       LEFT JOIN laboratorio.ensayo_laboratorio el
         ON el.analisis_id = al.analisis_id
       LEFT JOIN laboratorio.ensayo_humedad eh
         ON eh.ensayo_id = el.ensayo_id
       LEFT JOIN laboratorio.ensayo_acido_carminico eac
         ON eac.ensayo_id = el.ensayo_id
       LEFT JOIN laboratorio.ensayo_color_cielab ecc
         ON ecc.ensayo_id = el.ensayo_id
       WHERE al.muestra_id = mel.muestra_id
       GROUP BY al.analisis_id
       ORDER BY COALESCE(al.modificado_en, al.creado_en) DESC, al.analisis_id DESC
       LIMIT 1
     ) analisis ON true
     WHERE mel.servicio_id = $1
     ORDER BY mel.muestra_id`,
    [servicioId]
  )

  return { ...servicio, muestras }
}

export const obtenerResumenServiciosAnalisisRepo = async (t = db) => t.one(
  `SELECT
     (
       SELECT COUNT(*)::int
       FROM laboratorio.muestra_externa_laboratorio
       WHERE creado_en::date = CURRENT_DATE
     ) AS recibidas_hoy,
     (
       SELECT COUNT(*)::int
       FROM laboratorio.muestra_externa_laboratorio
       WHERE estado_muestra IN ('recibida', 'entregada_laboratorio')
     ) AS pendientes_envio,
     (
       SELECT COUNT(*)::int
       FROM laboratorio.servicio_analisis
       WHERE estado IN ('finalizado', 'entregado_cliente')
     ) AS analisis_completados`
)

export const ejecutarTransaccionServicioAnalisis = (callback) => db.tx(callback)
