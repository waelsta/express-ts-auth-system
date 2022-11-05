import redisClient from '../utils/redis.connect';
import prisma from '../utils/prisma.connect';
import request from 'supertest';
import app from '../app';
import http from 'http';

const signupTestData = {
  password_match: 'Khalilcher666',
  email: 'khalil@gmail.com',
  password: 'Khalilcher666',
  phone_number: 78787878,
  last_name: 'chermiti',
  street: 'some street',
  first_name: 'khalil',
  city: 'beja'
};

describe('auth', () => {
  let server: http.Server;

  beforeAll(async () => {
    await redisClient.connect();
    await prisma.$connect();
    await prisma.client.delete({ where: { email: signupTestData.email } });
    server = http.createServer(app).listen(7000);
  });
  describe('sign up', () => {
    it('should register client', () => {
      return request(server)
        .post('/api/v1/auth/signup')
        .send(signupTestData)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('sign in', () => {
    //invalid credentials
    it('should return invalid credentials', () => {
      return request(server)
        .post('/api/v1/signin')
        .send({ email: 'khalil@gmail.com', password: 'khlayla' })
        .expect(300);
    });
    //email is taken
    it('should return email already in use', () => {
      return request(server)
        .post('api/v1/signin')
        .send({ email: 'khalil@gmail.com', password: 'password' })
        .expect(300);
    });
    // signed in success
    it('should return sign in success', () => {
      return request(server)
        .post('api/v1/signin')
        .send({ email: 'khalil@gmail.com', password: 'khalilcher666' })
        .expect(200);
    });
  });

  afterAll(done => {
    redisClient.disconnect();
    prisma.$disconnect();
    server.close(done);
  });
});
