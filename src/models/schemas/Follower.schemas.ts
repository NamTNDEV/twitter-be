import { ObjectId } from "mongodb";

interface FollowerType {
  _id?: ObjectId;
  userId: ObjectId;
  followeeId: ObjectId;
  createdAt?: Date;
}

export default class Follower {
  _id?: ObjectId;
  userId: ObjectId;
  followeeId: ObjectId;
  createdAt: Date;

  constructor({ _id, userId, followeeId, createdAt }: FollowerType) {
    this._id = _id;
    this.userId = userId;
    this.followeeId = followeeId;
    this.createdAt = createdAt || new Date();
  }
}