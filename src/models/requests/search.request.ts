import { MediaQueryType } from "~/constants/enums";
import { PaginationReqQuery } from "./tweet.requests";

export interface SearchReqQuery extends PaginationReqQuery {
  query: string;
  user_id: string;
  media_type?: MediaQueryType;
}