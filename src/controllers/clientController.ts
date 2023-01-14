import { StatusCodes } from 'http-status-codes';
import { Client, Employee } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

// get client data
export const getClientData = async (
  req: Request,
  res: Response<any, { userData: Client | Employee }>,
  next: NextFunction
) => {
  const client = res.locals.userData;
  return res.status(StatusCodes.OK).send(client);
};
