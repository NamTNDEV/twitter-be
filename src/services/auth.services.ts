import { config } from "dotenv";
import db from "~/configs/db.configs";
import { TokenTypes } from "~/constants/enums";
import RefreshToken from "~/models/schemas/RefreshToken.schemas";
import { signToken } from "~/utils/jwt";

config();
class AuthService {
  public async signAccessToken(userId: string): Promise<string> {

    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.AccessToken
      },
      privateKey: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string,
      options: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE
      }
    });
  }

  public async signRefreshToken(userId: string): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.RefreshToken
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE
      }
    });
  }

  public signPairOfJwtTokens(userId: string) {
    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)]);
  }

  public async saveRefreshToken(userId: string, refreshToken: string) {
    await db.getRefreshTokenCollection().insertOne(new RefreshToken({
      userId,
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