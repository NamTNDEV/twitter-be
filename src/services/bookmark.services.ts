import { WithId } from "mongodb";
import db from "~/configs/db.configs";
import Bookmark from "~/models/schemas/Bookmark.schemas";

class BookmarkService {
  public async bookmarkTweet(user_id: string, tweet_id: string) {
    const bookmarkResult = await db.getBookmarkCollection().findOneAndUpdate(
      {
        user_id,
        tweet_id,
      },
      {
        $setOnInsert: new Bookmark({
          user_id,
          tweet_id,
        })
      },
      {
        upsert: true,
        returnDocument: 'after',
      })
    return bookmarkResult as WithId<Bookmark>;
  }
}

const bookmarkService = new BookmarkService();
export default bookmarkService;