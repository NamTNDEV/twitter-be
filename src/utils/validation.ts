import express from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { EntityValidationError, ErrorWithStatus } from '~/models/Errors';

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    const errorObjects = errors.mapped();
    const entityValidationError = new EntityValidationError({ errors: {} });
    for (const key in errorObjects) {
      const { msg } = errorObjects[key];
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg);
      }
      entityValidationError.errors[key] = errorObjects[key];
    }
    next(entityValidationError);
  };
};