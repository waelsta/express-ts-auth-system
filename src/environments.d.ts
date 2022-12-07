import { Secret } from 'jsonwebtoken';

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: Secret;
      SESSION_EXP: string;
      PIN_EXP: string;
      MAIL_USER: string;
      MAIL_PASSWORD: string;
      BASE_URL: string;
    }
  }
}
