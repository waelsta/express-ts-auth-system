import { Service } from '@prisma/client';
import prisma from '../services/prisma.connect';

// find service by id
export const findServiceById = async (id: string) => {
  return await prisma.service.findUnique({ where: { id: id || undefined } });
};

// get list of services
export const fetchServices = async () => {
  return await prisma.service.findMany();
};

// find service by name
export const findServiceByName = async (name: string) => {
  return await prisma.service.findFirst({
    where: { label: name || undefined }
  });
};

// add new service
export const createService = async (service: Service) => {
  return await prisma.service.create({
    data: { ...service }
  });
};

export const deleteService = async (serviceId: string) => {
  return await prisma.service.delete({ where: { id: serviceId } });
};
