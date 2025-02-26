import { createHash } from 'crypto';
import { config } from 'dotenv';
import envConfig from '~/constants/config';

export const hashSha256 = (data: string) => {
  return createHash('sha256').update(data).digest('hex');
};

export const hashPassword = (password: string) => {
  return hashSha256(password + envConfig.security.PASSWORD_SALT);
};