import { ClientFormTypes } from '../utils/validation';
import redisClient from '../services/redis.connect';
import prisma from '../services/prisma.connect';
import { Client, Employee } from '@prisma/client';
import { hashPassword } from '../utils/crypt';
import { randomUUID } from 'crypto';

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
export const findClientByphoneNum = async (phone: number) =>
  prisma.client.findUnique({ where: { phone_number: phone } });

// insert user into database ;
export const createClient = async (client: ClientFormTypes) => {
  const clientData: Client = {
    phone_number: parseInt(client.phone_number),
    first_name: client.first_name,
    last_name: client.last_name,
    street: client.street,
    email: client.email,
    city: client.city,

    createdAt: new Date(),
    id: randomUUID(),
    is_client: false,
    profile_picture_url: null,
    password: hashPassword(client.password)
  };

  await prisma.client.create({ data: clientData });
};

type updateUserPassword = (
  email: string,
  pwd: string
) => Promise<Client | Employee>;

export const updateClientPassword: updateUserPassword = async (
  email: string,
  password: string
): Promise<Client> => {
  return await prisma.client.update({
    where: { email: email },
    data: { password: hashPassword(password) }
  });
};

export const saveClientSession = async (user: Client) => {
  const sessionData: Omit<Client, 'password'> = {
    phone_number: user.phone_number,
    first_name: user.first_name,
    last_name: user.last_name,
    street: user.street,
    email: user.email,
    city: user.city,

    createdAt: new Date(),
    id: randomUUID(),
    is_client: false,
    profile_picture_url: user.profile_picture_url
  };

  const sessionKey = randomUUID();
  await redisClient.set(sessionKey, JSON.stringify(sessionData), {
    EX: parseInt(process.env.SESSION_EXP as string)
  });
  return sessionKey;
};
