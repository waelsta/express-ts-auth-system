import { connectToDatabase } from './utils/prisma.connect';
import * as dotenv from 'dotenv';
import app from './app';
dotenv.config();

const startServer = async () => {
  await connectToDatabase();
  app.listen(5000, () =>
    console.log(`server running on port : ${process.env.PORT} \n`)
  );
};

startServer();
