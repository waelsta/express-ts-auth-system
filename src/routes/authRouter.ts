import { clientAuth } from '../controllers/client/authController';
import express from 'express';
import { employeeAuth } from '../controllers/employee/authController';
import { signout } from '../controllers/signoutController';

const authRouter = express.Router();

authRouter.route('/client/signup').post(clientAuth.signup);
authRouter.route('/client/signin').post(clientAuth.signin);
authRouter.route('/client/link').post(clientAuth.getResetLink);
authRouter.route('/client/reset').get(clientAuth.resetPassword);
authRouter.route('/client/signout').post(signout);

authRouter.route('/employee/signup').post(employeeAuth.signup);
authRouter.route('/employee/signin').post(employeeAuth.signin);
authRouter.route('/employee/link').post(employeeAuth.getResetLink);
authRouter.route('/employee/reset').get(employeeAuth.resetPassword);
authRouter.route('/employee/signout').post(signout);

export default authRouter;
