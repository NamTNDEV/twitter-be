import { Request, Response, NextFunction } from 'express';
import { checkSchema, ParamSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize } from "lodash";
import db from "~/configs/db.configs";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import authService from "~/services/auth.services";
import userService from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";
import { Request as RequestExpress } from "express";
import { UserVerifyStatus } from '~/constants/enums';
import { TokenPayload } from '~/models/requests/user.requests';
import { ObjectId } from 'mongodb';
import { REGEX_USERNAME } from '~/constants/regex';

const passwordValidatorSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: MESSAGES.PASSWORD_MUST_BE_STRING
  },
  notEmpty: {
    errorMessage: MESSAGES.PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: { min: 6, max: 20 },
    errorMessage: MESSAGES.CONFIRM_PASSWORD_LENGTH
  },
  // isStrongPassword: {
  //   errorMessage: "Password must be at least 6 characters long, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol.",
  //   options: {
  //     minLength: 6,
  //     minLowercase: 1,
  //     minUppercase: 1,
  //     minNumbers: 1,
  //     minSymbols: 1,
  //   }
  // },
};

const confirmPasswordValidatorSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
  },
  notEmpty: {
    errorMessage: MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: { min: 6, max: 20 },
    errorMessage: MESSAGES.CONFIRM_PASSWORD_LENGTH
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
        throw new Error(MESSAGES.CONFIRM_PASSWORD_IS_NOT_MATCHED);
      }
      return true;
    }
  }
}

const forgotPasswordTokenValidatorSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED });
      }
      try {
        const decoded_forgot_password_token = await verifyToken({ token: value, publicOrSecretKey: process.env.PASSWORD_FORGOT_TOKEN_PRIVATE_KEY as string });
        const { user_id } = decoded_forgot_password_token;
        const user = await userService.getUserById(user_id);
        if (!user) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND });
        }

        if (value !== user.forgot_password_token) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID });
        }

        req.decoded_forgot_password_token = decoded_forgot_password_token;

      } catch (error) {
        throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: capitalize((error as JsonWebTokenError).message) });
      }
      return true;
    }
  }
}

const nameValidatorSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: MESSAGES.NAME_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: { min: 1, max: 50 },
    errorMessage: MESSAGES.NAME_LENGTH
  }
}

const dateOfBirthValidatorSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: MESSAGES.DATE_OF_BIRTH_INVALID
  }
}

const imageUrlValidatorSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400,
    },
    errorMessage: MESSAGES.IMAGE_URL_LENGTH
  }
}

const followeeIdValidatorSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: MESSAGES.FOLLOWEE_ID_IS_REQUIRED
  },
  isString: {
    errorMessage: MESSAGES.FOLLOWEE_ID_MUST_BE_A_STRING
  },
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.FOLLOWEE_ID_INVALID });
      }

      const followee = await userService.getUserById(value);

      if (!followee) {
        throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND });
      }

      return true;
    }
  }
}

export const loginValidation = validate(
  checkSchema({
    email: {
      trim: true,
      isEmail: {
        errorMessage: MESSAGES.EMAIL_INVALID
      },
      notEmpty: {
        errorMessage: MESSAGES.EMAIL_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const { email, password } = req.body;
          const user = await db.getUserCollection().findOne({ email, password: hashPassword(password) });
          if (!user) {
            throw new Error(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT);
          }

          req.user = user;
          return true;
        }
      }
    },
    password: passwordValidatorSchema
  }, ['body']));

export const registerValidation = validate(checkSchema({
  name: nameValidatorSchema,
  email: {
    trim: true,
    isEmail: {
      errorMessage: MESSAGES.EMAIL_INVALID
    },
    notEmpty: {
      errorMessage: MESSAGES.EMAIL_IS_REQUIRED
    },
    custom: {
      options: async (value, { req }) => {
        const { email } = req.body;
        const isEmailInUse = await userService.checkEmailIsInUse(email);
        if (isEmailInUse) {
          throw new Error(MESSAGES.EMAIL_ALREADY_IN_USE);
        }
        return true;
      }
    }
  },
  password: passwordValidatorSchema,
  confirmPassword: confirmPasswordValidatorSchema,
  // date_of_birth: {
  //   isISO8601: {
  //     options: { strict: true, strictSeparator: true }
  //   },
  //   // notEmpty: true
  // }
}, ['body']))

export const accessTokenValidation = validate(checkSchema({
  Authorization: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        const accessToken = (value || "").split(" ")[1];
        if (!accessToken) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.ACCESS_TOKEN_IS_REQUIRED });
        }
        try {
          const decoded_authorization = await verifyToken({ token: accessToken, publicOrSecretKey: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string });
          (req as RequestExpress).decoded_authorization = decoded_authorization;
        } catch (error) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: capitalize((error as JsonWebTokenError).message) });
        }
        return true;
      }
    }
  }
}, ['headers']));

export const refreshTokenValidation = validate(checkSchema({
  refresh_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.REFRESH_TOKEN_IS_REQUIRED });
        }
        try {
          const [decoded_refresh_token, refresh_token] = await Promise.all(
            [verifyToken({ token: value, publicOrSecretKey: process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string }), authService.checkRefreshTokenIsExist(value)]
          );
          if (!refresh_token) {
            throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.REFRESH_TOKEN_NOT_FOUND });
          }
          (req as RequestExpress).decoded_refresh_token = decoded_refresh_token;
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: capitalize(error.message) });
          }

          throw error;
        }
        return true;
      }
    }
  }
}, ['body']));

export const emailVerifyTokenValidation = validate(checkSchema({
  email_verify_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.EMAIL_TOKEN_IS_REQUIRED });
        }
        try {
          const decoded_email_token = await verifyToken({ token: value, publicOrSecretKey: process.env.EMAIL_TOKEN_PRIVATE_KEY as string });
          (req as RequestExpress).decoded_email_token = decoded_email_token;
        } catch (error) {
          throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: capitalize((error as JsonWebTokenError).message) });
        }
        return true;
      }
    }
  }
}, ['body']));

export const forgotPasswordValidation = validate(checkSchema({
  email: {
    trim: true,
    isEmail: {
      errorMessage: MESSAGES.EMAIL_INVALID
    },
    notEmpty: {
      errorMessage: MESSAGES.EMAIL_IS_REQUIRED
    },
    custom: {
      options: async (value, { req }) => {
        const user = await userService.getUserByEmail(value);
        if (!user) {
          throw new Error(MESSAGES.EMAIL_IS_NOT_FOUND);
        }

        req.user = user;
        return true;
      }
    }
  }
}, ['body']));

export const verifyForgotPasswordTokenValidation = validate(checkSchema({
  forgot_password_token: forgotPasswordTokenValidatorSchema
}, ['body']));

export const resetPasswordValidation = validate(checkSchema({
  password: passwordValidatorSchema,
  confirmPassword: confirmPasswordValidatorSchema,
  forgot_password_token: forgotPasswordTokenValidatorSchema
}, ['body']));

export const verifiedUserValidation = (req: Request, res: Response, next: NextFunction) => {
  const { verify_status } = req.decoded_authorization as TokenPayload;
  if (verify_status !== UserVerifyStatus.Verified) {
    next(
      res.status(HTTP_STATUS.FORBIDDEN).json({ message: MESSAGES.USER_NOT_VERIFIED })
    )
    return;
  }
  next();
}

export const updateMeValidation = validate(checkSchema({
  name: {
    ...nameValidatorSchema,
    optional: true,
    notEmpty: undefined
  },
  date_of_birth: {
    ...dateOfBirthValidatorSchema,
    optional: true,
  },
  bio: {
    optional: true,
    isString: {
      errorMessage: MESSAGES.BIO_MUST_BE_STRING
    },
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 500,
      },
      errorMessage: MESSAGES.BIO_LENGTH
    }
  },
  location: {
    optional: true,
    trim: true,
    isString: {
      errorMessage: MESSAGES.LOCATION_MUST_BE_STRING
    },
    isLength: {
      options: {
        min: 1,
        max: 50,
      },
      errorMessage: MESSAGES.LOCATION_LENGTH
    }
  },
  website: {
    optional: true,
    trim: true,
    isString: {
      errorMessage: MESSAGES.WEBSITE_INVALID
    },
    isLength: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: MESSAGES.WEBSITE_LENGTH
    }
  },
  username: {
    optional: true,
    trim: true,
    isString: {
      errorMessage: MESSAGES.USERNAME_MUST_BE_A_STRING
    },
    custom: {
      options: async (value: string, { req }) => {
        if (!REGEX_USERNAME.test(value)) {
          throw new Error(MESSAGES.USERNAME_INVALID);
        }

        const user = await userService.getUserByUsername(value);
        if (user) {
          throw new Error(MESSAGES.USERNAME_ALREADY_IN_USE);
        }
      }
    }
  },
  avatar: imageUrlValidatorSchema,
  cover_photo: imageUrlValidatorSchema
}, ['body']));

export const followValidation = validate(checkSchema({
  followee_id: followeeIdValidatorSchema
}, ['body']));

export const unfollowValidation = validate(checkSchema({
  followee_id: followeeIdValidatorSchema
}, ['params']));

export const changePasswordValidation = validate(checkSchema({
  old_password: {
    notEmpty: {
      errorMessage: MESSAGES.OLD_PASSWORD_IS_REQUIRED
    },
    isString: {
      errorMessage: MESSAGES.OLD_PASSWORD_MUST_BE_STRING
    },
    trim: true,
    custom: {
      options: async (value, { req }) => {
        const { user_id } = req.decoded_authorization as TokenPayload;
        const user = await userService.getUserById(user_id);
        if (!user) {
          throw new Error(MESSAGES.USER_NOT_FOUND);
        }
        if (user.password !== hashPassword(value)) {
          throw new Error(MESSAGES.OLD_PASSWORD_IS_NOT_MATCHED);
        }
        return true;
      }
    }
  },
  password: {
    ...passwordValidatorSchema,
    custom: {
      options: async (value, { req }) => {
        const { old_password } = req.body;
        if (value === old_password) {
          throw new Error(MESSAGES.NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD);
        }
        return true
      }
    }
  },
  confirm_password: confirmPasswordValidatorSchema
}, ['body']));

export const isLoggedInUserValidation = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isUserLoggedIn = req.headers.authorization;
    if (isUserLoggedIn) {
      console.log("User is logged in :: :", isUserLoggedIn);
      middleware(req, res, next);
      return;
    }

    console.log("User is not logged in :: :", isUserLoggedIn);
    next();
  }
};