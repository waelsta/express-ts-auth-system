import express, { NextFunction, Request, Response } from 'express';
import { corsOptions, credentials } from './utils/corsConfig';
import { ErrorHandler } from './middlewares/errorHandler';
import employeeRouter from './routes/employeeRouter';
import uploadsRouter from './routes/uploadsRouter';
import clientRouter from './routes/clientRouter';
import authRouter from './routes/authRouter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import serviceRouter from './routes/serviceRouter';

const app = express();
// middlewares
if (!process.env.TEST) {
  app.use(morgan('dev'));
}
app.use(helmet());
app.use(cookieParser());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());

// routes
app.get('/', (req, res) => {
  return res.status(200).send({ message: 'hello world' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/client', clientRouter);
app.use('/api/v1/uploads/', uploadsRouter);
app.use('/api/v1/employee', employeeRouter);
app.use('/api/v1/service', serviceRouter);

app.use(
  (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.statusCode || 500).send({ error: err.message });
  }
);

export default app;
