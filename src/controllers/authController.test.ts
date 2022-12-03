import redisClient from '../utils/redis.connect';
import prisma from '../utils/prisma.connect';
import request from 'supertest';
import app from '../app';
import http from 'http';
import { StatusCodes } from 'http-status-codes';
import { ISignupFormTypes } from '../utils/validation';
import { hashPassword } from '../utils/crypt';

// *************** data samples for test **************

const userFormData = {
  email: 'test1@mail.com',
  password: 'Test12345',
  password_match: 'Test12345',
  phone_number: 11111111,
  last_name: 'test',
  first_name: 'test',
  street: 'test 123',
  city: 'beja'
};

const userWithExistingPhoneNumber = {
  ...userFormData,
  email: 'test2@mail.com'
};
const userWithExistingEmail = { ...userFormData, phone_number: 22222222 };

// ****************************************************

describe('Auth', () => {
  let server: http.Server;

  beforeAll(async () => {
    redisClient.connect();
    prisma.$connect();
    await prisma.client.create({
      data: {
        id: 'user-1',
        email: 'test1@mail.com',
        password: hashPassword('Test12345'),
        phone_number: 11111111,
        last_name: 'test',
        first_name: 'test',
        street: 'test 123',
        city: 'beja'
      }
    });

    server = http.createServer(app).listen(7000);
  });

  describe('sign up', () => {
    it('should return missing fields', async () => {
      return request(server)
        .post('/api/v1/auth/client/signup')
        .send({
          last_name: 'test',
          street: 'some street'
        })
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'missing or invalid form data !'
          });
        });
    });

    it('should return email is taken', async () => {
      return request(server)
        .post('/api/v1/auth/client/signup')
        .send(userWithExistingEmail)
        .expect(StatusCodes.CONFLICT)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'email alreay in use !'
          });
        });
    });

    it('should return phone number is taken', async () => {
      return request(server)
        .post('/api/v1/auth/client/signup')
        .send(userWithExistingPhoneNumber)
        .expect(StatusCodes.CONFLICT)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'phone number already in use !'
          });
        });
    });

    it('should sign client up', async () => {
      return request(server)
        .post('/api/v1/auth/client/signup')
        .send({
          ...userFormData,
          email: 'test2@mail.com',
          phone_number: 12345678
        })
        .expect(StatusCodes.OK)
        .then(res => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('sign in', () => {
    // invalid form data
    it('should return invalid form data', async () => {
      return request(server)
        .post('/api/v1/auth/client/signin')
        .send({ email: 'test1@mail.com', password: 'invalid password' })
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'invalid or missing data !'
          });
        });
    });

    // non existing email
    it('should check for non existing email', async () => {
      return request(server)
        .post('/api/v1/auth/client/signin')
        .send({ email: 'wrongEmail@mail.com', password: 'Testing12345' })
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'invalid credentials !'
          });
        });
    });

    // test for wrong password
    it('should check for wrong password', async () => {
      return request(server)
        .post('/api/v1/auth/client/signin')
        .send({ email: 'test1@mail.com', password: 'WrongPassword123' })
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'invalid credentials !'
          });
        });
    });

    // signin success
    it('should return sign in success', () => {
      return request(server)
        .post('/api/v1/auth/client/signin')
        .send({ email: 'test1@mail.com', password: 'Test12345' })
        .expect(200);
    });
  });

  afterAll(async () => {
    await prisma.client.deleteMany({ where: { email: 'test1@mail.com' } });
    await prisma.client.deleteMany({ where: { email: 'test2@mail.com' } });
    await redisClient.disconnect();
    await prisma.$disconnect();
    server.close();
  });
});
