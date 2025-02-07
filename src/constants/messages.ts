export const MESSAGES = {
  VALIDATION_ERROR: "Validation error!",

  NAME_IS_REQUIRED: "Name is required!",
  NAME_MUST_BE_STRING: "Name must be a string!",
  NAME_LENGTH: "Name must be between 1 and 50 characters long!",

  EMAIL_INVALID: "Invalid email!",
  EMAIL_IS_REQUIRED: "Email is required!",
  EMAIL_ALREADY_IN_USE: "Email is already in use!",

  PASSWORD_INVALID: "Invalid password!",
  PASSWORD_IS_REQUIRED: "Password is required!",
  PASSWORD_MUST_BE_STRING: "Password must be a string!",
  PASSWORD_LENGTH: "Password must be between 6 and 20 characters long!",
  PASSWORD_STRONG: "Password must be at least 6 characters long, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol!",

  PASSWORDS_DO_NOT_MATCH: "Passwords do not match!",
  CONFIRM_PASSWORD_INVALID: "Invalid confirm password!",
  CONFIRM_PASSWORD_IS_REQUIRED: "Confirm password is required!",
  CONFIRM_PASSWORD_MUST_BE_STRING: "Confirm password must be a string!",
  CONFIRM_PASSWORD_LENGTH: "Confirm password must be between 6 and 20 characters long!",

  USER_NOT_FOUND: "User not found!",
  EMAIL_OR_PASSWORD_INCORRECT: "Email or Password is incorrect!",
  EMAIL_IS_NOT_FOUND: "Email is not found!",

  LOGIN_SUCCESSFUL: "Login successful!",
  REGISTER_SUCCESSFUL: "User registered successfully!",

  ACCESS_TOKEN_INVALID: "Invalid access token!",
  ACCESS_TOKEN_IS_REQUIRED: "Access token is required!",
  REFRESH_TOKEN_INVALID: "Invalid refresh token!",
  REFRESH_TOKEN_IS_REQUIRED: "Refresh token is required!",
  REFRESH_TOKEN_NOT_FOUND: "Refresh token not found!",

  LOGOUT_SUCCESSFUL: "Logout successful!",

  EMAIL_TOKEN_IS_REQUIRED: "Email token is required!",
  EMAIL_ALREADY_VERIFIED: "Email is already verified!",
  EMAIL_VERIFIED: "Email verified successfully!",
  EMAIL_VERIFICATION_RESENT: "Email verification resent successfully!",

} as const;