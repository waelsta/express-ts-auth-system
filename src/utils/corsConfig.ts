import { NextFunction, Request, Response } from 'express';
const PORT = process.env.PORT;

// allowed origins
export const allowedOrigins = [
  `http://127.0.0.1:${PORT}`,
  `http://localhost:${PORT}`,
  `localhost:${PORT}`,
  `http://localhost:7000`,
  `localhost:7000`
];

// Allow Credentials for allowed origins
export const credentials = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.host;
  if (typeof origin == 'string') {
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
  }
};

// allow only specific origins
export const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
