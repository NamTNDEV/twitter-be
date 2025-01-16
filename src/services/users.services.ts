import db from "~/configs/db.configs";
import { User, UserType } from "~/models/schemas/User.schemas";

class UserService {
  public async createUser(user: UserType) {
    const newUser = new User(user);
    const result = await db.getUserCollection().insertOne(newUser);
    return result;
  }

  public async checkEmailIsInUse(email: string) {
    const user = await db.getUserCollection().findOne({ email });
    return !!user;
  }
}

const userService = new UserService();
export default userService;