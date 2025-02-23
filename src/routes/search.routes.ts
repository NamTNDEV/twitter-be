import { Router } from "express";
import { searchController } from "~/controllers/search.controllers";
import { accessTokenValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const searchRoutes = Router();

searchRoutes.get("/", accessTokenValidation, wrapRequestHandler(searchController));
