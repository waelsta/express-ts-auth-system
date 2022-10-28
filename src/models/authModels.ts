import { CustomError } from '../middlewares/errorHandler';
import redisClient from '../utils/redis.connect';
import prisma from '../utils/prisma.connect';
import { Client } from '@prisma/client';
import { randomUUID } from 'crypto';

// check for existing email
export const emailExists = async (email: string) => {
  const user = await prisma.client.findUnique({ where: { email: email } });
  return user;
};

// check for existing phone number
export const phoneNumberExists = async (phone: number) => {
  return prisma.client.findUnique({ where: { phone_number: phone } });
};

// insert user into database ;
export const createClient = async (client: Client) => {
  try {
    const clientData = await prisma.client.create({ data: client });
    return clientData;
  } catch (error: any) {
    if (process.env.node_env === 'DEVELOPMENT') {
      throw new CustomError(400, error.message);
    } else {
      throw new CustomError(400, 'there was an error signing in !');
    }
  }
};

export const saveSession = async (client: Client) => {
  try {
    const clientSession = await redisClient.set(
      randomUUID(),
      JSON.stringify(client)
    );

    return clientSession;
  } catch (error: any) {
    if (process.env.node_env === 'DEVELOPMENT') {
      throw new CustomError(400, error.message);
    } else throw new CustomError(400, 'there was an error signing in !');
  }
};
