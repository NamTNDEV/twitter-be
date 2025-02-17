import { MESSAGES, TWEET_MESSAGES } from "~/constants/messages"
import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetReqBody } from "~/models/requests/tweet.requests";

export const postTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const tweetPayload = req.body;
  res.json({
    message: TWEET_MESSAGES.TWEET_POSTED_SUCCESSFUL,
    result: tweetPayload
  });

  return;
}