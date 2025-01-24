import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '~/models/requests/user.requests';

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
      if (err) throw reject(err);
      resolve(token as string);
    });
  });
}

export const verifyToken = (
  { token,
    publicOrSecretKey = process.env.JWT_PRIVATE_KEY as string,
  }:
    {
      token: string,
      publicOrSecretKey?: string,
    }
) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, publicOrSecretKey, (err, decoded) => {
      if (err) throw reject(err);
      resolve(decoded as TokenPayload);
    });
  });
}