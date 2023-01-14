import { StatusCodes } from 'http-status-codes';
import redisClient from '../services/redis.connect';
import { CustomError } from '../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { userMapper, userTypeIsMissing, UserTypes } from '../utils/userMappr';

// reset password
export const resetPassword = async (
  req: Request<
    unknown,
    unknown,
    { password: string },
    { token: string; user: UserTypes }
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
    const clientData = await utils.findUserByEmail(userEmail);

    // no existing user
    if (!clientData) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'no user with such email !')
      );
    }

    // update password
    await utils.updateUserPassword(userEmail, password);

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
