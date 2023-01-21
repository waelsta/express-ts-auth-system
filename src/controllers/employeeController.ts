import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/errorHandler';
import { getEmployeeData } from '../models/employeeModel';
import { Client, Employee } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

// get client data
export const getData = async (
  req: Request,
  res: Response<any, { userData: Client | Employee }>,
  next: NextFunction
) => {
  const client = res.locals.userData;
  return res.status(StatusCodes.OK).send(client);
};

// find employee data by id
export const getemployee = async (
  req: Request<{ employeeId: string }>,
  res: Response,
  next: NextFunction
) => {
  // check for employee id
  if (!req.params.employeeId) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'provide employee id')
    );
  }

  // find employee
  const employee = await getEmployeeData(req.params.employeeId);

  if (!employee) {
    return next(
      new CustomError(StatusCodes.NOT_FOUND, 'employee does not exist')
    );
  }

  // return data
  return res.status(StatusCodes.OK).send(employee);
};
