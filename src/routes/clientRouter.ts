import { getClientData } from '../controllers/client/clientController';
import express from 'express';

const clientRouter = express.Router();

clientRouter.get('/', getClientData);

export default clientRouter;
