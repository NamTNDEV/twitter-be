import { ObjectId } from "mongodb";

export interface BookmarkSchemaType {
  _id?: ObjectId;
  tweet_id: string;
  user_id: string;
  createdAt?: Date;
}

export default class Bookmark {
  _id?: ObjectId;
  tweet_id: string;
  user_id: string;
  createdAt: Date;

  constructor({ _id, tweet_id, user_id, createdAt }: BookmarkSchemaType) {
    this._id = _id || new ObjectId();
    this.tweet_id = tweet_id;
    this.user_id = user_id;
    this.createdAt = createdAt || new Date();
  }
}