import db from "~/configs/db.configs";
import { RegisterReqBody } from "~/models/requests/user.requests";
import { User } from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/crypto";
import authService from "./auth.services";
import { ObjectId } from "mongodb";
import emailService from "./email.services";
import { UserVerifyStatus } from "~/constants/enums";

class UserService {
  public async login({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await authService.signPairOfJwtTokens({ userId, verifyStatus });
    await authService.saveRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  public async getUserById(userId: string, customProjection?: any) {
    const user = await db.getUserCollection().findOne({ _id: new ObjectId(userId) }, { projection: customProjection });
    return user;
  }

  public async getUserByEmail(email: string) {
    const user = await db.getUserCollection().findOne({ email });
    return user;
  }

  public async createUser(user: RegisterReqBody) {
    const userId = new ObjectId();
    const emailVerifyToken = await emailService.signEmailVerifyToken({
      userId: userId.toString(),
      verifyStatus: UserVerifyStatus.Unverified
    });
    const newUser = new User({ ...user, _id: userId, password: hashPassword(user.password), date_of_birth: new Date(user.date_of_birth), email_verify_token: emailVerifyToken });
    await db.getUserCollection().insertOne(newUser);

    const [accessToken, refreshToken] = await authService.signPairOfJwtTokens(
      {
        userId: userId.toString(),
        verifyStatus: UserVerifyStatus.Unverified
      }
    );

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
      await authService.signPairOfJwtTokens({ userId, verifyStatus: UserVerifyStatus.Verified }),
      await db.getUserCollection().updateOne({ _id: new ObjectId(userId) },
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            // updated_at: new Date()
          },
          $currentDate: {
            updated_at: true
          }
        }
        // ,

        //Cách 2: Sử dụng $$NOW để lấy thời gian hiện tại của MongoDB
        //   [
        //     {
        //       $set: {
        //         verify: UserVerifyStatus.Verified,
        //         email_verify_token: '',
        //         updated_at: '$$NOW'
        //       }
        //     },
        //     // {
        //     //   $currentDate: {
        //     //     updated_at: true
        //     //   }
        //     // }
        //   ]
      )
    ]);

    const [accessToken, refreshToken] = pairOfTokens;

    return {
      accessToken,
      refreshToken
    }
  }

  public async resendEmailVerification(userId: string) {
    const emailVerifyToken = await emailService.signEmailVerifyToken({ userId, verifyStatus: UserVerifyStatus.Unverified });
    await db.getUserCollection().updateOne({ _id: new ObjectId(userId) }, {
      $set: {
        email_verify_token: emailVerifyToken,
        // updated_at: new Date()
      },
      $currentDate: {
        updated_at: true
      }
    });

    return { email_verify_token: emailVerifyToken };
  }

  public async forgotPassword({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }) {
    const forgotPasswordToken = await authService.signForgotPasswordToken({ userId, verifyStatus });
    await db.getUserCollection().updateOne({ _id: new ObjectId(userId) }, {
      $set: {
        forgot_password_token: forgotPasswordToken,
        // updated_at: new Date()
      },
      $currentDate: {
        updated_at: true
      }
    });

    return { forgot_password_token: forgotPasswordToken };
  }

  public async resetPassword(userId: string, password: string) {
    const newPassword = hashPassword(password);
    await db.getUserCollection().updateOne({ _id: new ObjectId(userId) }, {
      $set: {
        password: newPassword,
        forgot_password_token: '',
        // updated_at: new Date()
      },
      $currentDate: {
        updated_at: true
      }
    });
  }
}

const userService = new UserService();
export default userService;