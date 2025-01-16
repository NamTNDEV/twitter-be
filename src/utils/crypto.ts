import { createHash } from 'crypto';

export const hashSha256 = (data: string) => {
  return createHash('sha256').update(data).digest('hex');
};

export const hashPassword = (password: string) => {
  return hashSha256(password + process.env.PASSWORD_SALT);
};