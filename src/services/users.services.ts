import db from "~/configs/db.configs";
import { RegisterReqBody } from "~/models/requests/user.requests";
import { User } from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/crypto";
import authService from "./auth.services";
import { ObjectId } from "mongodb";

class UserService {
  public async login(userId: string) {
    const [accessToken, refreshToken] = await authService.signPairOfJwtTokens(userId);
    await authService.saveRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  public async createUser(user: RegisterReqBody) {
    const newUser = new User({ ...user, password: hashPassword(user.password), date_of_birth: new Date(user.date_of_birth) });
    const result = await db.getUserCollection().insertOne(newUser);

    const userId = result.insertedId.toString();
    const [accessToken, refreshToken] = await authService.signPairOfJwtTokens(userId);
    await authService.saveRefreshToken(userId, refreshToken);

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