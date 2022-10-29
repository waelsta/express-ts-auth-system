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

describe('it should sign up', () => {
  let server: http.Server;

  beforeAll(async () => {
    await redisClient.connect();
    await prisma.$connect();
    await prisma.client.delete({ where: { email: signupTestData.email } });
    server = http.createServer(app).listen(7000);
  });

  it('should register client', () => {
    return request(server)
      .post('/api/auth/signup')
      .send(signupTestData)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveProperty('token');
      });
  });

  afterAll(done => {
    redisClient.disconnect();
    prisma.$disconnect();
    server.close(done);
  });
});
