import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { HTTP_STATUS } from '~/constants/httpStatus';
import { LIKE_MESSAGES } from '~/constants/messages';
import { LikeReqBody } from '~/models/requests/like.request';
import { TokenPayload } from '~/models/requests/user.requests';
import likeService from '~/services/like.services';

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { tweet_id } = req.body;
  const result = await likeService.likeTweet(user_id, tweet_id);
  res.json({
    message: LIKE_MESSAGES.LIKE_CREATED,
    result: result,
  });
  return;
}