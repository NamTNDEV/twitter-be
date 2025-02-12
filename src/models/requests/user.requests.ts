import { JwtPayload } from "jsonwebtoken";
import { TokenTypes, UserVerifyStatus } from "~/constants/enums";

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
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}

export interface GetProfileReqParams {
  username: string;
}