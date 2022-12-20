import { CustomError } from '../../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import redisClient from '../../utils/redis.connect';
import { verifyJwtToken } from '../../utils/crypt';
import { StatusCodes } from 'http-status-codes';
import { IjwtPayload } from '../../types/types';

// get client data
export const getClientData = async (
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
  return res.status(StatusCodes.OK).send(JSON.parse(client));
};
