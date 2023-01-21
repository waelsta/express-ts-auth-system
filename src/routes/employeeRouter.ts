import { getemployee, getData } from '../controllers/employeeController';
import { checkAuth } from '../middlewares/authHandler';
import express from 'express';

const employeeRouter = express.Router();

employeeRouter.get('/', checkAuth, getData);
employeeRouter.get('/:employeeId', getemployee);

export default employeeRouter;
