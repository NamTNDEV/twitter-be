import { ObjectId, WithId } from "mongodb";
import db from "~/configs/db.configs";
import { TweetType } from "~/constants/enums";
import { TweetReqBody } from "~/models/requests/tweet.requests";
import Hashtag from "~/models/schemas/Hashtag";
import Tweet from "~/models/schemas/Tweet.schemas";
import userService from "./users.services";

class TweetService {
  public async getTweetById(tweet_id: string, isWithAggregations?: boolean) {
    if (isWithAggregations) {
      const tweetAggregations = db.getTweetAggregationStagesById(tweet_id);
      const tweet = (await db.getTweetCollection().aggregate<Tweet>(tweetAggregations).toArray())[0];
      return tweet
    }
    const tweet = await db.getTweetCollection().findOne({ _id: new ObjectId(tweet_id) });
    return tweet;
  }

  public async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagsDocument = await Promise.all(
      hashtags.map((hashtag) => {
        return db.getHashtagCollection().findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          {
            upsert: true,
            returnDocument: "after"
          }
        );
      }))
    return hashtagsDocument.map(hashtag => (hashtag as WithId<Hashtag>)._id);
  }

  public async postTweet(user_id: string, tweetPayload: TweetReqBody) {
    const hashtags = await this.checkAndCreateHashtags(tweetPayload.hashtags || []);
    const newTweet = new Tweet({
      user_id: new ObjectId(user_id),
      type: tweetPayload.type,
      content: tweetPayload.content,
      audience: tweetPayload.audience,
      hashtags: hashtags,
      mentions: tweetPayload.mentions ? tweetPayload.mentions?.map(mention => new ObjectId(mention)) : [],
      medias: tweetPayload.medias,
      parent_tweet_id: tweetPayload.parent_tweet_id ? new ObjectId(tweetPayload.parent_tweet_id) : null,
    })

    const result = await db.getTweetCollection().insertOne(newTweet);

    return {
      message: "Tweet posted successfully",
      result: result
    }
  }

  async increaseView(tweetId: string, userId?: string) {
    const incValue = userId ? { user_views: 1 } : { guest_views: 1 };
    const result = await db.getTweetCollection().findOneAndUpdate(
      { _id: new ObjectId(tweetId) },
      {
        $inc: incValue,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: "after",
        projection: { user_views: 1, guest_views: 1, updated_at: 1 }
      }
    );

    return result as WithId<{
      user_views: number;
      guest_views: number;
      updated_at: Date;
    }>;
  }

  async getTweetChildren({ tweetId, tweet_type, page, limit, user_id }: { tweetId: string, page: number, limit: number, tweet_type: TweetType, user_id?: string }) {
    const tweetChildrenAgg = await db.getTweetChildrenAggregationStagesById({ id: tweetId, page, limit, type: tweet_type });
    const tweetChildrenResult = await db.getTweetCollection().aggregate<Tweet>(tweetChildrenAgg).toArray();
    const idsArr = tweetChildrenResult.map(tweet => tweet._id as ObjectId);
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const updatedViewsAt = new Date();
    const [totalChildren] = await Promise.all([
      await db.getTweetCollection().countDocuments({ parent_tweet_id: new ObjectId(tweetId), type: tweet_type }),
      await db.getTweetCollection().updateMany(
        {
          _id: {
            $in: idsArr
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: updatedViewsAt
          }
        }
      )
    ])
    tweetChildrenResult.forEach(tweet => {
      if (user_id) {
        tweet.user_views++;
      } else {
        tweet.guest_views++;
      }
      tweet.updated_at = updatedViewsAt;
    })
    return {
      total: totalChildren,
      tweets: tweetChildrenResult
    }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string, limit: number, page: number }) {
    const followeeList = await userService.getFolloweeByUserId(user_id);
    const followeeIds = followeeList.map(followee => followee._id) as ObjectId[];
    followeeIds.push(new ObjectId(user_id));
    const newFeedsPipeline = db.getNewFeedPipeline({
      followeeIds: followeeIds,
      page,
      limit,
      user_id
    });
    const countNewFeedsPipeline = db.countNewFeedPipeline({
      followeeIds: followeeIds,
      user_id
    });
    const [totalNewFeeds, newFeeds] = await Promise.all([
      await db.getTweetCollection().aggregate(countNewFeedsPipeline).toArray(),
      await db.getTweetCollection().aggregate<Tweet>(newFeedsPipeline).toArray()
    ]);
    const idsArr = newFeeds.map(tweet => tweet._id as ObjectId);
    const updatedViewsAt = new Date();
    await db.getTweetCollection().updateMany(
      {
        _id: {
          $in: idsArr
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: updatedViewsAt
        }
      }
    )
    newFeeds.forEach(tweet => {
      tweet.user_views++;
      tweet.updated_at = updatedViewsAt;
    })
    return {
      total: totalNewFeeds[0].total,
      tweets: newFeeds
    };
  }
}

export default new TweetService();