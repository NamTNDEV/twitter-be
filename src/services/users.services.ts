import db from "~/configs/db.configs";
import { RegisterReqBody, UpdateMeReqBody } from "~/models/requests/user.requests";
import { User } from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/crypto";
import authService from "./auth.services";
import { ObjectId } from "mongodb";
import emailService from "./email.services";
import { UserVerifyStatus } from "~/constants/enums";
import { ErrorWithStatus } from "~/models/Errors";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { MESSAGES } from "~/constants/messages";
import Follower from "~/models/schemas/Follower.schemas";

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
    const newUser = new User({
      ...user,
      _id: userId,
      password: hashPassword(user.password),
      date_of_birth: new Date(user.date_of_birth),
      email_verify_token: emailVerifyToken,
      username: user.email.split('@')[0] + userId.toString().slice(-4),
    });
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

  public async updateMe(userId: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload;
    const updatedUser = await db.getUserCollection().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth: Date }),
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      });

    return updatedUser;
  }

  public async getUserByUsername(username: string) {
    const user = await db.getUserCollection().findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    );

    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.USER_NOT_FOUND
      }
      )
    }

    return user;
  }

  public async isAlreadyFollowed(followerId: string, followeeId: string) {
    const isAlreadyFollowed = await db.getFollowersCollection().findOne({ userId: new ObjectId(followerId), followeeId: new ObjectId(followeeId) });
    return !!isAlreadyFollowed;
  }

  public async followUser(followerId: string, followeeId: string) {
    if (await this.isAlreadyFollowed(followerId, followeeId)) {
      return { message: MESSAGES.ALREADY_FOLLOWED };
    }
    await db.getFollowersCollection().insertOne(new Follower({
      userId: new ObjectId(followerId),
      followeeId: new ObjectId(followeeId)
    }));
    return { message: MESSAGES.FOLLOW_SUCCESSFUL };
  }

  public async unfollowUser(followerId: string, followeeId: string) {
    if (!await this.isAlreadyFollowed(followerId, followeeId)) {
      return { message: MESSAGES.NOT_FOLLOWED_YET };
    }
    await db.getFollowersCollection().deleteOne({ userId: new ObjectId(followerId), followeeId: new ObjectId(followeeId) });
    return { message: MESSAGES.UNFOLLOW_SUCCESSFUL };
  }
}

const userService = new UserService();
export default userService;