import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', err =>
  console.log('Could not connect to redis 💢', err)
);
redisClient.on('connect', () => console.log('connected to redis 🟥 '));

export default redisClient;
