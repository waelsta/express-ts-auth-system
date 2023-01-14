import { connectToDatabase } from './services/prisma.connect';
import redisClient from './services/redis.connect';
import * as dotenv from 'dotenv';
import morgan from 'morgan';
import app from './app';
dotenv.config();

const startServer = async () => {
  await connectToDatabase();

  await redisClient
    .connect()
    .then(() => console.log('connected to redis 🟥 '))
    .catch(err => console.log('Could not connect to redis 💢', err));

  app.use(morgan('dev'));
  const server = app.listen(5000, () =>
    console.log(`server running on port : ${process.env.PORT} \n`)
  );

  return server;
};

startServer();
