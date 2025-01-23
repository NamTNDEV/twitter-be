import { Request } from 'express'
import { User } from './models/schemas/User.schemas'

declare module 'express' {
  interface Request {
    user?: User;
  }
}