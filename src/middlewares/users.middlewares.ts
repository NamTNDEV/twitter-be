import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
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
    isString: true,
    notEmpty: true,
    isLength: {
      options: { min: 1, max: 50 },
    }
  },
  email: {
    trim: true,
    isEmail: true,
    notEmpty: true,
  },
  password: {
    trim: true,
    isString: true,
    isLength: {
      options: { min: 6, max: 20 },
    },
    isStrongPassword: {
      errorMessage: "Password must be at least 6 characters long, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol.",
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }
    },
    custom: {
      options: async (value, { req }) => {
        const { email } = req.body;
        const isEmailInUse = await userService.checkEmailIsInUse(email);
        if (isEmailInUse) {
          throw new Error("Email is already in use!");
        }
        return true;
      }
    }
  },
  confirmPassword: {
    trim: true,
    isString: true,
    isLength: {
      options: { min: 6, max: 20 },
    },
    isStrongPassword: {
      errorMessage: "Confirm Password must be at least 6 characters long, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol.",
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match!");
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