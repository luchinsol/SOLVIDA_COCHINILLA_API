// CAPA DE PRESENTACIÓN - CONTROLADORES
// Aquí se manejan las solicitudes HTTP, se validan los datos de entrada y se llaman a los servicios correspondientes.
// Se importan los servicios necesarios para manejar la lógica de negocio.
// Interactuan con el cliente y devuelven respuestas adecuadas.
import jwt from "jsonwebtoken";
import {
  listarUsuariosService,
  createUsuarioService,
  updateUsuarioService,
  deleteUsuarioService,
  loginService,
} from "../services/usuario_services.js";

// CONTROLLER LOGIN

export const login = async (req, res) => {
  const { nickname, password } = req.body;
  try {
    const usuario = await loginService(nickname, password);
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const token = jwt.sign(
      {
        id: usuario.id,
        nickname: usuario.nickname,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.status(200).json({ usuario, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CONTROLLER USUARIOS

export const getUsuarios = async (_, res) => {
  try {
    const usuarios = await listarUsuariosService();

    res.json(usuarios);
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

export const postUsuarios = async (req, res) => {
  console.log("en controller", req.body)
  const { nombre, rol_id, correo, password, nickname, activo } = req.body;
  try {
    const usuario = {
      nombre: nombre ?? null,
      rol_id: rol_id ?? null,
      correo: correo ?? null,
      password: password ?? null,
      nickname: nickname ?? null,
      activo: activo ?? true,
    };
    const postUsuario = await createUsuarioService(usuario);

    res.status(201).json(postUsuario);
  } catch (error) {
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
