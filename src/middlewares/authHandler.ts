import { Client, Employee } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IjwtPayload } from '../types/types';
import { verifyJwtToken } from '../utils/crypt';
import redisClient from '../utils/redis.connect';
import { CustomError } from './errorHandler';

// middleware to check if user is authenticated
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get jwt
  const token = req.cookies.jwt as string;
  if (!token) {
    return next(new CustomError(StatusCodes.BAD_REQUEST, 'please sign in!'));
  }

  // verfiy jwt
  const jwtBody = verifyJwtToken(token) as IjwtPayload;
  if (!jwtBody) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'session expired login again!')
    );
  }

  // get client data from redis
  let client;
  try {
    client = (await redisClient.get(jwtBody.sessionKey)) as string;
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error occured please try again !'
      )
    );
  }

  // saving userId to request object to be accessable on next req handler
  res.locals.user = JSON.parse(client) as Client | Employee;
  next();
};
