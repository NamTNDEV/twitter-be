import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';

export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (error instanceof ErrorWithStatus) {
      res.status(error.status).json(omit(error, ['status']));
    }

    const finalErrors: any = {};
    Object.getOwnPropertyNames(error).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(error, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(error, key)?.writable
      ) {
        return;
      }
      finalErrors[key] = error[key]
    });

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalErrors.message,
      errorInfo: omit(finalErrors, ['stack'])
    })

  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(error as any, ['stack'])
    })
  }
};