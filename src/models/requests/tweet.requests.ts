import { Media } from "../Other";
import { TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums";
import { ParamsDictionary, Query } from "express-serve-static-core";

export interface TweetReqBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_tweet_id?: string | null;
  hashtags?: string[];
  mentions?: string[];
  medias: Media[];
}

export interface TweetReqParams extends ParamsDictionary {
  tweet_id: string;
}

export interface TweetChildrenReqQuery extends PaginationReqQuery {
  tweet_type: string;
}

export interface PaginationReqQuery extends Query {
  limit: string;
  page: string;
}