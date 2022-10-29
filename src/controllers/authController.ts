import { userSignUpSchema, SignupFormTypes } from '../utils/validation';
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

const { JWT_SECRET, REFRESH_SECRET } = process.env;

const validateFormData = async (formValues: SignupFormTypes) =>
  await userSignUpSchema.validate(formValues);

export async function signup(
  req: Request<unknown, unknown, SignupFormTypes>,
  res: Response,
  next: NextFunction
) {
  // validate form data
  try {
    await validateFormData(req.body);
  } catch {
    return next(new CustomError(300, 'missing or invalid form data !'));
  }

  // check for existing email of phone number
  try {
    if (await emailExists(req.body.email)) {
      return next(new CustomError(300, 'email alreay in use !'));
    }
    if (await phoneNumberExists(parseInt(req.body.phone_number))) {
      return next(new CustomError(300, 'phone number already in use !'));
    }
  } catch (error) {
    return next(new CustomError(500, 'server error !'));
  }

  // user Object - hashed password !
  let clientData = {
    phone_number: parseInt(req.body.phone_number),
    password: hashPassword(req.body.password),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    street: req.body.street,
    email: req.body.email,
    city: req.body.city,

    createdAt: new Date(),
    id: randomUUID(),
    is_client: false
  };

  // daving user data
  try {
    clientData = await createClient(clientData);
  } catch (error) {
    return next(new CustomError(500, 'server error , try again !'));
  }

  // save client session data to redis
  let sessionKey;
  try {
    sessionKey = await saveSession(clientData);
  } catch (error) {
    return next(new CustomError(500, 'server error , please login !'));
  }

  // sign a token and refresh token
  const token = jwt.sign({ sessionKey }, JWT_SECRET as string, {
    expiresIn: 60 * 60 // 1m
  });

  // return token
  return res.status(200).send({ token: token });
}

//export function signin(req: Request, res: Response) {}

//export function signout(req: Request, res: Response) {}

//export function refresh(req: Request, res: Response) {}
