import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { ClientFormTypes, EmployeeFormTypes } from '../utils/validation';
import { userMapper, userTypeIsMissing, UserTypes } from '../utils/userMappr';

//handle Client signup
export const signup = async (
  req: Request<
    unknown,
    unknown,
    ClientFormTypes & EmployeeFormTypes,
    { user: UserTypes }
  >,
  res: Response,
  next: NextFunction
) => {
  // validate user param
  if (userTypeIsMissing(req.query.user)) {
    return next(new CustomError(StatusCodes.BAD_REQUEST, 'missing user type'));
  }

  // get user mappings
  const utils = userMapper.get(req.query.user)!;

  // validate form data
  try {
    await utils.validateUserData(req.body);
  } catch {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'missing or invalid form data !')
    );
  }

  // check for existing email of phone number
  try {
    if (await utils.findUserByEmail(req.body.email)) {
      return next(
        new CustomError(StatusCodes.CONFLICT, 'email alreay in use !')
      );
    }
    if (await utils.phoneNumberExists(parseInt(req.body.phone_number))) {
      return next(
        new CustomError(StatusCodes.CONFLICT, 'phone number already in use !')
      );
    }
  } catch (error) {
    return next(new CustomError(500, 'server error !'));
  }

  // saving user data
  try {
    await utils.createUser(req.query.user)(req.body);
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'server error , try again !'
      )
    );
  }

  // return token
  return res.status(StatusCodes.OK).send({ data: 'signed up successfully' });
};
