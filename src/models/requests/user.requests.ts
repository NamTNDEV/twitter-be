import { JwtPayload } from "jsonwebtoken";
import { TokenTypes, UserVerifyStatus } from "~/constants/enums";
import { ParamsDictionary } from "express-serve-static-core";

// Request Body Interfaces
export interface RegisterReqBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  date_of_birth: string;
}

export interface LogoutRequestBody {
  refresh_token: string;
}

export interface TokenPayload extends JwtPayload {
  user_id: string;
  token_type: TokenTypes;
  verify_status: UserVerifyStatus
}

export interface VerifyEmailBody {
  email_verify_token: string;
}

export interface ForgotPasswordReqBody {
  email: string;
}

export interface VerifyForgotPasswordTokenReqBody {
  forgot_password_token: string;
}

export interface ResetPasswordReqBody {
  password: string;
  confirmPassword: string;
  forgot_password_token: string;
}

export interface UpdateMeReqBody {
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}

export interface FollowReqBody {
  followee_id: string;
}

// Request Params Interfaces

export interface GetProfileReqParams extends ParamsDictionary {
  username: string;
}

export interface UnfollowReqParams extends ParamsDictionary {
  followee_id: string;
}

export interface ChangePasswordReqBody {
  old_password: string;
  password: string;
  confirm_password: string;
}