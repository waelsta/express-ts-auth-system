import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import redisClient from '../utils/redis.connect';
import jwt from 'jsonwebtoken';
import { CustomError } from '../middlewares/errorHandler';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';

export async function signout(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(StatusCodes.NO_CONTENT);
  const token: string = cookies.jwt;
  const jwtPayload = jwt.verify(token, process.env.JWT_SECRET as string);
  let sessionKey;
  if (typeof jwtPayload !== 'string') sessionKey = jwtPayload.sessionKey;
  try {
    await redisClient.del(sessionKey as RedisCommandArgument);
    res.clearCookie('jwt', { httpOnly: true });
    return res
      .send({ data: 'signed out successfully' })
      .status(StatusCodes.NO_CONTENT);
  } catch {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "couldn't sign out.. try again"
      )
    );
  }
}
