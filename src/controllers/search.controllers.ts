import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { SEARCH_MESSAGES } from '~/constants/messages';
import { SearchReqQuery } from '~/models/requests/search.request';
import { TokenPayload } from '~/models/requests/user.requests';
import searchService from '~/services/search.services';

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchReqQuery>, res: Response) => {
  const { query, limit, page, media_type } = req.query;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const searchResult = await searchService.doSearch({ query, limit, page, user_id, media_type });
  res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFUL,
    result: {
      total_page: Math.ceil(searchResult.total / Number(limit)),
      tweets: searchResult.tweets,
      limit: Number(limit),
      page: Number(page)
    }
  });
  return;
}