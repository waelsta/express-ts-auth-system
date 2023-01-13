import { Router } from 'express';
import {
  addService,
  getServiceById,
  getServices,
  removeService
} from '../controllers/serviceController';

const serviceRouter = Router();

serviceRouter.get('/', getServices);
serviceRouter.get('/:serviceId', getServiceById);
serviceRouter.delete('/:serviceId', removeService);
serviceRouter.post('/', addService);

export default serviceRouter;
