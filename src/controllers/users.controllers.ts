import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { MESSAGES } from '~/constants/messages';
import { ForgotPasswordReqBody, LogoutRequestBody, RegisterReqBody, TokenPayload, VerifyEmailBody, VerifyForgotPasswordTokenReqBody } from '~/models/requests/user.requests';
import { User } from '~/models/schemas/User.schemas';
import authService from '~/services/auth.services';
import userService from '~/services/users.services';


export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { _id: userId } = user;
  const { accessToken, refreshToken } = await userService.login((userId as ObjectId).toString());
  res.status(HTTP_STATUS.OK).json({ message: MESSAGES.LOGIN_SUCCESSFUL, data: { accessToken, refreshToken } });
  return;
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  const newUser = req.body;
  const createdUser = await userService.createUser(newUser);
  res.status(201).json({ message: MESSAGES.REGISTER_SUCCESSFUL, data: createdUser });
  return;
};

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body;
  await authService.deleteRefreshToken(refresh_token);
  res.status(HTTP_STATUS.OK).json({ message: MESSAGES.LOGOUT_SUCCESSFUL });
  return;
};

export const emailVerificationController = async (req: Request<ParamsDictionary, any, VerifyEmailBody>, res: Response) => {
  const { user_id } = req.decoded_email_token as TokenPayload;
  const user = await userService.getUserById(user_id);
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
    return;
  }
  if (!user.email_verify_token) {
    res.json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
    return;
  }

  const result = await userService.verifyEmail(user_id);
  res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMAIL_VERIFIED, result });
  return;
};

export const resendEmailVerificationController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await userService.getUserById(user_id);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
    return;
  }

  if (user.verify === UserVerifyStatus.Verified) {
    res.json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
    return;
  }

  const result = await userService.resendEmailVerification(user._id.toString());

  res.json({ message: MESSAGES.EMAIL_VERIFICATION_RESENT, result });
  return;
};

export const forgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response) => {
  const { _id } = req.user as User;
  const result = await userService.forgotPassword((_id as ObjectId).toString());

  res.json({ message: MESSAGES.EMAIL_VERIFICATION_RESENT, result });
  return;
}

export const verifyForgotPasswordTokenController = async (req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>, res: Response) => {
  res.json({ message: MESSAGES.FORGOT_PASSWORD_TOKEN_VERIFIED });
  return;
}