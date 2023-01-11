import { getClientData } from '../controllers/client/clientController';
import { uploadProfilePic } from '../controllers/fileUpload';
import express from 'express';

const clientRouter = express.Router();

clientRouter.get('/', getClientData);

clientRouter.post('/upload', uploadProfilePic);

export default clientRouter;
