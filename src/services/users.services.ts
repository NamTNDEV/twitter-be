import db from "~/configs/db.configs";
import { TokenTypes } from "~/constants/enums";
import { RegisterReqBody } from "~/models/requests/user.requests";
import { User } from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";

class UserService {
  private async signAccessToken(userId: string) {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE
      }
    });
  }

  private async signRefreshToken(userId: string) {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE
      }
    });
  }

  public async createUser(user: RegisterReqBody) {
    const newUser = new User({ ...user, password: hashPassword(user.password), date_of_birth: new Date(user.date_of_birth) });
    const result = await db.getUserCollection().insertOne(newUser);

    const userId = result.insertedId.toString();
    const [accessToken, refreshToken] = await Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)]);

    return {
      user_id: userId,
      accessToken,
      refreshToken
    };
  }

  public async checkEmailIsInUse(email: string) {
    const user = await db.getUserCollection().findOne({ email });
    return !!user;
  }
}

const userService = new UserService();
export default userService;