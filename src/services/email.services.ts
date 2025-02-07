import { config } from "dotenv";
import db from "~/configs/db.configs";
import { TokenTypes } from "~/constants/enums";
import { signToken } from "~/utils/jwt";

config();

class EmailService {
  public async signEmailVerifyToken(userId: string): Promise<string> {
    return await signToken({
      payload: {
        user_id: userId,
        token_type: TokenTypes.EmailVerifyToken
      },
      privateKey: process.env.EMAIL_TOKEN_PRIVATE_KEY as string,
      options: {
        expiresIn: process.env.EMAIL_TOKEN_EXPIRE
      }
    });
  }

  public async checkEmailVerifyTokenIsExist(refreshToken: string) {
    return await db.getEmailVerifyTokenCollection().findOne({ token: refreshToken });
  }
}

const emailService = new EmailService();
export default emailService;