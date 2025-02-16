import { Router } from "express";
import { serveImageController, serveM3U8Controller, serveSegmentController, serveStreamingVideoController } from "~/controllers/medias.controllers";

export const staticRoutes = Router();

staticRoutes.get("/image/:file_name", serveImageController);

// staticRoutes.get("/video/:file_name", serveVideoController);
staticRoutes.get("/video-stream/:file_name", serveStreamingVideoController);
staticRoutes.get("/video-hls/:id/master.m3u8", serveM3U8Controller);
staticRoutes.get("/video-hls/:id/:v/:segment", serveSegmentController);

