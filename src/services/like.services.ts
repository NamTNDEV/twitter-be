import { WithId } from "mongodb";
import db from "~/configs/db.configs";
import Like from "~/models/schemas/Like.schemas";

class LikeService {
  public async likeTweet(user_id: string, tweet_id: string) {
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