import { ISessionEmployeeData } from '../../types/employee';
import redisClient from '../../utils/redis.connect';
import { hashPassword } from '../../utils/crypt';
import prisma from '../../utils/prisma.connect';
import { Employee} from '@prisma/client';
import { randomUUID } from 'crypto';

// check for existing email

export const findEmployeeByEmail = async (email: string) =>
  await prisma.employee.findUnique({
    where: { email }
  });

// check for existing phone number
export const phoneNumberExists = async (phone: number) =>
  prisma.employee.findUnique({ where: { phone_number: phone } });

// insert user into database ;
export const createEmployee = async (employee: Employee) =>
  await prisma.employee.create({ data: employee });

export const saveEmployeeSession = async (user: ISessionEmployeeData) => {
  const sessionKey = randomUUID();
  await redisClient.set(sessionKey, JSON.stringify(user), {
    EX: parseInt(process.env.SESSION_EXP as string)
  });
  return sessionKey;
};

export const updateEmployeePassword = async (
  email: string,
  password: string
) => {
  return await prisma.employee.update({
    where: { email: email },
    data: { password: hashPassword(password) }
  });
};
