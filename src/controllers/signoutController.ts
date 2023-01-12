import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import { CustomError } from '../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import redisClient from '../utils/redis.connect';
import { StatusCodes } from 'http-status-codes';
import { IjwtPayload } from '../types/types';
import jwt from 'jsonwebtoken';

export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;
<<<<<<< HEAD
  console.log("cookies : " , req.cookies);
=======
>>>>>>> 38fc449 (feat(sevices): add services modal in prisma)
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
      .status(StatusCodes.OK)
      .send({ data: 'signed out successfully' });
  } catch {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "couldn't sign out.. try again"
      )
    );
  }
};
