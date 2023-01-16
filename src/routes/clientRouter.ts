import { getClient, getData } from '../controllers/clientController';
import { checkAuth } from '../middlewares/authHandler';
import express from 'express';

const clientRouter = express.Router();

clientRouter.get('/', checkAuth, getData);
clientRouter.get('/:clienId', getClient);

export default clientRouter;
