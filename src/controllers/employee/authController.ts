import { hashPassword, verifyPassword } from '../../utils/crypt';
import { CustomError } from '../../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import redisClient from '../../utils/redis.connect';
import { sendMail } from '../../models/mailModel';
import { StatusCodes } from 'http-status-codes';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

import {
  EmployeeFormTypes,
  validateEmployeeData,
  ValidateSignInData
} from '../../utils/validation';

import {
  updateEmployeePassword,
  saveEmployeeSession,
  findEmployeeByEmail,
  phoneNumberExists,
  createEmployee
} from '../../models/employee/authModel';
import { findServiceByName } from '../../models/serviceModal';
import { cities } from '../../utils/citiesCoordinates';
import { Employee } from '@prisma/client';

const signToken = (sessionKey: string) => {
  const { JWT_SECRET, SESSION_EXP } = process.env;
  const token = jwt.sign({ sessionKey }, JWT_SECRET as string, {
    expiresIn: SESSION_EXP
  });

  return token;
};

// handle Client signup
const signup = async (
  req: Request<unknown, unknown, EmployeeFormTypes, unknown>,
  res: Response,
  next: NextFunction
) => {
  // validate form data
  try {
    await validateEmployeeData(req.body);
  } catch {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'missing or invalid form data !')
    );
  }

  // check for existing email of phone number
  try {
    if (await findEmployeeByEmail(req.body.email)) {
      return next(
        new CustomError(StatusCodes.CONFLICT, 'email alreay in use !')
      );
    }
    if (await phoneNumberExists(parseInt(req.body.phone_number))) {
      return next(
        new CustomError(StatusCodes.CONFLICT, 'phone number already in use !')
      );
    }
  } catch (error) {
    return next(new CustomError(500, 'server error !'));
  }

  // user Object - hashed password !
  const sessionData = {
    phone_number: req.body.phone_number,
    first_name: req.body.first_name,
    profession: (await findServiceByName(req.body.profession!))?.id || null,
    last_name: req.body.last_name,
    email: req.body.email,
    lat: cities[req.body.city as keyof typeof cities].lat,
    long: cities[req.body.city as keyof typeof cities].lat,

    createdAt: new Date(),
    id: randomUUID(),
    still_employed: false
  };

  const employeeData: Employee = {
    ...sessionData,
    profile_picture_url: null,
    password: hashPassword(req.body.password),
    phone_number: parseInt(req.body.phone_number)
  };

  // saving user data
  try {
    await createEmployee({
      ...employeeData
    });
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'server error , try again !'
      )
    );
  }

  // save client session data to redis
  let sessionKey;
  try {
    sessionKey = await saveEmployeeSession({
      ...sessionData
    });
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'server error , please login !'
      )
    );
  }

  // sign a token
  const token = signToken(sessionKey);

  // return token
  return res
    .status(StatusCodes.OK)
    .cookie('jwt', token)
    .send({ data: 'signed up successfully' });
};

// handle Client singin
const signin = async (
  req: Request<unknown, unknown, { email: string; password: string }, unknown>,
  res: Response,
  next: NextFunction
) => {
  // validate form data
  try {
    await ValidateSignInData(req.body);
  } catch (error) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid or missing data !')
    );
  }

  const emailExist = await findEmployeeByEmail(req.body.email);
  if (!emailExist) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid credentials !')
    );
  }

  // verify password
  if (verifyPassword(req.body.password, emailExist.password)) {
    //get full user data and save to redis session
    const sessionKey = await saveEmployeeSession({
      ...emailExist,
      phone_number: emailExist.phone_number.toString()
    });

    //sign and send jwt
    const token = signToken(sessionKey);

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

// send reset code
const getResetLink = async (
  req: Request<unknown, unknown, { email: string }, unknown>,
  res: Response,
  next: NextFunction
) => {
  // no email address
  if (!req.body.email) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'missing email address !')
    );
  }

  // email does not exists
  let email;
  try {
    email = await findEmployeeByEmail(req.body.email);
    if (!email) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'no user with such email !')
      );
    }
  } catch {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'no user with such email !')
    );
  }

  // generate reset token
  const token = randomUUID();

  try {
    // save token to session
    // token maps to user email (token => email)
    await redisClient.set(token, req.body.email, {
      EX: parseInt(process.env.PIN_EXP as string)
    });

    // send mail containing the reset link

    const isSent = await sendMail(
      'khalil666chermiti@gmail.com', // change it to client's email
      'reset your password !',
      `use this link to reset your password : http://${process.env.BASE_URL}/api/v1/auth/employee/reset?token=${token}`
    );

    if (isSent) {
      return res.sendStatus(StatusCodes.OK);
    } else {
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'orror occured, please try later'
      );
    }
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error occured, please try later !'
      )
    );
  }
};

// reset password
const resetPassword = async (
  req: Request<unknown, unknown, { password: string }, { token: string }>,
  res: Response,
  next: NextFunction
) => {
  // check if token exist
  const token = req.query.token as string;
  if (!token) {
    return next(
      new CustomError(StatusCodes.UNAUTHORIZED, 'action not authorized !')
    );
  }

  // check if password exist
  const password = req.body.password;
  if (!password) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'missing password field !')
    );
  }

  // get userEmail from session
  try {
    const userEmail = await redisClient.get(token);
    // session exipred
    if (!userEmail) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'rest link expired !')
      );
    }

    // get user data
    const clientData = await findEmployeeByEmail(userEmail);

    // no existing user
    if (!clientData) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'no user with such email !')
      );
    }

    // update password
    await updateEmployeePassword(userEmail, password);

    // delete token from session
    await redisClient.del(token as string);

    return res
      .status(StatusCodes.OK)
      .send({ data: 'password reset successfully' });
  } catch {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error occured please try again !'
      )
    );
  }
};

export const employeeAuth = {
  signup,
  signin,
  getResetLink,
  resetPassword
};
