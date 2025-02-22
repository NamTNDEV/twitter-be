import { Media } from "../Other";
import { TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums";
import { ParamsDictionary } from "express-serve-static-core";

export interface TweetReqBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_tweet_id?: string;
  hashtags?: string[];
  mentions?: string[];
  medias: Media[];
}

export interface TweetReqParams extends ParamsDictionary {
  tweet_id: string;
}