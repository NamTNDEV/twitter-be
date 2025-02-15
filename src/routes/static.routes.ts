import { Router } from "express";
import { serveImageController, serveStreamingVideoController } from "~/controllers/medias.controllers";

export const staticRoutes = Router();

staticRoutes.get("/image/:file_name", serveImageController);

// staticRoutes.get("/video/:file_name", serveVideoController);
staticRoutes.get("/video-stream/:file_name", serveStreamingVideoController);

