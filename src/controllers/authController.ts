import express, { Request, Response } from 'express';
import { Client } from '@prisma/client';
import jwt from 'jsonwebtoken';
import {
  saveSession,
  emailExists,
  createClient,
  phoneNumberExists
} from '../models/authModels';
import { CustomError } from '../middlewares/errorHandler';

const isFormValid = (formValues: Client) => {
  Object.values(formValues).forEach(value => {
    if (!value) return false;
  });
  return true;
};

export async function signup(req: Request<unknown, unknown, Client>, res: Response) {
  const { email, phone_number } = req.body;

  if (isFormValid(req.body))
  {throw new CustomError(300, 'all fields must be filled !');}

  if (await emailExists(email))
  {throw new CustomError(300, 'email alreay in use !');}

  if (await phoneNumberExists(phone_number))
  {throw new CustomError(300, 'phone number already in use !');}

  // create user
  const clientData = await createClient(req.body);

  // save session data to redis
  const sessionKey = await saveSession(clientData);

  // sign a token and refresh token
  const token = jwt.sign({ sessionKey }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60
  });

  // return token
}

//export function signin(req: Request, res: Response) {}

//export function signout(req: Request, res: Response) {}

//export function refresh(req: Request, res: Response) {}
