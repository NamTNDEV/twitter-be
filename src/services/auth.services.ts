import { config } from "dotenv";
import { ObjectId } from "mongodb";
import db from "~/configs/db.configs";
import { TokenTypes, UserVerifyStatus } from "~/constants/enums";
import RefreshToken from "~/models/schemas/RefreshToken.schemas";
import { signToken } from "~/utils/jwt";

config();
class AuthService {
  public async signForgotPasswordToken({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.ForgotPasswordToken,
        verify_status: verifyStatus
      },
      privateKey: process.env.PASSWORD_FORGOT_TOKEN_PRIVATE_KEY as string,
      options: {
        expiresIn: process.env.PASSWORD_FORGOT_TOKEN_EXPIRE
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
      privateKey: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string,
      options: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE
      }
    });
  }

  public async signRefreshToken({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.RefreshToken,
        verify_status: verifyStatus
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE
      }
    });
  }

  public signPairOfJwtTokens({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ userId, verifyStatus }), this.signRefreshToken({ userId, verifyStatus })]);
  }

  public async saveRefreshToken(userId: string, refreshToken: string) {
    await db.getRefreshTokenCollection().insertOne(new RefreshToken({
      userId: new ObjectId(userId),
      token: refreshToken
    }))
  }

  public async checkRefreshTokenIsExist(refreshToken: string) {
    return await db.getRefreshTokenCollection().findOne({ token: refreshToken });
  }

  public async deleteRefreshToken(refreshToken: string) {
    return await db.getRefreshTokenCollection().deleteOne({ token: refreshToken });
  }
}

const authService = new AuthService();
export default authService;