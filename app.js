import morgan from 'morgan'
import cors from 'cors'

import express from 'express'
import usuarioRoutes from './modulos/usuarios/routes/usuario_routes.js'
import rolesRoutes from './modulos/usuarios/routes/roles_routes.js'
import almacenRoutes from './modulos/inventario/routes/almacen_route.js'
import loteCarminRoutes from './modulos/lotes/routes/lote_carmin_route.js'
import composicionCarminRoutes from './modulos/lotes/routes/composicion_lote_carmin_route.js'
import procesoMezcladoRoutes from './modulos/produccion/routes/proceso_mezclado_routes.js'

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.use('/api/almacen',almacenRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/lotes-carmin', loteCarminRoutes)
app.use('/api/composicion-carmin', composicionCarminRoutes)
app.use('/api/proceso-mezclado', procesoMezcladoRoutes)
export default app