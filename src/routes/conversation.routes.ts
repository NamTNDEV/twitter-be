import { Router } from "express";
import { getConversationsController } from "~/controllers/conversations.controller";
import { accessTokenValidation, verifiedUserValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

export const conversationRoutes = Router();

conversationRoutes.get("/ri/:ri_id", accessTokenValidation, verifiedUserValidation, wrapRequestHandler(getConversationsController));