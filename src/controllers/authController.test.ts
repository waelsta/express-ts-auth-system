import redisClient from '../utils/redis.connect';
import { StatusCodes } from 'http-status-codes';
import { hashPassword } from '../utils/crypt';
import prisma from '../utils/prisma.connect';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import http from 'http';

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

const fakeJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImZvbyI6ImJhciJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.5QQ3YuRVOuoNHoAQNscvjHbR9Fg5D8TpENDSqGu-Yrg';

let jwtTestToken: string;

const resetLinkToken = 'sdlkfqskfqsljflksl';

// ****************************************************

describe('Auth', () => {
  let server: http.Server;

  beforeAll(async () => {
    redisClient.connect();
    prisma.$connect();

    // create fake user to test for user login
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

    // create session to test user password reset link
    await redisClient.set(resetLinkToken, 'test1@mail.com');

    // create fake session to test for user sign out
    const sessionKey = await redisClient.set(
      '1111',
      JSON.stringify({
        id: 'user-1',
        email: 'test1@mail.com',
        phone_number: 11111111,
        last_name: 'test',
        first_name: 'test',
        street: 'test 123',
        city: 'beja'
      })
    );

    jwtTestToken = jwt.sign({ sessionKey }, process.env.JWT_SECRET);

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

  describe('sign out', () => {
    // no jwt token
    it('check for non existing jwt', async () => {
      return request(server)
        .post('/api/v1/auth/client/signout')
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'please login !'
          });
        });
    });

    // unvalid jwt token
    it('should sign user out', async () => {
      return request(server)
        .post('/api/v1/auth/client/signout')
        .set('Cookie', [`jwt=${fakeJwt}`])
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'session already expired !'
          });
        });
    });

    // signed out successfully
    it('should return signed out successfully ', async () => {
      return request(server)
        .post('/api/v1/auth/client/signout')
        .set('Cookie', [`jwt=${jwtTestToken}`])
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            data: 'signed out successfully'
          });
        });
    });
  });

  describe('reset link', () => {
    it('should return missing email', async () => {
      return request(server)
        .post('/api/v1/auth/client/link')
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'missing email address !'
          });
        });
    });

    it('should return no user with such email', async () => {
      return request(server)
        .post('/api/v1/auth/client/link')
        .send({ email: 'invlidmail@gmail.com' })
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'no user with such email !'
          });
        });
    });

    it('should return OK', async () => {
      return request(server)
        .post('/api/v1/auth/client/link')
        .send({ email: 'test1@mail.com' })
        .expect(StatusCodes.OK);
    }, 20000);
  });

  describe('reset password', () => {
    it('should return missing reset token', async () => {
      return request(server)
        .get('/api/v1/auth/client/reset')
        .expect(StatusCodes.UNAUTHORIZED)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'action not authorized !'
          });
        });
    });

    it('should return missing password', async () => {
      return request(server)
        .get('/api/v1/auth/client/reset?token=jfsldjfkskldfjlsdk')
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'missing password field !'
          });
        });
    });

    it('should return OK', async () => {
      return request(server)
        .get(`/api/v1/auth/client/reset?token=${resetLinkToken}`)
        .send({ password: 'someNewPassword123' })
        .expect(StatusCodes.OK)
        .then(res => {
          expect(res.body).toMatchObject({
            data: 'password reset successfully'
          });
        });
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
