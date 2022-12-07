import {
  userSignUpSchema,
  ISignupFormTypes,
  ISigninFormTypes,
  userSignInSchema
} from '../utils/validation';
import { hashPassword, verifyPassword } from '../utils/crypt';
import { CustomError } from '../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import { randomBytes, randomUUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import {
  saveSession,
  findClientByEmail,
  createClient,
  phoneNumberExists,
  sendMail
} from '../models/authModels';
import redisClient from '../utils/redis.connect';

const validateFormData = async (
  formValues: ISignupFormTypes | ISigninFormTypes,
  type: 'signin' | 'signup'
) => {
  if (type === 'signup') {
    return await userSignUpSchema.validate(formValues);
  } else if (type === 'signin') {
    return await userSignInSchema.validate(formValues);
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
export async function signup(
  req: Request<unknown, unknown, ISignupFormTypes>,
  res: Response,
  next: NextFunction
) {
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

  const clientData = {
    ...sessionData,
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
}

// handle Client singin
export async function signin(req: Request, res: Response, next: NextFunction) {
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
    const sessionKey = await saveSession(emailExist);

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
}

// send reset code
export const getResetLink = async (
  req: Request,
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

  // generate reset token and save it to session
  let token = ''; // causes error if not assigned
  randomBytes(48, (err, buffer) => {
    token = buffer.toString('hex');
  });

  try {
    // save token to session
    // token maps to user email (token => email)
    await redisClient.set(token, JSON.stringify(req.body.email), {
      EX: parseInt(process.env.PIN_EXP as string)
    });

    // send mail containing the reset link

    const isSent = await sendMail(
      'khalil666chermiti@gmail.com', // change it to client's eamil
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
    console.log('error ', error);
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error occured, please try later !'
      )
    );
  }
};
