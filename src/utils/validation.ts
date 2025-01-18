import express from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.mapped() });
      return;
    }
    next();
  };
};