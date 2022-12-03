import redisClient from '../utils/redis.connect';
import prisma from '../utils/prisma.connect';
import { Client, Employee } from '@prisma/client';

import { randomUUID } from 'crypto';
import { ISessionClientData } from '../utils/validation';

// check for existing email
export const findClientByEmail = async (email: string) =>
  await prisma.client.findUnique({
    where: { email }
  });

export const findEmployeeByEmail = async (email: string) =>
  await prisma.employee.findUnique({
    where: { email }
  });

// check for existing phone number
export const phoneNumberExists = async (phone: number) => {
  return prisma.client.findUnique({ where: { phone_number: phone } });
};

// insert user into database ;
export const createClient = async (client: Client) => {
  const clientData = await prisma.client.create({ data: client });
  return clientData;
};

export const saveSession = async (
  user: ISessionClientData | Employee | Client
) => {
  const sessionKey = randomUUID();
  await redisClient.set(sessionKey, JSON.stringify(user), {
    EX: parseInt(process.env.SESSION_EXP as string)
  });
  return sessionKey;
};
