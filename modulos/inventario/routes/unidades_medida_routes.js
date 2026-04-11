import { Router } from "express";
import {
  crearUnidadMedidaController,
  obtenerUnidadesMedidaPorPropiedadController,
  obtenerUnidadesMedidaController
} from "../controllers/unidades_medida_controller.js";

const router = Router();

router.get("/", obtenerUnidadesMedidaController);
router.get("/propiedad/:propiedadMedida", obtenerUnidadesMedidaPorPropiedadController);
router.post("/", crearUnidadMedidaController);

export default router;
