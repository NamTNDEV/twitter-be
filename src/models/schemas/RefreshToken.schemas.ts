import { ObjectId } from "mongodb";

interface RefreshTokenType {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt?: Date;
  iat: number;
  exp: number;
}

export default class RefreshToken {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt: Date;
  iat: Date;
  exp: Date;

  constructor({ _id, userId, token, createdAt, iat, exp }: RefreshTokenType) {
    this._id = _id;
    this.userId = userId;
    this.token = token;
    this.createdAt = createdAt || new Date();
    this.iat = new Date(iat * 1000);
    this.exp = new Date(exp * 1000);
  }
}