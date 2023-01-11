import { clientSignInSchema, clientSignUpSchema } from '../../utils/validation';
import { ISigninFormTypes, ISignupFormTypes } from '../../types/client';
import { hashPassword, verifyPassword } from '../../utils/crypt';
import { CustomError } from '../../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import redisClient from '../../utils/redis.connect';
import { sendMail } from '../../models/mailModel';
import { StatusCodes } from 'http-status-codes';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

import {
  createClient,
  findClientByEmail,
  phoneNumberExists,
  saveSession,
  updateClientPassword
} from '../../models/client/authModels';
import { Client } from '@prisma/client';

const validateFormData = async (
  formValues: ISignupFormTypes | ISigninFormTypes,
  type: 'signin' | 'signup'
) => {
  if (type === 'signup') {
    return await clientSignUpSchema.validate(formValues);
  } else if (type === 'signin') {
    return await clientSignInSchema.validate(formValues);
  } else {
    return;
  }
};

const signToken = (sessionKey: string) => {
  const { JWT_SECRET, SESSION_EXP } = process.env;
  const token = jwt.sign({ sessionKey }, JWT_SECRET as string, {
    expiresIn: SESSION_EXP
  });

  return token;
};

//handle Client signup
const signup = async (
  req: Request<unknown, unknown, ISignupFormTypes, unknown>,
  res: Response,
  next: NextFunction
) => {
  // validate form data
  try {
    await validateFormData(req.body, 'signup');
  } catch {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'missing or invalid form data !')
    );
  }

  // check for existing email of phone number
  try {
    if (await findClientByEmail(req.body.email)) {
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
    last_name: req.body.last_name,
    street: req.body.street,
    email: req.body.email,
    city: req.body.city,

    createdAt: new Date(),
    id: randomUUID(),
    is_client: false
  };

  const clientData: Client = {
    ...sessionData,
    profile_picture_url: null,
    password: hashPassword(req.body.password),
    phone_number: parseInt(req.body.phone_number)
  };

  // saving user data
  try {
    await createClient(clientData);
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
    sessionKey = await saveSession(sessionData);
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
    await validateFormData(req.body, 'signin');
  } catch (error) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid or missing data !')
    );
  }

  const emailExist = await findClientByEmail(req.body.email);
  if (!emailExist) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'invalid credentials !')
    );
  }

  // verify password
  if (verifyPassword(req.body.password, emailExist.password)) {
    //get full user data and save to redis session
    const sessionKey = await saveSession({
      first_name: emailExist.first_name,
      last_name: emailExist.last_name,
      createdAt: emailExist.createdAt,
      is_client: emailExist.is_client,
      phone_number: emailExist.phone_number.toString(),
      email: emailExist.email,
      street: emailExist.street,
      city: emailExist.city,
      id: emailExist.id
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
    email = await findClientByEmail(req.body.email);
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
    await redisClient.set(token, JSON.stringify(req.body), {
      EX: parseInt(process.env.PIN_EXP as string)
    });

    // send mail containing the reset link

    const isSent = await sendMail(
      'khalil666chermiti@gmail.com', // change it to client's email
      'reset your password !',
      `use this link to reset your password : http://${process.env.BASE_URL}/api/v1/auth/client/reset?token=${token}`
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
    const clientData = await findClientByEmail(userEmail);

    // no existing user
    if (!clientData) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'no user with such email !')
      );
    }

    // update password
    await updateClientPassword(userEmail, password);

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

export const clientAuth = {
  signup,
  signin,
  getResetLink,
  resetPassword
};
