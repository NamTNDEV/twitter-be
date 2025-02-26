import { config } from "dotenv";
import { ObjectId } from "mongodb";
import db from "~/configs/db.configs";
import { TokenTypes, UserVerifyStatus } from "~/constants/enums";
import RefreshToken from "~/models/schemas/RefreshToken.schemas";
import { signToken, verifyToken } from "~/utils/jwt";
import { Request } from "express";
import { ErrorWithStatus } from "~/models/Errors";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { MESSAGES } from "~/constants/messages";
import { capitalize } from "lodash";
import { JsonWebTokenError } from "jsonwebtoken";
import envConfig from "~/constants/config";

class AuthService {
  public async signForgotPasswordToken({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.ForgotPasswordToken,
        verify_status: verifyStatus
      },
      privateKey: envConfig.security.PASSWORD_FORGOT_TOKEN.PRIVATE_KEY as string,
      options: {
        expiresIn: envConfig.security.PASSWORD_FORGOT_TOKEN.EXPIRE
      }
    });
  }

  public async signAccessToken({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.AccessToken,
        verify_status: verifyStatus
      },
      privateKey: envConfig.jwt.ACCESS_TOKEN.PRIVATE_KEY as string,
      options: {
        expiresIn: envConfig.jwt.ACCESS_TOKEN.EXPIRE
      }
    });
  }

  public async signRefreshToken({ userId, verifyStatus, exp }: { userId: string, verifyStatus: UserVerifyStatus, exp?: number }): Promise<string> {
    if (exp) {
      return await signToken({
        payload: {
          user_id: userId,
          token_type: TokenTypes.RefreshToken,
          verify_status: verifyStatus,
          exp
        },
        privateKey: envConfig.jwt.REFRESH_TOKEN.PRIVATE_KEY as string,
      });
    }
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.RefreshToken,
        verify_status: verifyStatus
      },
      privateKey: envConfig.jwt.REFRESH_TOKEN.PRIVATE_KEY as string,
      options: {
        expiresIn: envConfig.jwt.REFRESH_TOKEN.EXPIRE
      }
    });
  }

  public signPairOfJwtTokens({ userId, verifyStatus, exp }: { userId: string, verifyStatus: UserVerifyStatus, exp?: number }) {
    return Promise.all([this.signAccessToken({ userId, verifyStatus }), this.signRefreshToken({ userId, verifyStatus, exp })]);
  }

  public async saveRefreshToken(userId: string, refreshToken: string, exp: number, iat: number) {
    await db.getRefreshTokenCollection().insertOne(new RefreshToken({
      userId: new ObjectId(userId),
      token: refreshToken,
      exp: exp,
      iat: iat
    }))
  }

  public async checkRefreshTokenIsExist(refreshToken: string) {
    return await db.getRefreshTokenCollection().findOne({ token: refreshToken });
  }

  public async deleteRefreshToken(refreshToken: string) {
    return await db.getRefreshTokenCollection().deleteOne({ token: refreshToken });
  }

  public async verifyAccessToken(accessToken: string, req?: Request) {
    if (!accessToken) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.ACCESS_TOKEN_IS_REQUIRED });
    }
    try {
      const decoded_authorization = await verifyToken({ token: accessToken, publicOrSecretKey: envConfig.jwt.ACCESS_TOKEN.PRIVATE_KEY as string });
      if (req) {
        (req as Request).decoded_authorization = decoded_authorization;
        return true;
      }
      return decoded_authorization;
    } catch (error) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: capitalize((error as JsonWebTokenError).message) });
    }
  }
}

const authService = new AuthService();
export default authService;