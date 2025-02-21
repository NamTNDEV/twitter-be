import { Router } from "express";
import { likeTweetController } from "~/controllers/likes.controllers";
import { likeIdValidation } from "~/middlewares/tweets.middlewares";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const likesRoutes = Router();

likesRoutes.post("/", accessTokenValidation, verifiedUserValidation, likeIdValidation, wrapRequestHandler(likeTweetController));
