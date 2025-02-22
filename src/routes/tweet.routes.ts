import { Router } from "express";
import { getNewFeedsController, getTweetChildrenController, getTweetController, postTweetController } from "~/controllers/tweets.controllers";
import { audienceValidation, getTweetChildrenValidator, paginationValidation, postTweetValidation, tweetIdValidation } from "~/middlewares/tweets.middlewares";
import { accessTokenValidation, isLoggedInUserValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const tweetsRouter = Router();

tweetsRouter.get("/",
  accessTokenValidation,
  verifiedUserValidation,
  paginationValidation,
  wrapRequestHandler(getNewFeedsController));

tweetsRouter.post("/",
  accessTokenValidation,
  verifiedUserValidation,
  postTweetValidation,
  wrapRequestHandler(postTweetController));

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
  paginationValidation,
  getTweetChildrenValidator,
  wrapRequestHandler(getTweetChildrenController));
