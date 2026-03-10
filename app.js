const express = require('express')
const app = express()

const usuarioRoutes = require('./modules/usuarios/routes/usuarioRoutes')

app.use(express.json())

app.use('/api/usuarios', usuarioRoutes)

module.exports = app