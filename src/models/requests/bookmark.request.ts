import { ParamsDictionary } from "express-serve-static-core";

export interface BookmarkReqBody {
  tweet_id: string;
}

export interface BookmarkReqParams extends ParamsDictionary {
  bookmark_id: string;
}

