import morgan from 'morgan'
import cors from 'cors'

import express from 'express'
// Rutas de usuarios
import usuarioRoutes from './modulos/usuarios/routes/usuario_routes.js'
import rolesRoutes from './modulos/usuarios/routes/roles_routes.js'

// Rutas de inventario
import insumoRoutes from './modulos/inventario/routes/insumo_route.js'
import almacenRoutes from './modulos/inventario/routes/almacen_route.js'
import movimientoAlmacenRoutes from './modulos/inventario/routes/movimiento_almacen_route.js'
import proveedorRoutes from './modulos/inventario/routes/proveedor_route.js'

// Rutas de laboratorio
import laboratorioRoutes from './modulos/laboratorio/routes/laboratorio_routes.js'


const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.use('/api/almacen',almacenRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/insumos', insumoRoutes)
app.use('/api/movimientos-almacen', movimientoAlmacenRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/laboratorio', laboratorioRoutes)
export default app