import { StatusCodes } from 'http-status-codes';
import { Client, Employee } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/errorHandler';
import { verifyPassword, signToken } from '../utils/crypt';
import { saveClientSession } from '../models/clientAuthModel';
import { saveEmployeeSession } from '../models/employeeAuthModel';
import { userMapper, userTypeIsMissing, UserTypes } from '../utils/userMappr';

// handle Client singin
export const signin = async (
  req: Request<
    unknown,
    unknown,
    { email: string; password: string },
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
    await utils.validateSignInData(req.body);
  } catch (error) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid or missing data !')
    );
  }

  const emailExist = await utils.findUserByEmail(req.body.email);
  if (!emailExist) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid credentials !')
    );
  }

  // verify password
  if (verifyPassword(req.body.password, emailExist.password)) {
    //get full user data and save to redis session
    let sessionKey;
    if (req.query.user === 'client') {
      sessionKey = await saveClientSession(emailExist as Client);
    }
    if (req.query.user === 'employee') {
      sessionKey = await saveEmployeeSession(emailExist as Employee);
    }

    //sign and send jwt
    const token = signToken(sessionKey as string);

    return res
      .status(200)
      .cookie('jwt', token)
      .send({ data: 'signed in successfully' });
  } else {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid credentials !')
    );
  }
};
