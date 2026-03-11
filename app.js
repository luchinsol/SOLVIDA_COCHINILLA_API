import morgan from 'morgan'
import cors from 'cors'
import usuarioRoutes from './modulos/usuarios/routes/usuario_routes.js'

import express from 'express'
const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())


app.use('/api/usuarios', usuarioRoutes)

export default app