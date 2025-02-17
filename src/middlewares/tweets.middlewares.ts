import { checkSchema } from "express-validator"
import { has, isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType } from "~/constants/enums"
import { TWEET_MESSAGES } from "~/constants/messages"
import { TweetReqBody } from "~/models/requests/tweet.requests"
import { transEnumToNumber } from "~/utils/commons"
import { validate } from "~/utils/validation"

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
            console.log(":::1:::")
            throw new Error(TWEET_MESSAGES.PARENT_TWEET_ID_INVALID)
          } else if (type === TweetType.Tweet && value !== null) {
            console.log(":::2:::")
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