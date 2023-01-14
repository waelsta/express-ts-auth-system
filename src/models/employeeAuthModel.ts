import { randomUUID } from 'crypto';
import { Employee } from '@prisma/client';
import { hashPassword } from '../utils/crypt';
import prisma from '../services/prisma.connect';
import { findServiceByName } from './serviceModal';
import { cities } from '../utils/citiesCoordinates';
import redisClient from '../services/redis.connect';
import { EmployeeFormTypes } from '../utils/validation';

// check for existing email

export const findEmployeeByEmail = async (email: string) =>
  await prisma.employee.findUnique({
    where: { email }
  });

// check for existing phone number
export const findEmployeeByPhoneNum = async (phone: number) =>
  prisma.employee.findUnique({ where: { phone_number: phone } });

// insert user into database ;
export const createEmployee = async (employee: EmployeeFormTypes) => {
  const prepareData = {
    first_name: employee.first_name,
    profession: (await findServiceByName(employee.profession!))?.id || null,
    last_name: employee.last_name,
    email: employee.email,
    lat: cities[employee.city as keyof typeof cities].lat,
    long: cities[employee.city as keyof typeof cities].lat,

    id: randomUUID(),
    createdAt: new Date(),
    still_employed: false,

    profile_picture_url: null,
    password: hashPassword(employee.password),
    phone_number: parseInt(employee.phone_number)
  };
  await prisma.employee.create({ data: prepareData });
};

// export const saveEmployeeSession = async (
//   user: ClientSession | EmployeeSession
// ) => {
//   const sessionKey = randomUUID();
//   await redisClient.set(sessionKey, JSON.stringify(user), {
//     EX: parseInt(process.env.SESSION_EXP as string)
//   });
//   return sessionKey;
// };

export const updateEmployeePassword = async (
  email: string,
  password: string
) => {
  return await prisma.employee.update({
    where: { email: email },
    data: { password: hashPassword(password) }
  });
};

export const saveEmployeeSession = async (user: Employee) => {
  const sessionData: Omit<Employee, 'password'> = {
    phone_number: user.phone_number,
    first_name: user.first_name,
    profession: (await findServiceByName(user.profession!))?.id || null,
    last_name: user.last_name,
    email: user.email,
    lat: user.lat,
    long: user.lat,

    createdAt: new Date(),
    id: randomUUID(),
    still_employed: false,
    profile_picture_url: user.profile_picture_url
  };

  const sessionKey = randomUUID();
  await redisClient.set(sessionKey, JSON.stringify(sessionData), {
    EX: parseInt(process.env.SESSION_EXP as string)
  });
  return sessionKey;
};
