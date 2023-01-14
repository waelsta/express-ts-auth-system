import express from 'express';
import { signout } from '../controllers/signoutController';
import { signup } from '../controllers/singupController';
import { signin } from '../controllers/signinController';
import { resetPassword } from '../controllers/resetPassword';
import { getResetLink } from '../controllers/resetLinkController';

const authRouter = express.Router();

authRouter.route('/client/signup').post(signup);
authRouter.route('/client/signin').post(signin);
authRouter.route('/client/link').post(getResetLink);
authRouter.route('/client/reset').get(resetPassword);
authRouter.route('/client/signout').post(signout);

authRouter.route('/employee/signup').post(signup);
authRouter.route('/employee/signin').post(signin);
authRouter.route('/employee/link').post(getResetLink);
authRouter.route('/employee/reset').get(resetPassword);
authRouter.route('/employee/signout').post(signout);

export default authRouter;
