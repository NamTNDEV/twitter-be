import { Router } from "express";
import { bookmarkTweetController } from "~/controllers/bookmarks.controllers";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const bookmarksRoutes = Router();

bookmarksRoutes.post("/", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(bookmarkTweetController));
