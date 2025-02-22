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
  CONFIRM_PASSWORD_IS_NOT_MATCHED: "Confirm password does not match!",

  OLD_PASSWORD_IS_REQUIRED: "Old password is required!",
  OLD_PASSWORD_MUST_BE_STRING: "Old password must be a string!",
  OLD_PASSWORD_LENGTH: "Old password must be between 6 and 20 characters long!",
  OLD_PASSWORD_INVALID: "Invalid old password!",

  USER_NOT_FOUND: "User not found!",
  USER_NOT_VERIFIED: "User not verified!",
  EMAIL_OR_PASSWORD_INCORRECT: "Email or password is incorrect!",
  EMAIL_IS_NOT_FOUND: "Email not found!",

  LOGIN_SUCCESSFUL: "Login successful!",
  REGISTER_SUCCESSFUL: "User registered successfully!",
  OAUTH_SUCCESSFUL: "OAuth successful!",
  OAUTH_FAILED: "OAuth failed!",
  GMAIL_NOT_VERIFIED: "Gmail is not verified!",
  UNAUTHORIZED: "Unauthorized!",

  ACCESS_TOKEN_INVALID: "Invalid access token!",
  ACCESS_TOKEN_IS_REQUIRED: "Access token is required!",
  REFRESH_TOKEN_INVALID: "Invalid refresh token!",
  REFRESH_TOKEN_IS_REQUIRED: "Refresh token is required!",
  REFRESH_TOKEN_NOT_FOUND: "Refresh token not found!",
  REFRESH_TOKEN_SUCCESSFUL: "Refresh token successful!",

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
  CAN_NOT_FOLLOW_YOURSELF: "Cannot follow yourself!",
  UNFOLLOW_SUCCESSFUL: "Unfollow successful!",
  NOT_FOLLOWED_YET: "Not followed yet!",

  OLD_PASSWORD_IS_NOT_MATCHED: "Old password does not match!",
  NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD: "New password must be different from the old password",
  CHANGE_PASSWORD_SUCCESSFUL: "Change password successful!",

  FILE_UPLOADED_SUCCESSFUL: "File uploaded successfully!",
  FILE_UPLOADED_IS_REQUIRED: "File upload is required!",
  FILE_UPLOAD_NOT_VALID: "File upload is not valid!",
  FILE_NOT_FOUND: "File not found!",

  RANGE_NOT_PROVIDED: "Range not provided!",

  GET_VIDEO_STATUS_SUCCESSFUL: "Get video status successful!",
} as const;

export const TWEET_MESSAGES = {
  POSTED_SUCCESSFUL: "Tweet posted successfully!",
  TYPE_IS_REQUIRED: "Tweet type is required!",
  TYPE_INVALID: "Invalid tweet type!",
  AUDIENCE_IS_REQUIRED: "Audience is required!",
  AUDIENCE_INVALID: "Invalid audience!",
  PARENT_TWEET_ID_INVALID: "Invalid parent tweet ID!",
  PARENT_TWEET_ID_MUST_BE_NULL: "Parent tweet ID must be null!",
  CONTENT_IS_REQUIRED: "Content is required!",
  CONTENT_MUST_BE_NULL: "Content must be null!",
  HASHTAGS_INVALID: "Invalid hashtag. Hashtag must be an array of strings!",
  MENTIONS_INVALID: "Invalid mention. Mention must be an array of User IDs!",
  MEDIAS_INVALID: "Invalid media. Media must be an array of Media objects!",
  TWEET_ID_IS_REQUIRED: "Tweet ID is required!",
  TWEET_ID_INVALID: "Invalid tweet ID!",
  TWEET_NOT_FOUND: "Tweet not found!",
  FETCHED_SUCCESSFUL: "Tweet fetched successfully!",
  TWEET_IS_NOT_PUBLIC: "Tweet is not public!",
  LIMIT_INVALID: "The limit must be from 1 to 100!",
  PAGE_INVALID: "The page must be greater than 0!",
} as const;

export const BOOKMARK_MESSAGES = {
  BOOKMARK_CREATED: "Bookmark created successfully!",
  BOOKMARK_DELETED: "Bookmark deleted successfully!",
  TWEET_ID_IS_REQUIRED: "Tweet ID is required!",
  TWEET_ID_INVALID: "Invalid tweet ID!",
  ALREADY_BOOKMARKED: "Already bookmarked!",
  NOT_BOOKMARKED_YET: "Not bookmarked yet!",
  BOOKMARK_ID_IS_REQUIRED: "Bookmark ID is required!",
  BOOKMARK_ID_INVALID: "Invalid bookmark ID!",
  BOOKMARK_NOT_FOUND: "Bookmark not found!",
}

export const LIKE_MESSAGES = {
  LIKE_CREATED: "Like created successfully!",
  LIKE_DELETED: "Like deleted successfully!",
  TWEET_ID_IS_REQUIRED: "Tweet ID is required!",
  TWEET_ID_INVALID: "Invalid tweet ID!",
  ALREADY_LIKED: "Already liked!",
  NOT_LIKED_YET: "Not liked yet!",
  LIKE_ID_IS_REQUIRED: "Like ID is required!",
  LIKE_ID_INVALID: "Invalid like ID!",
  LIKE_NOT_FOUND: "Like not found!",
}