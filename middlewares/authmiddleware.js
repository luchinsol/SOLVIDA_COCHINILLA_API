import jwt from "jsonwebtoken";
import {
  listarPermisosPorRolService,
  verificarPermisoPorRolService
} from "../modulos/usuarios/services/rol_permiso_services.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 🔥 AQUÍ tienes el usuario
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

export const requirePermission = (permisoCodigo) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const hasPermission = await verificarPermisoPorRolService(
        req.user.rol_id,
        permisoCodigo
      );

      if (!hasPermission) {
        return res.status(403).json({ error: "No tienes permisos para esta acción" });
      }

      next();
    } catch (error) {
      if (
        error.message === 'rol_id del token no es valido' ||
        error.message === 'permiso.codigo es obligatorio'
      ) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  };
};

export const requireAnyPermission = (permisosCodigo = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      if (!Array.isArray(permisosCodigo) || permisosCodigo.length === 0) {
        return res.status(500).json({ error: "No se definieron permisos para la ruta" });
      }

      const permisosDelRol = await listarPermisosPorRolService(req.user.rol_id);
      const codigosPermisos = permisosDelRol.map((permiso) => permiso.permiso_codigo);
      req.userPermissions = codigosPermisos;

      const hasAnyPermission = permisosCodigo.some((permisoCodigo) =>
        codigosPermisos.includes(permisoCodigo)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({ error: "No tienes permisos para esta acción" });
      }

      next();
    } catch (error) {
      if (error.message === 'rol_id del token no es valido') {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  };
};
