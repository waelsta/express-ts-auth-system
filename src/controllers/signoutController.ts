import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import redisClient from '../utils/redis.connect';
import jwt from 'jsonwebtoken';
import { CustomError } from '../middlewares/errorHandler';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';

interface IjwtPayload {
  sessionKey: string;
}

export async function signout(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.jwt;

  // no token
  if (!token) {
    return next(new CustomError(StatusCodes.BAD_REQUEST, 'please login !'));
  }

  // validate token
  let jwtPayload;
  try {
    jwtPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IjwtPayload;
  } catch {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'session already expired !')
    );
  }

  // delete session and sign user out
  const sessionKey = jwtPayload.sessionKey;
  try {
    await redisClient.del(sessionKey as RedisCommandArgument);
    res.clearCookie('jwt', { httpOnly: true });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ data: 'signed out successfully' });
  } catch {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "couldn't sign out.. try again"
      )
    );
  }
}
