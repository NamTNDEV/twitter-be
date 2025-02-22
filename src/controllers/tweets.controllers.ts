import { MESSAGES, TWEET_MESSAGES } from "~/constants/messages"
import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetReqBody, TweetReqParams } from "~/models/requests/tweet.requests";
import tweetServices from "~/services/tweet.services";
import { TokenPayload } from "~/models/requests/user.requests";
import Tweet from "~/models/schemas/Tweet.schemas";

export const postTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const tweetPayload = req.body;
  const result = await tweetServices.postTweet(user_id, tweetPayload);
  res.json({
    message: TWEET_MESSAGES.POSTED_SUCCESSFUL,
    result: result
  });

  return;
}

export const getTweetController = async (req: Request<TweetReqParams>, res: Response) => {
  const { tweet_id } = req.params;
  const tweet = req.tweet as Tweet;
  const result = await tweetServices.increaseView(tweet_id, req.decoded_authorization?.user_id);
  const resultTweet = {
    ...tweet,
    user_views: result.user_views,
    guest_views: result.guest_views
  }
  res.json({
    message: TWEET_MESSAGES.FETCHED_SUCCESSFUL,
    result: resultTweet
  });

  return;
}