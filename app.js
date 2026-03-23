import morgan from 'morgan'
import cors from 'cors'

import express from 'express'
import usuarioRoutes from './modulos/usuarios/routes/usuario_routes.js'
import rolesRoutes from './modulos/usuarios/routes/roles_routes.js'

import almacenRoutes from './modulos/inventario/routes/almacen_route.js'
const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.use('/api/almacen',almacenRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', rolesRoutes)

export default app