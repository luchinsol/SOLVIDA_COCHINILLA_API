import jwt from "jsonwebtoken";
import {
  listarUsuariosService,
  obtenerResumenUsuariosService,
  createUsuarioService,
  patchDatosUsuarioService,
  updateUsuarioService,
  deleteUsuarioService,
  loginService,
} from "../services/usuario_services.js";

export const login = async (req, res) => {
  const { nickname, password } = req.body;

  try {
    const loginResult = await loginService(nickname, password);

    if (!loginResult) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const { usuario, permisos, modulos_acceso } = loginResult;

    const token = jwt.sign(
      {
        id: usuario.id,
        nickname: usuario.nickname,
        rol_id: usuario.rol_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.status(200).json({ usuario, permisos, modulos_acceso, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postUsuarios = async (req, res) => {
  const { nombres, apellidos, rol_id, correo, nickname, dni, departamento } = req.body;

  try {
    const usuario = {
      nombres: nombres ?? null,
      apellidos: apellidos ?? null,
      rol_id: rol_id ?? null,
      correo: correo ?? null,
      password: dni !== undefined && dni !== null ? String(dni).trim() : null,
      nickname: nickname ?? null,
      dni: dni ?? null,
      departamento: departamento ?? null,
      estado: true,
    };

    const postUsuario = await createUsuarioService(usuario);
    res.status(201).json(postUsuario);
  } catch (error) {
    if (
      error.message === "nombres es obligatorio" ||
      error.message === "apellidos es obligatorio" ||
      error.message === "rol_id es obligatorio" ||
      error.message === "correo es obligatorio" ||
      error.message === "nickname es obligatorio" ||
      error.message === "dni es obligatorio" ||
      error.message === "departamento es obligatorio" ||
      error.message === "rol_id debe ser un entero positivo" ||
      error.message === "dni debe ser un numero valido" ||
      error.message === "correo ya registrado" ||
      error.message === "nickname ya registrado"
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await listarUsuariosService(req.query);
    res.json(usuarios);
  } catch (error) {
    if (error.message.includes("rol_id debe ser")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

export const getResumenUsuarios = async (_, res) => {
  try {
    const resumen = await obtenerResumenUsuariosService();
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const putUsuarios = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = req.body;
    const putUsuario = await updateUsuarioService(id, usuario);
    res.json(putUsuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const patchDatosUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioActualizado = await patchDatosUsuarioService(id, req.body);
    res.json(usuarioActualizado);
  } catch (error) {
    if (
      error.message.includes("id debe ser") ||
      error.message.includes("rol_id debe ser") ||
      error.message.includes("Debes enviar al menos un campo")
    ) {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

export const deleteUsuarios = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteUsuario = await deleteUsuarioService(id);
    res.json(deleteUsuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
