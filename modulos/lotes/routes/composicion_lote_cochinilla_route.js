import express from 'express';
import { generarPDFComposicionController } from '../controllers/composicion_lote_cochinilla_controllers.js';

const composicionLoteCochinillaRouter = express.Router();

composicionLoteCochinillaRouter.get('/pdf', generarPDFComposicionController);

export default composicionLoteCochinillaRouter;