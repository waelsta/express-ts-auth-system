import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

const redisClient = createClient({
  url: REDIS_URL
});

export default redisClient;
