import { connectToDatabase } from './utils/prisma.connect';
import redisClient from './utils/redis.connect';
import * as dotenv from 'dotenv';
import app from './app';
dotenv.config();

const startServer = async () => {
  await connectToDatabase();

  await redisClient
    .connect()
    .then(() => console.log('connected to redis 🟥 '))
    .catch(err => console.log('Could not connect to redis 💢', err));

  const server = app.listen(5000, () =>
    console.log(`server running on port : ${process.env.PORT} \n`)
  );

  return server;
};

startServer();
