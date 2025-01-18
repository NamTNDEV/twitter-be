import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/user.requests';
import userService from '~/services/users.services';

export const loginController = (req: Request, res: Response) => {
  res.json({ message: "Login successful!" });
  return;
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  const newUser = req.body;
  try {
    const createdUser = await userService.createUser(newUser);
    res.status(201).json({ message: "User created successfully!", data: createdUser });
    return
  } catch (error) {
    next(error);
  };
}