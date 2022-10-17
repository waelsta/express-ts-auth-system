import { NextFunction, Request, Response } from 'express';

// allowed origins
export const allowedOrigins = [
  'https://www.yoursite.com',
  'http://127.0.0.1:3000',
  'http://localhost:3000'
];

// Allow Credentials for allowed origins

export const credentials = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin;
  if (typeof origin == 'string') {
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
  }
};

export const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
