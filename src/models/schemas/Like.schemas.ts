import { ObjectId } from "mongodb";

export interface LikeSchemaType {
  _id?: ObjectId;
  tweet_id: ObjectId;
  user_id: ObjectId;
  createdAt?: Date;
}

export default class Like {
  _id?: ObjectId;
  tweet_id: ObjectId;
  user_id: ObjectId;
  createdAt: Date;

  constructor({ _id, tweet_id, user_id, createdAt }: LikeSchemaType) {
    this._id = _id || new ObjectId();
    this.tweet_id = new ObjectId(tweet_id);
    this.user_id = new ObjectId(user_id);
    this.createdAt = createdAt || new Date();
  }
}