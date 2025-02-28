import { ObjectId, WithId } from "mongodb";
import db from "~/configs/db.configs";
import Like from "~/models/schemas/Like.schemas";

class LikeService {
  public async getLikeById(like_id: string) {
    const like = await db.getLikeCollection().findOne({ _id: new ObjectId(like_id) });

    return like;
  }

  public async likeTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const likeResult = await db.getLikeCollection().findOneAndUpdate(
      {
        user_id,
        tweet_id,
      },
      {
        $setOnInsert: new Like({
          user_id,
          tweet_id,
        })
      },
      {
        upsert: true,
        returnDocument: 'after',
      })
    return likeResult as WithId<Like>;
  }
}

const likeService = new LikeService();
export default likeService;