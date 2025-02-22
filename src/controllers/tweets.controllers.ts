import { MESSAGES, TWEET_MESSAGES } from "~/constants/messages"
import e, { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetReqBody, TweetReqParams } from "~/models/requests/tweet.requests";
import tweetServices from "~/services/tweet.services";
import { TokenPayload } from "~/models/requests/user.requests";
import Tweet from "~/models/schemas/Tweet.schemas";
import { TweetType } from "~/constants/enums";

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

export const getTweetChildrenController = async (req: Request<TweetReqParams>, res: Response) => {
  const { tweet_id } = req.params;
  const limit = Number(req.query.limit as string);
  const page = Number(req.query.page as string);
  const tweet_type = Number(req.query.tweet_type as string) as TweetType;
  const { tweets, total } = await tweetServices.getTweetChildren({
    tweetId: tweet_id,
    limit,
    page,
    tweet_type
  })
  res.json({
    message: TWEET_MESSAGES.FETCHED_SUCCESSFUL,
    result: {
      tweets,
      total: Math.ceil(total / limit)
    }
  });

  return;
}