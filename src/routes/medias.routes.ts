import { Router } from "express";
import { uploadImageController } from "~/controllers/medias.controllers";
import { wrapRequestHandler } from "~/utils/handlers";

export const mediasRoutes = Router();

mediasRoutes.post("/upload-image", wrapRequestHandler(uploadImageController));