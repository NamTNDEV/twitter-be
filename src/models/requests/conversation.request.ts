import { ParamsDictionary, Query } from "express-serve-static-core";

export interface ConversationReqParams extends ParamsDictionary {
  ri_id: string;
}

export interface ConversationReqQuery extends Query {
  limit: string;
  page: string;
}