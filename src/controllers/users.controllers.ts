import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { MESSAGES } from '~/constants/messages';
import { FollowReqBody, ForgotPasswordReqBody, GetProfileReqParams, LogoutRequestBody, RegisterReqBody, ResetPasswordReqBody, TokenPayload, UnfollowReqParams, VerifyEmailBody, VerifyForgotPasswordTokenReqBody } from '~/models/requests/user.requests';
import { User } from '~/models/schemas/User.schemas';
import authService from '~/services/auth.services';
import userService from '~/services/users.services';


export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { _id: userId, verify } = user;
  console.log("User::: ", user);
  const { accessToken, refreshToken } = await userService.login({ userId: (userId as ObjectId).toString(), verifyStatus: verify });
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
  const { _id, verify } = req.user as User;
  const result = await userService.forgotPassword({ userId: (_id as ObjectId).toString(), verifyStatus: verify });
  res.json({ message: MESSAGES.EMAIL_VERIFICATION_RESENT, result });
  return;
}

export const verifyForgotPasswordTokenController = async (req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>, res: Response) => {
  res.json({ message: MESSAGES.FORGOT_PASSWORD_TOKEN_VERIFIED });
  return;
}

export const resetPasswordController = async (req: Request<ParamsDictionary, any, ResetPasswordReqBody>, res: Response) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload;
  const { password } = req.body;
  await userService.resetPassword(user_id, password);
  res.json({ message: MESSAGES.RESET_PASSWORD_SUCCESSFUL });
  return;
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await userService.getUserById(user_id, { password: 0, email_verify_token: 0, forgot_password_token: 0 });
  res.json({ message: MESSAGES.GET_ME_SUCCESSFUL, result: user });
  return;
}

export const updateMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body } = req;
  const result = await userService.updateMe(user_id, body);
  res.json({ message: MESSAGES.UPDATE_ME_SUCCESSFUL, result });
  return;
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params;
  const user = await userService.getUserByUsername(username);
  res.json({ message: MESSAGES.GET_PROFILE_SUCCESSFUL, result: user });
  return;
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { followee_id } = req.body;
  const result = await userService.followUser(user_id, followee_id);
  res.json({ message: result.message });
  return;
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { followee_id } = req.params;
  const result = await userService.unfollowUser(user_id, followee_id);
  res.json({ message: result.message });
  return;
}