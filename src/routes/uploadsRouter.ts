import { uploadProfilePic } from '../controllers/fileUpload';
import { checkAuth } from '../middlewares/authHandler';
import express from 'express';

const uploadsRouter = express.Router();

uploadsRouter.post('/profile_picture', checkAuth, uploadProfilePic);

export default uploadsRouter;
