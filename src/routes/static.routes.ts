import { Router } from "express";
import { serveImageController, serveVideoController } from "~/controllers/medias.controllers";

export const staticRoutes = Router();

staticRoutes.get("/image/:file_name", serveImageController);
staticRoutes.get("/video/:file_name", serveVideoController);
