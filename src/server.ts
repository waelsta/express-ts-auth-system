import { connectToDatabase } from './utils/prisma.connect';
import * as dotenv from 'dotenv';
import app from './app';
import redisClient from './utils/redis.connect';
dotenv.config();

const startServer = async () => {
  await connectToDatabase();
  await redisClient.connect();

  app.listen(5000, () =>
    console.log(`server running on port : ${process.env.PORT} \n`)
  );
};

startServer();
