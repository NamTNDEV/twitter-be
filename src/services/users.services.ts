import db from "~/configs/db.configs";
import { RegisterReqBody } from "~/models/requests/user.requests";
import { User } from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/crypto";
import authService from "./auth.services";
import { ObjectId } from "mongodb";
import emailService from "./email.services";
import { UserVerifyStatus } from "~/constants/enums";

class UserService {
  public async login(userId: string) {
    const [accessToken, refreshToken] = await authService.signPairOfJwtTokens(userId);
    await authService.saveRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  public async getUserById(userId: string) {
    const user = await db.getUserCollection().findOne({ _id: new ObjectId(userId) });
    return user;
  }

  public async createUser(user: RegisterReqBody) {
    const userId = new ObjectId();
    const emailVerifyToken = await emailService.signEmailVerifyToken(userId.toString());
    const newUser = new User({ ...user, _id: userId, password: hashPassword(user.password), date_of_birth: new Date(user.date_of_birth), email_verify_token: emailVerifyToken });
    await db.getUserCollection().insertOne(newUser);

    const [accessToken, refreshToken] = await authService.signPairOfJwtTokens(userId.toString());

    await authService.saveRefreshToken(userId.toString(), refreshToken);
    return {
      accessToken,
      refreshToken
    };
  }

  public async checkEmailIsInUse(email: string) {
    const user = await db.getUserCollection().findOne({ email });
    return !!user;
  }

  public async verifyEmail(userId: string) {
    const [pairOfTokens] = await Promise.all([
      await authService.signPairOfJwtTokens(userId),
      await db.getUserCollection().updateOne({ _id: new ObjectId(userId) }, { $set: { verify: UserVerifyStatus.Verified, email_verify_token: '', updated_at: new Date() } })
    ]);

    const [accessToken, refreshToken] = pairOfTokens;

    return {
      accessToken,
      refreshToken
    }
  }
}

const userService = new UserService();
export default userService;