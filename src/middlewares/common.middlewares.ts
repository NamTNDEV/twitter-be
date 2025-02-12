import { Request, Response, NextFunction } from "express";
import { pick } from "lodash";

type FilterKeyType<T> = Array<keyof T>;

export const filterMiddleware = <T>(filterKeys: FilterKeyType<T>) => (req: Request, res: Response, next: NextFunction) => {
  req.body = pick(req.body, filterKeys);
  next();
}