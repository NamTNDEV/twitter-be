import { PaginationReqQuery } from "./tweet.requests";

export interface SearchReqQuery extends PaginationReqQuery {
  query: string;
  user_id: string;
}