import db from "~/configs/db.configs";
import Conversation, { ConversationType } from "~/models/schemas/Conversation.schemas";

class ConversationService {
  public async saveConservation(conversation: ConversationType) {
    const newConversation = new Conversation(conversation);
    const result = await db.getConversationCollection().insertOne(newConversation);
    return result;
  }
}

const conversationService = new ConversationService();
export default conversationService;