import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { HTTP_STATUS } from '~/constants/httpStatus';
import { BOOKMARK_MESSAGES } from '~/constants/messages';
import { BookmarkReqBody, BookmarkReqParams } from '~/models/requests/bookmark.request';
import { TokenPayload } from '~/models/requests/user.requests';
import bookmarkService from '~/services/bookmark.services';

export const bookmarkTweetController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { tweet_id } = req.body;
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id);
  res.status(HTTP_STATUS.CREATED).json({
    message: BOOKMARK_MESSAGES.BOOKMARK_CREATED,
    result: result,
  });
  return;
}

export const unBookmarkTweetController = async (req: Request<BookmarkReqParams>, res: Response) => {
  const { bookmark_id } = req.params;
  await bookmarkService.unBookmarkTweet(bookmark_id);
  res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_DELETED,
  });
  return;
}