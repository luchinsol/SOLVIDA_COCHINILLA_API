import express from 'express'
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roles_controllers.js'

const rolesRoutes = express.Router()

rolesRoutes.get('/', getRoles)
rolesRoutes.post('/', createRole)
rolesRoutes.put('/:id', updateRole)
rolesRoutes.delete('/:id', deleteRole)

export default rolesRoutes