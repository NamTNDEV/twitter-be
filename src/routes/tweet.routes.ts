import { Router } from "express";
import { postTweetController } from "~/controllers/tweets.controllers";
import { postTweetValidation } from "~/middlewares/tweets.middlewares";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const tweetsRouter = Router();

tweetsRouter.post("/", accessTokenValidation, verifiedUserValidation, postTweetValidation, wrapRequestHandler(postTweetController)); 