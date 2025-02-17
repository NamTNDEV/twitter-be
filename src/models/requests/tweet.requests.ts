import { Media } from "../Other";
import { TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums";

export interface TweetReqBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_tweet_id?: string;
  hashtags?: string[];
  mentions?: string[];
  medias: Media[];
}