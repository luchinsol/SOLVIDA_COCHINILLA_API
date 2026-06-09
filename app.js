import morgan from 'morgan'
import cors from 'cors'

import express from 'express'
// Rutas de usuarios
import usuarioRoutes from './modulos/usuarios/routes/usuario_routes.js'
import rolesRoutes from './modulos/usuarios/routes/roles_routes.js'
import modulosRoutes from './modulos/usuarios/routes/modulo_routes.js'
import permisosRoutes from './modulos/usuarios/routes/permisos_routes.js'
import rolPermisoRoutes from './modulos/usuarios/routes/rol_permiso_routes.js'
import { login } from './modulos/usuarios/controllers/usuario_controllers.js'

//Rutas de lotes
import loteCarminRoutes from './modulos/lotes/routes/lote_carmin_route.js'
import composicionCarminRoutes from './modulos/lotes/routes/composicion_lote_carmin_route.js'
import composicionLoteCochinillaRoutes from './modulos/lotes/routes/composicion_lote_cochinilla_route.js'
import loteCochinillaRoutes from './modulos/lotes/routes/lote_cochinilla_routes.js'
import tipoCochinillaRoutes from './modulos/lotes/routes/tipo_cochinilla_routes.js'
import extractoRoutes from './modulos/lotes/routes/extracto_route.js'
import estadoLoteRoutes from './modulos/lotes/routes/estado_lote_routes.js'

//Rutas de producción
import procesoMezcladoRoutes from './modulos/produccion/routes/proceso_mezclado_routes.js'
import recetaExtraccionRoutes from './modulos/produccion/routes/receta_extraccion_routes.js'


// Rutas de inventario
import insumoRoutes from './modulos/inventario/routes/lote_insumo_route.js'
import almacenRoutes from './modulos/inventario/routes/almacen_route.js'
import movimientoAlmacenRoutes from './modulos/inventario/routes/movimiento_almacen_route.js'
import motivoMovimientoRoutes from './modulos/inventario/routes/motivo_movimiento_routes.js'
import itemInventarioRoutes from './modulos/inventario/routes/item_inventario_routes.js'
import proveedorRoutes from './modulos/inventario/routes/proveedor_route.js'
import tipoInsumoRoutes from './modulos/inventario/routes/tipo_insumo_routes.js'
import tiposMovimientosAlmacenRoutes from './modulos/inventario/routes/tipo_movimientos_almacen_routes.js'
import unidadesMedidaRoutes from './modulos/inventario/routes/unidades_medida_routes.js'

// Rutas de laboratorio
import laboratorioRoutes from './modulos/laboratorio/routes/laboratorio_routes.js'
import solicitudAnalisisRoutes from './modulos/laboratorio/routes/solicitud_analisis_routes.js'

// Middleware de autenticación
import { verifyToken } from './middlewares/authmiddleware.js'

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' })
})

// Ruta pública para login (no requiere token)
app.post('/api/usuarios/login', login)

// Rutas protegidas por autenticación
app.use(verifyToken) // Middleware para verificar el token en todas las rutas siguientes

app.use('/api/almacen',almacenRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/modulos', modulosRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/permisos', permisosRoutes)
app.use('/api/rol-permisos', rolPermisoRoutes)
app.use('/api/lotes-carmin', loteCarminRoutes)
app.use('/api/composicion-carmin', composicionCarminRoutes)
app.use('/api/proceso-mezclado', procesoMezcladoRoutes)
app.use('/api/lote-insumos', insumoRoutes)
app.use('/api/movimientos-almacen', movimientoAlmacenRoutes)
app.use('/api/motivos-movimiento', motivoMovimientoRoutes)
app.use('/api/tipos-movimientos-almacen', tiposMovimientosAlmacenRoutes)
app.use('/api/item-inventario', itemInventarioRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/laboratorio', laboratorioRoutes)
app.use('/api/solicitudes-analisis', solicitudAnalisisRoutes)
app.use('/api/comp_lotecochini', composicionLoteCochinillaRoutes)
app.use('/api/lotes-cochinilla', loteCochinillaRoutes)
app.use('/api/tipos-cochinilla', tipoCochinillaRoutes)
app.use('/api/extractos', extractoRoutes)
app.use('/api/estados-lote', estadoLoteRoutes)
app.use('/api/recetas-extraccion', recetaExtraccionRoutes)
app.use('/api/tipo-insumo', tipoInsumoRoutes)
app.use('/api/unidades-medida', unidadesMedidaRoutes)

console.log('Servidor API de SOLVIDA COCHINILLA iniciado en el puerto 3000')    
export default app


