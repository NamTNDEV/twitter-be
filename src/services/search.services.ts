import { ObjectId } from "mongodb";
import db from "~/configs/db.configs";
import { SearchReqQuery } from "~/models/requests/search.request";
import Tweet from "~/models/schemas/Tweet.schemas";

class SearchService {
  public async doSearch({ query, limit, page, user_id }: SearchReqQuery) {
    const searchPage = Number(page) || 1;
    const searchLimit = Number(limit) || 10;
    const searchNewFeedsPipeline = db.getSearchNewFeedPipeline({
      query,
      user_id,
      limit: searchLimit,
      page: searchPage
    });
    const searchCountNewFeedsPipeline = db.getSearchCountNewFeedPipeline({
      query,
      user_id
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