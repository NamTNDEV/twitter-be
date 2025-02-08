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
import emailService from "~/services/email.services";

const passwordValidatorSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: MESSAGES.PASSWORD_MUST_BE_STRING
  },
  notEmpty: {
    errorMessage: MESSAGES.PASSWORD_IS_REQUIRED
  },
};

const confirmPasswordValidatorSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
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
        throw new Error(MESSAGES.PASSWORDS_DO_NOT_MATCH);
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
  name: {
    trim: true,
    isString: {
      errorMessage: MESSAGES.NAME_MUST_BE_STRING
    },
    notEmpty: {
      errorMessage: MESSAGES.NAME_IS_REQUIRED
    },
    isLength: {
      options: { min: 1, max: 50 },
      errorMessage: MESSAGES.NAME_LENGTH
    }
  },
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
