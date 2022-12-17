import { ISessionClientData } from '../../types/client';
import redisClient from '../../utils/redis.connect';
import { Client, Employee } from '@prisma/client';
import { hashPassword } from '../../utils/crypt';
import prisma from '../../utils/prisma.connect';
import { randomUUID } from 'crypto';
import mailer from 'nodemailer';

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
export const phoneNumberExists = async (phone: number) =>
  prisma.client.findUnique({ where: { phone_number: phone } });

// insert user into database ;
export const createClient = async (client: Client) =>
  await prisma.client.create({ data: client });

export const saveSession = async (
  user: ISessionClientData | Employee | Client
) => {
  const sessionKey = randomUUID();
  await redisClient.set(sessionKey, JSON.stringify(user), {
    EX: parseInt(process.env.SESSION_EXP as string)
  });
  return sessionKey;
};

export const sendMail = async (to: string, subject: string, body: string) => {
  const transport = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: to,
    subject: subject,
    text: body
  };

  return await transport.sendMail(mailOptions);
};

export const updateClientPassword = async (email: string, password: string) => {
  return await prisma.client.update({
    where: { email: email },
    data: { password: hashPassword(password) }
  });
};
