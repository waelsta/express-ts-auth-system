import { corsOptions, credentials } from './utils/corsConfig.js';
import prisma from './utils/prisma.connect.js';
import express from 'express';
import cors from 'cors';
const app = express();

// middlewares
app.use(credentials);
app.use(cors(corsOptions));

// routes
app.get('/', (req, res) => {
  return res.send('hello everyone');
});

// starting app
async function startServer() {
  await prisma
    .$connect()
    .then(
      () => console.log('connected to postgresql 🐘✨'),
      () => console.log('could not connect to postgresql 🛟')
    )
    .catch(err => console.log('error connecting to database', err));

  app.listen(5000, () => console.log('server running...'));
}

startServer();
