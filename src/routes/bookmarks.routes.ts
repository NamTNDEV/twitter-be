import { Router } from "express";
import { bookmarkTweetController, unBookmarkTweetController } from "~/controllers/bookmarks.controllers";
import { bookmarkIdValidation, tweetIdValidation } from "~/middlewares/tweets.middlewares";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const bookmarksRoutes = Router();

bookmarksRoutes.post("/", accessTokenValidation, verifiedUserValidation, tweetIdValidation, wrapRequestHandler(bookmarkTweetController));
bookmarksRoutes.delete("/:bookmark_id", accessTokenValidation, verifiedUserValidation, bookmarkIdValidation, wrapRequestHandler(unBookmarkTweetController));