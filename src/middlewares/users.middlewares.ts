import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import { USER_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import userService from "~/services/users.services";
import { validate } from "~/utils/validation";

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required!" });
    return;
  }
  next();
}

export const registerValidation = validate(checkSchema({
  name: {
    trim: true,
    isString: {
      errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
    },
    notEmpty: {
      errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
    },
    isLength: {
      options: { min: 1, max: 50 },
      errorMessage: USER_MESSAGES.NAME_LENGTH
    }
  },
  email: {
    trim: true,
    isEmail: {
      errorMessage: USER_MESSAGES.EMAIL_INVALID
    },
    notEmpty: {
      errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
    },
    custom: {
      options: async (value, { req }) => {
        const { email } = req.body;
        const isEmailInUse = await userService.checkEmailIsInUse(email);
        if (isEmailInUse) {
          throw new Error(USER_MESSAGES.EMAIL_ALREADY_IN_USE);
        }
        return true;
      }
    }
  },
  password: {
    trim: true,
    isString: {
      errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    isLength: {
      options: { min: 6, max: 20 },
      errorMessage: USER_MESSAGES.PASSWORD_LENGTH
    },
    isStrongPassword: {
      errorMessage: USER_MESSAGES.PASSWORD_STRONG,
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }
    },
  },
  confirmPassword: {
    trim: true,
    isString: {
      errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
    },
    isLength: {
      options: { min: 6, max: 20 },
      errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH
    },
    // isStrongPassword: {
    //   errorMessage: "Confirm Password must be at least 6 characters long, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol.",
    //   options: {
    //     minLength: 6,
    //     minLowercase: 1,
    //     minUppercase: 1,
    //     minNumbers: 1,
    //     minSymbols: 1,
    //   }
    // },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(USER_MESSAGES.PASSWORDS_DO_NOT_MATCH);
        }
        return true;
      }
    }
  },
  // date_of_birth: {
  //   isISO8601: {
  //     options: { strict: true, strictSeparator: true }
  //   },
  //   // notEmpty: true
  // }
}))