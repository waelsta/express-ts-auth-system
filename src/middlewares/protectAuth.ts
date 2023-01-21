import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from './errorHandler';

// prevent user from signin/singup while logged in
export const protectAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get jwt
  const token = req.cookies.jwt as string;

  if (token) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'you are already signed in')
    );
  }

  next();
};
