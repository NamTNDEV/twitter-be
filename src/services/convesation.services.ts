import { ObjectId } from "mongodb";
import db from "~/configs/db.configs";
import Conversation, { ConversationType } from "~/models/schemas/Conversation.schemas";

class ConversationService {
  public async saveConservation(conversation: ConversationType) {
    const newConversation = new Conversation(conversation);
    const result = await db.getConversationCollection().insertOne(newConversation);
    return result;
  }

  public async getConversationsByIds({ senderId, receiverId, limit, page }: { senderId: ObjectId, receiverId: ObjectId, limit: number, page: number }) {
    const $match = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };
    const conversations = await db.getConversationCollection().find($match).skip((page - 1) * limit).limit(limit).toArray();
    const total = await db.getConversationCollection().countDocuments($match);
    return {
      conversations,
      total
    };
  }
}

const conversationService = new ConversationService();
export default conversationService;