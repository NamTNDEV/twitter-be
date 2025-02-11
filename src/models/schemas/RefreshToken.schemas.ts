import { ObjectId } from "mongodb";

interface RefreshTokenType {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt?: Date;
}

export default class RefreshToken {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt: Date;

  constructor({ _id, userId, token, createdAt }: RefreshTokenType) {
    this._id = _id;
    this.userId = userId;
    this.token = token;
    this.createdAt = createdAt || new Date();
  }
}