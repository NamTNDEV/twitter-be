import { ObjectId, WithId } from "mongodb";
import db from "~/configs/db.configs";
import { TweetReqBody } from "~/models/requests/tweet.requests";
import Hashtag from "~/models/schemas/Hashtag";
import Tweet from "~/models/schemas/Tweet.schemas";

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
        $inc: incValue
      },
      {
        returnDocument: "after",
        projection: { user_views: 1, guest_views: 1 }
      }
    );

    return result as WithId<{
      user_views: number;
      guest_views: number;
    }>;
  }
}

export default new TweetService();