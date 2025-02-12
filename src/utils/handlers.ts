import { Request, Response, NextFunction, RequestHandler } from 'express';

export const wrapRequestHandler = <P>(fn: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};