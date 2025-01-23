import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USER_MESSAGES } from '~/constants/messages';
import { RegisterReqBody } from '~/models/requests/user.requests';
import { User } from '~/models/schemas/User.schemas';
import authService from '~/services/auth.services';
import userService from '~/services/users.services';


export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { _id: userId } = user;
  const { accessToken, refreshToken } = await userService.login((userId as ObjectId).toString());
  await authService.saveRefreshToken((userId as ObjectId).toString(), refreshToken);
  res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.LOGIN_SUCCESSFUL, data: { accessToken, refreshToken } });
  return;
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  const newUser = req.body;
  const createdUser = await userService.createUser(newUser);
  res.status(201).json({ message: USER_MESSAGES.REGISTER_SUCCESSFUL, data: createdUser });
  return;
}