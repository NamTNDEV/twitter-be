import { Router } from "express";
import { serveImageController } from "~/controllers/medias.controllers";

export const staticRoutes = Router();

staticRoutes.get("/image/:file_name", serveImageController);