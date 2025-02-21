import { ObjectId } from "mongodb";
import { TweetAudience, TweetType } from "~/constants/enums";
import { Media } from "../Other";

interface TweetSchemaType {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_tweet_id: ObjectId | null;
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: Media[];
  guest_views?: number;
  user_views?: number;
  created_at?: Date;
  updated_at?: Date;
}

export default class Tweet {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_tweet_id: ObjectId | null;
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: Media[];
  guest_views: number;
  user_views: number;
  created_at: Date;
  updated_at: Date;

  constructor(tweet: TweetSchemaType) {
    this._id = tweet._id;
    this.user_id = tweet.user_id;
    this.type = tweet.type;
    this.audience = tweet.audience;
    this.content = tweet.content;
    this.parent_tweet_id = tweet.parent_tweet_id;
    this.hashtags = tweet.hashtags;
    this.mentions = tweet.mentions;
    this.medias = tweet.medias;
    this.guest_views = tweet.guest_views || 0;
    this.user_views = tweet.user_views || 0;
    this.created_at = tweet.created_at || new Date();
    this.updated_at = tweet.updated_at || new Date();
  }
}