import { ErrorHandler } from './middlewares/errorHandler';
import express, { NextFunction, Request, Response } from 'express';
import { corsOptions, credentials } from './utils/corsConfig';
import authRouter from './routes/authRouter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
// middlewares
app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(credentials);
app.use(express.json());

// routes
app.get('/', (req, res) => {
  return res.status(200).send({ message: 'hello world' });
});

app.use('/api/v1/auth', authRouter);


app.use(
  (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.statusCode).send({ error: err.message });
  }
);

export default app;
