import express from 'express';
import { signup, signin } from '../controllers/authController';
import { signout } from '../controllers/signoutController';
const authRouter = express.Router();

authRouter.route('/client/signup').post(signup);
authRouter.route('/client/signin').post(signin);
authRouter.route('/client/signout').get(signout);
// authRouter.route('/refresh').post(refresh);

export default authRouter;
