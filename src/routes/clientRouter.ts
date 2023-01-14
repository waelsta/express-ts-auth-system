import { getClientData } from '../controllers/clientController';
import { uploadProfilePic } from '../controllers/fileUpload';
import { checkAuth } from '../middlewares/authHandler';
import express from 'express';

const clientRouter = express.Router();

clientRouter.get('/', getClientData);

clientRouter.post('/uploads/profile_picture', checkAuth, uploadProfilePic);

export default clientRouter;
