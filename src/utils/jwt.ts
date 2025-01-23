import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();

export const signToken = (
  { payload,
    privateKey = process.env.JWT_PRIVATE_KEY as string,
    options = {
      algorithm: 'HS256',
    } }:
    {
      payload: "string" | object | Buffer,
      privateKey?: string,
      options?: jwt.SignOptions
    }
) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) reject(err);
      resolve(token as string);
    });
  });
}
