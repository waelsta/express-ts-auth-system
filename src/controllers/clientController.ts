import { StatusCodes } from 'http-status-codes';
import { Client, Employee } from '@prisma/client';
import { getUserData } from '../models/clientModel';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../middlewares/errorHandler';

// get client data
export const getData = async (
  req: Request,
  res: Response<any, { user: Client | Employee }>,
  next: NextFunction
) => {
  const client = res.locals.user;
  return res.status(StatusCodes.OK).send(client);
};

// find client data by id
export const getClient = async (
  req: Request<{ clientId: string }>,
  res: Response,
  next: NextFunction
) => {
  // check for client id
  if (!req.params.clientId) {
    return next(new CustomError(StatusCodes.BAD_REQUEST, 'provide client id'));
  }

  // find client
  const client = await getUserData(req.params.clientId);

  if (!client) {
    return next(
      new CustomError(StatusCodes.NOT_FOUND, 'client does not exist')
    );
  }

  // return data
  return res.status(StatusCodes.OK).send(client);
};
