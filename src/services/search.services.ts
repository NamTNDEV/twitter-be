import { ObjectId } from "mongodb";
import db from "~/configs/db.configs";
import { SearchReqQuery } from "~/models/requests/search.request";
import Tweet from "~/models/schemas/Tweet.schemas";

class SearchService {
  public async doSearch(user_id: string, { query, limit, page, media_type, pf }: SearchReqQuery) {
    const searchPage = Number(page) || 1;
    const searchLimit = Number(limit) || 10;
    let pf_ids: ObjectId[] = [];

    if (pf) {
      pf_ids.push(new ObjectId(user_id));
      pf_ids = await db.getFollowersCollection().find({ userId: new ObjectId(user_id) }).toArray().then(followers => {
        return followers.map(follower => follower.followeeId);
      });
    }

    const searchNewFeedsPipeline = db.getSearchNewFeedPipeline({
      query,
      user_id,
      limit: searchLimit,
      page: searchPage,
      media_type,
      pf_ids
    });
    const searchCountNewFeedsPipeline = db.getSearchCountNewFeedPipeline({
      query,
      user_id,
      media_type,
      pf_ids
    });
    const [searchResult, totalSearchResult] = await Promise.all([
      db.getTweetCollection().aggregate<Tweet>(searchNewFeedsPipeline).toArray(),
      db.getTweetCollection().aggregate(searchCountNewFeedsPipeline).toArray()
    ]);

    const idsArr = searchResult.map(tweet => tweet._id as ObjectId);
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
    searchResult.forEach(tweet => {
      tweet.user_views++;
      tweet.updated_at = updatedViewsAt;
    })

    return {
      total: totalSearchResult.length ? totalSearchResult[0].total : 0,
      tweets: searchResult
    };
  }
}

const searchService = new SearchService();
export default searchService;