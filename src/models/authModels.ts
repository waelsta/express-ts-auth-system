import redisClient from '../utils/redis.connect';
import prisma from '../utils/prisma.connect';
import { Client, Employee } from '@prisma/client';

import { randomUUID } from 'crypto';

// check for existing email
export const emailExists = async (userType: string, email: string) => {
  switch (userType) {
    case 'Client':
      const client = await prisma.client.findUnique({
        where: { email }
      });
      return client;
    case 'Employee':
      const employee = await prisma.employee.findUnique({
        where: { email }
      });
      return employee;
    default:
      return null;
  }
};

// check for existing phone number
export const phoneNumberExists = async (phone: number) => {
  return prisma.client.findUnique({ where: { phone_number: phone } });
};

// insert user into database ;
export const createClient = async (client: Client) => {
  const clientData = await prisma.client.create({ data: client });
  return clientData;
};

export const saveSession = async (user: Client | Employee) => {
  const sessionKey = randomUUID();
  await redisClient.set(sessionKey, JSON.stringify(user), {
    EX: parseInt(process.env.SESSION_EXP as string)
  });
  return sessionKey;
};
