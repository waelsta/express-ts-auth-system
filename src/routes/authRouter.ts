import express from 'express';
import { signup } from '../controllers/authController';

const authRouter = express.Router();

authRouter.route('/signup').post(signup);
// authRouter.route('/signin').post(signin);
// authRouter.route('/signout').post(signout);
// authRouter.route('/refresh').post(refresh);

export default authRouter;
