import request from 'supertest';
import app from '../src/app';
import http from 'http';
import { StatusCodes } from 'http-status-codes';
import prisma from '../src/services/prisma.connect';
import redisClient from '../src/services/redis.connect';
import * as jwt from 'jsonwebtoken';

const endpoint = '/api/v1/uploads/profile_picture';
const picture = '/home/test/picture.jpg';
const largePicture = '/home/test/large.jpg';
const svgPicture = '/home/test/svgPicture.svg';

describe('profile pic upload', () => {
  let server: http.Server;
  let jwtTestToken: string;
  let sessionKey = 'sessionkey133';

  beforeAll(async () => {
    redisClient.connect();
    prisma.$connect();

    // create user
    await prisma.client.create({
      data: {
        id: 'user-1',
        email: 'test1@mail.com',
        password: 'passwordjsfkqsldjflqskdfjlqskdjflqskjdf',
        phone_number: 11111111,
        last_name: 'test',
        first_name: 'test',
        street: 'test 123',
        city: 'beja'
      }
    });

    // save user to session
    await redisClient.set(
      sessionKey,
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

    // sign token
    jwtTestToken = jwt.sign({ sessionKey }, process.env.JWT_SECRET);

    server = http.createServer(app).listen(7000);
  });

  it('should return missing or wrong user type', async () => {
    return request(server)
      .post(endpoint)
      .set('Cookie', [`jwt=${jwtTestToken}`])
      .expect(StatusCodes.BAD_REQUEST)
      .then(res => {
        expect(res.body).toMatchObject({
          error: 'missing or wrong user type'
        });
      });
  });

  it('should return please choose an image', async () => {
    return request(server)
      .post(`${endpoint}?user=client`)
      .set('Cookie', [`jwt=${jwtTestToken}`])
      .expect(StatusCodes.BAD_REQUEST)
      .then(res => {
        expect(res.body).toMatchObject({
          error: 'please choose an image'
        });
      });
  });

  it('should return image size is too large > 3mb', async () => {
    return request(server)
      .post(`${endpoint}?user=client`)
      .set('Cookie', [`jwt=${jwtTestToken}`])
      .attach('profile', largePicture)
      .expect(StatusCodes.BAD_REQUEST)
      .then(res => {
        expect(res.body).toMatchObject({
          error: 'image size is too large > 3mb'
        });
      });
  });

  it('should return invalid extension (jpg , jpeg or png)', async () => {
    return request(server)
      .post(`${endpoint}?user=client`)
      .set('Cookie', [`jwt=${jwtTestToken}`])
      .attach('profile', svgPicture)
      .expect(StatusCodes.BAD_REQUEST)
      .then(res => {
        expect(res.body).toMatchObject({
          error: 'invalid extension (jpg , jpeg or png)'
        });
      });
  });

  it('should return file uploaded successfully', async () => {
    return request(server)
      .post(`${endpoint}?user=client`)
      .set('Cookie', [`jwt=${jwtTestToken}`])
      .attach('profile', picture)
      .expect(StatusCodes.CREATED)
      .then(res => {
        expect(res.body).toMatchObject({
          message: 'file uploaded successfully'
        });
      });
  });

  afterAll(async () => {
    await prisma.client.delete({ where: { email: 'test1@mail.com' } });
    await redisClient.disconnect();
    await prisma.$disconnect();
    server.close();
  });
});
