import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { CONVERSATION_MESSAGES } from "~/constants/messages";
import { ConversationReqParams, ConversationReqQuery } from "~/models/requests/conversation.request";
import { TokenPayload } from "~/models/requests/user.requests";
import conversationService from "~/services/convesation.services";

export const getConversationsController = async (req: Request<ConversationReqParams, any, any, ConversationReqQuery>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { ri_id } = req.params;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const { conversations, total } = await conversationService.getConversationsByIds({
    senderId: new ObjectId(user_id),
    receiverId: new ObjectId(ri_id),
    limit,
    page
  });
  res.json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATIONS_SUCCESSFUL,
    result: {
      conversations,
      total_pages: Math.ceil(total / limit),
      limit,
      page
    }
  })
  return;
}