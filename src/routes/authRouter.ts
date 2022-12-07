import express from 'express';
import { signup, signin, getResetLink } from '../controllers/authController';
import { signout } from '../controllers/signoutController';
const authRouter = express.Router();

authRouter.route('/client/signup').post(signup);
authRouter.route('/client/signin').post(signin);
authRouter.route('/client/signout').post(signout);
authRouter.route('/client/link').post(getResetLink); // get reset link
//authRouter.route('/client/link').post(resetPassword) // reset password
export default authRouter;
