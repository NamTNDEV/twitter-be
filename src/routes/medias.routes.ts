import { Router } from "express";
import { uploadSingleImageController } from "~/controllers/medias.controllers";
import { wrapRequestHandler } from "~/utils/handlers";

export const mediasRoutes = Router();

mediasRoutes.post("/upload-image", wrapRequestHandler(uploadSingleImageController));