export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenTypes {
  AccessToken,
  RefreshToken,
  EmailVerifyToken,
  ForgotPasswordToken,
}

export enum MediaType {
  Image,
  Video
}

export enum EncodingStatus {
  Pending,
  Processing,
  Completed,
  Failed
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Public,
  Followers,
}