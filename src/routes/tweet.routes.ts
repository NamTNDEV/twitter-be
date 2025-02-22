import { Router } from "express";
import { getTweetChildrenController, getTweetController, postTweetController } from "~/controllers/tweets.controllers";
import { audienceValidation, postTweetValidation, tweetIdValidation } from "~/middlewares/tweets.middlewares";
import { accessTokenValidation, isLoggedInUserValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const tweetsRouter = Router();

tweetsRouter.post("/", accessTokenValidation, verifiedUserValidation, postTweetValidation, wrapRequestHandler(postTweetController));
tweetsRouter.get("/:tweet_id",
  tweetIdValidation,
  isLoggedInUserValidation(accessTokenValidation),
  isLoggedInUserValidation(verifiedUserValidation),
  audienceValidation,
  wrapRequestHandler(getTweetController));

tweetsRouter.get("/:tweet_id/children",
  tweetIdValidation,
  isLoggedInUserValidation(accessTokenValidation),
  isLoggedInUserValidation(verifiedUserValidation),
  audienceValidation,
  wrapRequestHandler(getTweetChildrenController));