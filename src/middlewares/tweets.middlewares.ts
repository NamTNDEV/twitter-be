import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums"
import { HTTP_STATUS } from "~/constants/httpStatus"
import { BOOKMARK_MESSAGES, LIKE_MESSAGES, MESSAGES, TWEET_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/Errors"
import { TweetReqBody } from "~/models/requests/tweet.requests"
import bookmarkService from "~/services/bookmark.services"
import likeService from "~/services/like.services"
import tweetServices from "~/services/tweet.services"
import { transEnumToNumber } from "~/utils/commons"
import { validate } from "~/utils/validation"
import { Request, Response, NextFunction } from "express"
import { wrapRequestHandler } from "~/utils/handlers"
import { TokenPayload } from "~/models/requests/user.requests"
import db from "~/configs/db.configs"
import Tweet from "~/models/schemas/Tweet.schemas"

export const postTweetValidation = validate(
  checkSchema({
    type: {
      notEmpty: {
        errorMessage: TWEET_MESSAGES.TYPE_IS_REQUIRED
      },
      isIn: {
        options: [transEnumToNumber(TweetType)],
        errorMessage: TWEET_MESSAGES.TYPE_INVALID
      },
    },
    audience: {
      notEmpty: {
        errorMessage: TWEET_MESSAGES.AUDIENCE_IS_REQUIRED
      },
      isIn: {
        options: [transEnumToNumber(TweetAudience)],
        errorMessage: TWEET_MESSAGES.AUDIENCE_INVALID
      }
    },
    parent_tweet_id: {
      custom: {
        options: (value, { req }) => {
          const { type } = req.body as TweetReqBody
          if ([TweetType.Retweet, TweetType.QuoteTweet, TweetType.Comment].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEET_MESSAGES.PARENT_TWEET_ID_INVALID)
          } else if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEET_MESSAGES.PARENT_TWEET_ID_MUST_BE_NULL)
          }
          return true;
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const { type, hashtags, mentions } = req.body as TweetReqBody
          if ([TweetType.Tweet, TweetType.QuoteTweet, TweetType.Comment].includes(type) && isEmpty(hashtags) && isEmpty(mentions) && !value) {
            throw new Error(TWEET_MESSAGES.CONTENT_IS_REQUIRED)
          } else if (type === TweetType.Retweet && value) {
            throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_NULL)
          }
          return true;
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value) => {
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEET_MESSAGES.HASHTAGS_INVALID)
          }
          return true;
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value) => {
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEET_MESSAGES.MENTIONS_INVALID)
          }
          return true;
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value) => {
          if (value.some((item: any) => {
            return typeof item.url !== 'string' || !transEnumToNumber(MediaType).includes(item.type)
          })) {
            throw new Error(TWEET_MESSAGES.MEDIAS_INVALID)
          }
          return true;
        }
      }
    }
  }, ['body'])
);

export const tweetIdValidation = validate(
  checkSchema({
    tweet_id: {
      notEmpty: {
        errorMessage: TWEET_MESSAGES.TWEET_ID_IS_REQUIRED,
      },
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: TWEET_MESSAGES.TWEET_ID_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          const tweet = await tweetServices.getTweetById(value, true)
          if (!tweet) {
            throw new ErrorWithStatus({
              message: TWEET_MESSAGES.TWEET_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          (req as Request).tweet = tweet
          return true
        }
      }
    }
  }, ['params', 'body'])
);

export const bookmarkIdValidation = validate(
  checkSchema({
    bookmark_id: {
      notEmpty: {
        errorMessage: BOOKMARK_MESSAGES.BOOKMARK_ID_IS_REQUIRED,
      },
      custom: {
        options: async (value) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: BOOKMARK_MESSAGES.BOOKMARK_ID_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          const isBookmarkExist = await bookmarkService.getBookmarkById(value)
          if (!isBookmarkExist) {
            throw new ErrorWithStatus({
              message: BOOKMARK_MESSAGES.BOOKMARK_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  }, ['params'])
);

export const likeIdValidation = validate(
  checkSchema({
    like_id: {
      notEmpty: {
        errorMessage: LIKE_MESSAGES.LIKE_ID_IS_REQUIRED,
      },
      custom: {
        options: async (value) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: LIKE_MESSAGES.LIKE_ID_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          const isLikeExist = await likeService.getLikeById(value)
          if (!isLikeExist) {
            throw new ErrorWithStatus({
              message: LIKE_MESSAGES.LIKE_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  }, ['params'])
);

export const audienceValidation = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.Followers) {

    const { user_id } = req.decoded_authorization as TokenPayload
    if (!user_id) {
      throw new ErrorWithStatus({
        message: MESSAGES.UNAUTHORIZED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const author = await db.getUserCollection().findOne({ _id: tweet.user_id })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isInTweetCircle = author.twitter_circle?.some(
      (user_circle_id) => user_circle_id.equals(user_id)
    )

    if (!author._id.equals(user_id) && !isInTweetCircle) {
      throw new ErrorWithStatus({
        message: TWEET_MESSAGES.TWEET_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema({
    tweet_type: {
      isIn: {
        options: [transEnumToNumber(TweetType)],
        errorMessage: TWEET_MESSAGES.TYPE_INVALID
      }
    },
    limit: {
      isNumeric: true,
      custom: {
        options: (value) => {
          const limit = Number(value);
          if (limit < 1 || limit > 100) {
            throw new Error(TWEET_MESSAGES.LIMIT_INVALID)
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: (value) => {
          const page = Number(value);
          if (page < 1) {
            throw new Error(TWEET_MESSAGES.PAGE_INVALID)
          }
          return true
        }
      }
    }
  }, ['query']))