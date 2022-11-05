import express from 'express';
import { signup, signin } from '../controllers/authController';

const authRouter = express.Router();

authRouter.route('/client/signup').post(signup);
authRouter.route('/client/signin').post(signin);
// authRouter.route('/signout').post(signout);
// authRouter.route('/refresh').post(refresh);

export default authRouter;
