import {
  userSignUpSchema,
  SignupFormTypes,
  SigninFormTypes,
  userSignInSchema
} from '../utils/validation';
import { hashPassword, verifyPassword } from '../utils/crypt';
import { CustomError } from '../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import {
  saveSession,
  emailExists,
  createClient,
  phoneNumberExists
} from '../models/authModels';

const validateFormData = async (
  formValues: SignupFormTypes | SigninFormTypes,
  type: 'signin' | 'signup'
) => {
  if (type === 'signin') {
    return await userSignUpSchema.validate(formValues);
  } else if (type === 'signup') {
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

export async function signup(
  req: Request<unknown, unknown, SignupFormTypes>,
  res: Response,
  next: NextFunction
) {
  // validate form data
  try {
    await validateFormData(req.body, 'signup');
  } catch {
    return next(new CustomError(300, 'missing or invalid form data !'));
  }

  // check for existing email of phone number
  try {
    if (await emailExists('Client', req.body.email)) {
      return next(new CustomError(300, 'email alreay in use !'));
    }
    if (await phoneNumberExists(parseInt(req.body.phone_number))) {
      return next(new CustomError(300, 'phone number already in use !'));
    }
  } catch (error) {
    return next(new CustomError(500, 'server error !'));
  }

  // user Object - hashed password !
  let sessionData = {
    phone_number: parseInt(req.body.phone_number),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    street: req.body.street,
    email: req.body.email,
    city: req.body.city,
    password: req.body.password,
    createdAt: new Date(),
    id: randomUUID(),
    is_client: false
  };

  // let clientData = {
  //   ...sessionData,
  //   password: hashPassword(req.body.password)
  // };

  // saving user data
  try {
    await createClient(sessionData);
  } catch (error) {
    return next(new CustomError(500, 'server error , try again !'));
  }

  // save client session data to redis
  let sessionKey;
  try {
    sessionKey = await saveSession(sessionData);
  } catch (error) {
    return next(new CustomError(500, 'server error , please login !'));
  }

  // sign a token
  const token = signToken(sessionKey);

  // return token
  return res
    .status(200)
    .cookie('jwt', token)
    .send({ data: 'signed up successfully' });
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  console.log(req);
  //verify if email already exists
  try {
    await validateFormData(req.body, 'signup');
  } catch (error) {
    return next(new CustomError(300, 'invalid or missing data'));
  }

  try {
    const emailExist = await emailExists('Client', req.body.email);
    if (!emailExist) return next(new CustomError(303, 'invalid credentials'));
    //verify password
    if (verifyPassword(req.body.password, emailExist.password)) {
      //get full user data and save to redis session
      let sessionKey;
      try {
        sessionKey = await saveSession(emailExist);
      } catch (error) {
        return next(new CustomError(500, 'server error , please login !'));
      }
      //sign and send jwt
      const token = signToken(sessionKey);

      return res
        .status(200)
        .cookie('jwt', token)
        .send({ data: 'signed in successfully' });
    } else return next(new CustomError(303, 'invalid credentials'));
  } catch (error) {
    return next(new CustomError(500, 'server error , try again !'));
  }
}
