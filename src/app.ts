import { CustomError, ErrorHandler } from './middlewares/errorHandler';
import express, { NextFunction, Request, Response } from 'express';
import { corsOptions, credentials } from './utils/corsConfig';
import authRouter from './routes/authRouter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
// middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(credentials);
app.use(express.json());

// routes
app.get('/', (req, res) => {
  return res.status(200).send({ message: 'hello world' });
});

app.use('/api/auth', authRouter);

app.use('*', (req: Request, res: Response, next: NextFunction) => {
  return next(new CustomError(404, 'endpoint does not exist'));
});

// express error handler
app.use((err: ErrorHandler, req: Request, res: Response) => {
  res.status(err.statusCode);
  return res.send({ error: err.message });
});

export default app;
