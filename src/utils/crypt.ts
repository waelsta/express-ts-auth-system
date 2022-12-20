// hash
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { IjwtPayload } from '../types/types';

// hashing password adding salt
export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hashedPassword}`;
};

// dehash and compare passowrds
export const verifyPassword = (password: string, hash: string) => {
  const [salt, key] = hash.split(':');
  const passwordBuffer = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  const match = timingSafeEqual(passwordBuffer, keyBuffer);
  return match;
};

// verfiy jwt token

export const verifyJwtToken = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET as string);
