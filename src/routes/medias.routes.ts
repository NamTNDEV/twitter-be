import { Router } from "express";
import { uploadSingleMedia } from "~/controllers/medias.controllers";
import { wrapRequestHandler } from "~/utils/handlers";

export const mediasRoutes = Router();

mediasRoutes.post("/upload-image", wrapRequestHandler(uploadSingleMedia));