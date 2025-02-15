import { Router } from "express";
import { uploadImagesController, uploadVideoController } from "~/controllers/medias.controllers";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const mediasRoutes = Router();

mediasRoutes.post("/upload-images", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(uploadImagesController));
mediasRoutes.post("/upload-video", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(uploadVideoController));
