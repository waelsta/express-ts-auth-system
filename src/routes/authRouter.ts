import express from 'express';
import { signout } from '../controllers/signoutController';
import { signup } from '../controllers/singupController';
import { signin } from '../controllers/signinController';
import { resetPassword } from '../controllers/resetPassword';
import { getResetLink } from '../controllers/resetLinkController';
import { protectAuth } from '../middlewares/protectAuth';

const authRouter = express.Router();

authRouter.route('/signup').post(protectAuth, signup);
authRouter.route('/signin').post(protectAuth, signin);
authRouter.route('/link').post(getResetLink);
authRouter.route('/reset').get(resetPassword);
authRouter.route('/signout').post(signout);

export default authRouter;
