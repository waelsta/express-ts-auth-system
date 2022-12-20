import { getEmployeeData } from '../controllers/employee/employeeController';
import express from 'express';

const employeeRouter = express.Router();

employeeRouter.get('/', getEmployeeData);

export default employeeRouter;
