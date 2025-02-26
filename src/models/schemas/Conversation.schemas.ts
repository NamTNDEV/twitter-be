import { ObjectId } from "mongodb";

export interface ConversationType {
  _id?: ObjectId;
  senderId: ObjectId;
  receiverId: ObjectId;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class Conversation {
  _id?: ObjectId;
  senderId: ObjectId;
  receiverId: ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(conversation: ConversationType) {
    this._id = conversation._id;
    this.senderId = conversation.senderId;
    this.receiverId = conversation.receiverId;
    this.message = conversation.message;
    this.createdAt = conversation.createdAt || new Date();
    this.updatedAt = conversation.updatedAt || new Date();
  }
}