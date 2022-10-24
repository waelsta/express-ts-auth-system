import request from 'supertest';
import app from './app';

describe('Server should start', () => {
  it('should return 200', () => {
    request(app).get('/').expect(200);
  });
});
