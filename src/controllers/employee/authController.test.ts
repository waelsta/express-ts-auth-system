import redisClient from '../../utils/redis.connect';
import { hashPassword } from '../../utils/crypt';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../utils/prisma.connect';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../app';
import http from 'http';

// *************** data samples for test **************

const employeeTestData = {
  formData: {
    password_match: 'Test12345',
    email: 'test1@mail.com',
    profession: 'Engineer',
    phone_number: 11111111,
    password: 'Test12345',
    first_name: 'test',
    last_name: 'test',
    city: 'beja'
  },
  withExistingPhoneNumber: {
    password_match: 'Test12345',
    email: 'test2@mail.com',
    phone_number: 11111111,
    profession: 'Engineer',
    password: 'Test12345',
    first_name: 'test',
    last_name: 'test',
    city: 'beja'
  },

  withExistingEmail: {
    password_match: 'Test12345',
    email: 'test1@mail.com',
    profession: 'Engineer',
    phone_number: 22222222,
    password: 'Test12345',
    first_name: 'test',
    last_name: 'test',
    city: 'beja'
  },
  resetLinkToken: 'sdlkfqskfqfdfqksljfskljdflskdf',
  jwtTestToken: '',
  fakeJwtToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImZvbyI6ImJhciJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.5QQ3YuRVOuoNHoAQNscvjHbR9Fg5D8TpENDSqGu-Yrg'
};

// ****************************************************

describe('Employee Auth', () => {
  let server: http.Server;

  beforeAll(async () => {
    redisClient.connect();
    prisma.$connect();

    // create fake user to test for user login
    await prisma.employee.create({
      data: {
        password: hashPassword('Test12345'),
        email: 'test1@mail.com',
        profession: 'Engineer',
        phone_number: 11111111,
        still_employed: true,
        first_name: 'test',
        last_name: 'test',
        id: 'user-1'
      }
    });

    // create session to test user password reset link
    await redisClient.set(employeeTestData.resetLinkToken, 'test1@mail.com');

    // create fake session to test for user sign out
    const sessionKey = await redisClient.set(
      '1111',
      JSON.stringify({
        email: 'test1@mail.com',
        phone_number: 11111111,
        street: 'test 123',
        first_name: 'test',
        last_name: 'test',
        id: 'user-1',
        city: 'beja'
      })
    );

    employeeTestData.jwtTestToken = jwt.sign(
      { sessionKey },
      process.env.JWT_SECRET
    );

    server = http.createServer(app).listen(7000);
  });

  describe('sign up', () => {
    it('should return missing fields', async () => {
      return request(server)
        .post('/api/v1/auth/employee/signup')
        .send({
          last_name: 'test',
          first_name: 'user'
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
        .post('/api/v1/auth/employee/signup')
        .send(employeeTestData.withExistingEmail)
        .expect(StatusCodes.CONFLICT)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'email alreay in use !'
          });
        });
    });

    it('should return phone number is taken', async () => {
      return request(server)
        .post('/api/v1/auth/employee/signup')
        .send(employeeTestData.withExistingPhoneNumber)
        .expect(StatusCodes.CONFLICT)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'phone number already in use !'
          });
        });
    });

    it('should sign client up', async () => {
      return request(server)
        .post('/api/v1/auth/employee/signup')
        .send({
          ...employeeTestData.formData,
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
        .post('/api/v1/auth/employee/signin')
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
        .post('/api/v1/auth/employee/signin')
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
        .post('/api/v1/auth/employee/signin')
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
        .post('/api/v1/auth/employee/signin')
        .send({ email: 'test1@mail.com', password: 'Test12345' })
        .expect(200);
    });
  });

  describe('sign out', () => {
    // no jwt token
    it('check for non existing jwt', async () => {
      return request(server)
        .post('/api/v1/auth/employee/signout')
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
        .post('/api/v1/auth/employee/signout')
        .set('Cookie', [`jwt=${employeeTestData.fakeJwtToken}`])
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
        .post('/api/v1/auth/employee/signout')
        .set('Cookie', [`jwt=${employeeTestData.jwtTestToken}`])
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
        .post('/api/v1/auth/employee/link')
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'missing email address !'
          });
        });
    });

    it('should return no user with such email', async () => {
      return request(server)
        .post('/api/v1/auth/employee/link')
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
        .post('/api/v1/auth/employee/link')
        .send({ email: 'test1@mail.com' })
        .expect(StatusCodes.OK);
    }, 20000);
  });

  describe('reset password', () => {
    it('should return missing reset token', async () => {
      return request(server)
        .get('/api/v1/auth/employee/reset')
        .expect(StatusCodes.UNAUTHORIZED)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'action not authorized !'
          });
        });
    });

    it('should return missing password', async () => {
      return request(server)
        .get('/api/v1/auth/employee/reset?token=jfsldjfkskldfjlsdk')
        .expect(StatusCodes.BAD_REQUEST)
        .then(res => {
          expect(res.body).toMatchObject({
            error: 'missing password field !'
          });
        });
    });

    it('should return OK', async () => {
      return request(server)
        .get(
          `/api/v1/auth/employee/reset?token=${employeeTestData.resetLinkToken}`
        )
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
    await prisma.employee.deleteMany({ where: { email: 'test1@mail.com' } });
    await prisma.employee.deleteMany({ where: { email: 'test2@mail.com' } });
    await redisClient.disconnect();
    await prisma.$disconnect();
    server.close();
  });
});
