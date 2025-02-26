import { config } from "dotenv";
import db from "~/configs/db.configs";
import envConfig from "~/constants/config";
import { TokenTypes, UserVerifyStatus } from "~/constants/enums";
import { signToken } from "~/utils/jwt";

class EmailService {
  public async signEmailVerifyToken({ userId, verifyStatus }: { userId: string, verifyStatus: UserVerifyStatus }): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.EmailVerifyToken,
        verify_status: verifyStatus
      },
      privateKey: envConfig.email.EMAIL_TOKEN.PRIVATE_KEY as string,
      options: {
        expiresIn: envConfig.email.EMAIL_TOKEN.EXPIRE
      }
    });
  }

  public async checkEmailVerifyTokenIsExist(refreshToken: string) {
    return await db.getEmailVerifyTokenCollection().findOne({ token: refreshToken });
  }
}

const emailService = new EmailService();
export default emailService;