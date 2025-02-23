import { Router } from "express";
import { searchController } from "~/controllers/search.controllers";
import { paginationValidation } from "~/middlewares/tweets.middlewares";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const searchRoutes = Router();

searchRoutes.get("/", accessTokenValidation, verifiedUserValidation, paginationValidation, wrapRequestHandler(searchController));
