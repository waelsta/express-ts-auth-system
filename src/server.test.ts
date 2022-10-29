import request from 'supertest';
import app from './app';
import http from 'http';

describe('Server should start', () => {
  let server: http.Server;

  beforeAll(() => {
    server = http.createServer(app).listen(7000);
  });

  it('should return 200', () => {
    return request(server).get('/').expect(200);
  });

  afterAll(done => {
    server.close(done);
  });
});
