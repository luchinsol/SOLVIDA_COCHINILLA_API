import morgan from 'morgan'
import cors from 'cors'

import express from 'express'
import usuarioRoutes from './modulos/usuarios/routes/usuario_routes.js'
import rolesRoutes from './modulos/usuarios/routes/roles_routes.js'
import insumoRoutes from './modulos/inventario/routes/insumo_route.js'
import almacenRoutes from './modulos/inventario/routes/almacen_route.js'
import movimientoAlmacenRoutes from './modulos/inventario/routes/movimiento_almacen_route.js'
const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.use('/api/almacen',almacenRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/insumos', insumoRoutes)
app.use('/api/movimientos-almacen', movimientoAlmacenRoutes)
export default app