import { Request } from 'express'
import { User } from './models/schemas/User.schemas'
import { TokenPayload } from './models/requests/user.requests';

declare module 'express' {
  interface Request {
    user?: User;
    decoded_authorization?: TokenPayload;
    decoded_refresh_token?: TokenPayload;
    decoded_email_token?: TokenPayload;
    decoded_forgot_password_token?: TokenPayload;
  }
}