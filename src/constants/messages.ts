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
  CONFIRM_PASSWORD_IS_NOT_MATCHED: "Confirm password is not matched!",

  OLD_PASSWORD_IS_REQUIRED: "Old password is required!",
  OLD_PASSWORD_MUST_BE_STRING: "Old password must be a string!",
  OLD_PASSWORD_LENGTH: "Old password must be between 6 and 20 characters long!",
  OLD_PASSWORD_INVALID: "Invalid old password!",

  USER_NOT_FOUND: "User not found!",
  USER_NOT_VERIFIED: "User not verified!",
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

  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Forgot password token is required!",
  FORGOT_PASSWORD_TOKEN_INVALID: "Invalid forgot password token!",
  FORGOT_PASSWORD_TOKEN_VERIFIED: "Forgot password token verified successfully!",
  RESET_PASSWORD_SUCCESSFUL: "Password reset successfully!",

  DATE_OF_BIRTH_INVALID: "Invalid date of birth!",
  BIO_MUST_BE_STRING: "Bio must be a string!",
  BIO_LENGTH: "Bio must be between 1 and 500 characters long!",
  LOCATION_MUST_BE_STRING: "Location must be a string!",
  LOCATION_LENGTH: "Location must be between 1 and 50 characters long!",
  WEBSITE_INVALID: "Invalid website!",
  WEBSITE_LENGTH: "Website must be between 1 and 100 characters long!",
  USERNAME_MUST_BE_A_STRING: "Invalid username!",
  USERNAME_INVALID: "Username must be 4-15 characters long, contain only letters, numbers, and underscores, and cannot be only numbers!",
  IMAGE_URL_MUST_BE_A_STRING: "Invalid image URL!",
  IMAGE_URL_LENGTH: "Image URL must be between 1 and 400 characters long!",

  GET_ME_SUCCESSFUL: "Get me successful!",
  GET_PROFILE_SUCCESSFUL: "Get profile successful!",
  UPDATE_ME_SUCCESSFUL: "Update me successful!",
  USERNAME_ALREADY_IN_USE: "Username is already in use!",

  FOLLOW_SUCCESSFUL: "Follow successful!",
  FOLLOWEE_ID_IS_REQUIRED: "Followee ID is required!",
  FOLLOWEE_ID_MUST_BE_A_STRING: "Followee ID must be a string!",
  FOLLOWEE_ID_INVALID: "Invalid followee ID!",
  FOLLOWEE_NOT_FOUND: "Followee not found!",
  ALREADY_FOLLOWED: "Already following!",
  CAN_NOT_FOLLOW_YOURSELF: "Can not follow yourself!",
  UNFOLLOW_SUCCESSFUL: "Unfollow successful!",
  NOT_FOLLOWED_YET: "Not followed yet!",

  OLD_PASSWORD_IS_NOT_MATCHED: "Old password is not matched!",
  NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD: "New password must be different from the old password",
  CHANGE_PASSWORD_SUCCESSFUL: "Change password successful!",

} as const; 