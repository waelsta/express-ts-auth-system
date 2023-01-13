import { randomUUID } from 'crypto';
import { Service } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../middlewares/errorHandler';
import { NextFunction, Request, Response } from 'express';
import {
  createService,
  deleteService,
  fetchServices,
  findServiceById,
  findServiceByName
} from '../models/serviceModal';

// get list of services
export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const services: Service[] = await fetchServices();
    return res.status(StatusCodes.OK).json(services);
  } catch (err) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error fetching services'
      )
    );
  }
};

// get service by id
export const getServiceById = async (
  req: Request<{ serviceId: string }>,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.serviceId) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'please provide an id')
    );
  }

  try {
    const service = await findServiceById(req.body.id);
    return res.status(StatusCodes.OK).json(service);
  } catch (err) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error fetching services'
      )
    );
  }
};

// add new service
export const addService = async (
  req: Request<any, any, Omit<Service, 'id'>>,
  res: Response,
  next: NextFunction
) => {
  // no label
  if (!req.body.label) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'please provide a name')
    );
  }

  // name already exists
  const serviceExists = await findServiceByName(req.body.label);
  if (serviceExists) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'service name already exists')
    );
  }

  // create service
  try {
    const service = await createService({
      id: randomUUID(),
      label: req.body.label,
      description: req.body.description || null
    });
    return res.status(StatusCodes.OK).json(service);
  } catch (err) {
    console.log(err);
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error fetching services'
      )
    );
  }
};

// delete serivce
// get service by id
export const removeService = async (
  req: Request<{ serviceId: string }>,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.serviceId) {
    return next(
      new CustomError(StatusCodes.BAD_REQUEST, 'please provide an id')
    );
  }

  try {
    const service = await deleteService(req.body.id);
    return res.status(StatusCodes.OK).json(service);
  } catch (err) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'error deleting services'
      )
    );
  }
};
