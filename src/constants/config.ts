import { config } from "dotenv"
import { getEnvPath, getEnvPathWithoutLib3 } from "~/utils/env.ultis";

config({
  path: getEnvPathWithoutLib3(process.env.NODE_ENV as string)
});

const envConfig = {
  server: {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST as string,
    CLIENT_URL: process.env.CLIENT_URL as string
  },
  database: {
    DB_NAME: process.env.DB_NAME as string,
    DB_USERNAME: process.env.DB_USERNAME as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    COLLECTIONS: {
      USERS: process.env.DB_COLLECTION_USERS as string,
      REFRESH_TOKENS: process.env.DB_COLLECTION_REFRESH_TOKENS as string,
      EMAIL_VERIFY_TOKENS: process.env.DB_COLLECTION_EMAIL_VERIFY_TOKENS as string,
      FOLLOWERS: process.env.DB_COLLECTION_FOLLOWERS as string,
      VIDEO_STATUS: process.env.DB_COLLECTION_VIDEO_STATUS as string,
      TWEETS: process.env.DB_COLLECTION_TWEETS as string,
      HASH_TAGS: process.env.DB_COLLECTION_HASH_TAGS as string,
      LIKES: process.env.DB_COLLECTION_LIKES as string,
      BOOKMARKS: process.env.DB_COLLECTION_BOOKMARKS as string,
      CONVERSATIONS: process.env.DB_CONVERSATION as string
    }
  },
  security: {
    PASSWORD_SALT: process.env.PASSWORD_SALT as string,
    PASSWORD_FORGOT_TOKEN: {
      EXPIRE: process.env.PASSWORD_FORGOT_TOKEN_EXPIRE as string,
      PRIVATE_KEY: process.env.PASSWORD_FORGOT_TOKEN_PRIVATE_KEY as string
    }
  },
  jwt: {
    REFRESH_TOKEN: {
      EXPIRE: process.env.JWT_REFRESH_TOKEN_EXPIRE as string,
      PRIVATE_KEY: process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string
    },
    ACCESS_TOKEN: {
      EXPIRE: process.env.JWT_ACCESS_TOKEN_EXPIRE as string,
      PRIVATE_KEY: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string
    }
  },
  email: {
    EMAIL_TOKEN: {
      PRIVATE_KEY: process.env.EMAIL_TOKEN_PRIVATE_KEY as string,
      EXPIRE: process.env.EMAIL_TOKEN_EXPIRE as string
    }
  },
  oauth: {
    GOOGLE: {
      TOKEN_URL: process.env.OAUTH_GOOGLE_TOKEN_URL as string,
      CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID as string,
      CLIENT_SECRET: process.env.OAUTH_GOOGLE_CLIENT_SECRET as string,
      REDIRECT_URI: process.env.OAUTH_GOOGLE_REDIRECT_URI as string,
      USERINFO_URL: process.env.OAUTH_GOOGLE_USERINFO_URL as string,
      CLIENT_REDIRECT_CALLBACK: process.env.OAUTH_CLIENT_REDIRECT_CALLBACK as string
    }
  },
  aws: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
    AWS_REGION: process.env.AWS_REGION as string,
    SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS as string,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME as string
  }
};

export default envConfig;