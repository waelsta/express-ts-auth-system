import { Router } from 'express';
import {
  addService,
  getServiceById,
  getServices
} from '../controllers/serviceController';

const serviceRouter = Router();

serviceRouter.get('/', getServices);
serviceRouter.get('/:serviceId', getServiceById);
serviceRouter.post('/', addService);

export default serviceRouter;
