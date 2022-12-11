import express from 'express';
import {
  signup,
  signin,
  getResetLink,
  resetPassword
} from '../controllers/authController';
import { signout } from '../controllers/signoutController';
const authRouter = express.Router();

authRouter.route('/client/signup').post(signup);
authRouter.route('/client/signin').post(signin);
authRouter.route('/client/signout').post(signout);
authRouter.route('/client/link').post(getResetLink); // get reset link
authRouter.route('/client/reset').get(resetPassword); // reset password
export default authRouter;
