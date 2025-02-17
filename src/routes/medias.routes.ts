import { Router } from "express";
import { uploadImagesController, uploadVideoController, uploadVideoHlsController, videoStatusController } from "~/controllers/medias.controllers";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const mediasRoutes = Router();

mediasRoutes.post("/upload-images", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(uploadImagesController));
mediasRoutes.post("/upload-video", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(uploadVideoController));
mediasRoutes.post("/upload-video-hls", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(uploadVideoHlsController));
mediasRoutes.get("/video-status/:id", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(videoStatusController));
