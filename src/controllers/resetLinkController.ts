import { randomUUID } from 'crypto';
import { sendMail } from '../models/mailModel';
import { StatusCodes } from 'http-status-codes';
import redisClient from '../services/redis.connect';
import { CustomError } from '../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { userMapper, userTypeIsMissing, UserTypes } from '../utils/userMappr';

// send reset code
export const getResetLink = async (
  req: Request<unknown, unknown, { email: string }, { user: UserTypes }>,
  res: Response,
  next: NextFunction
) => {
  // validate user param
  if (userTypeIsMissing(req.query.user)) {
    return next(new CustomError(StatusCodes.BAD_REQUEST, 'missing user type'));
  }

  // get user mappings
  const utils = userMapper.get(req.query.user)!;

  // no email address
  if (!req.body.email) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'missing email address !')
    );
  }

  // email does not exists
  let email;
  try {
    email = await utils.findUserByEmail(req.body.email);
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
      'khalil666chermiti@gmail.com', // change it to users's email
      'reset your password !',
      `use this link to reset your password : http://${process.env.BASE_URL}/api/v1/auth/client/reset?user=${req.query.user}&token=${token}`
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
