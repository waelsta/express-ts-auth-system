import { ErrorHandler } from './middlewares/errorHandler';
import express, { NextFunction, Request, Response } from 'express';
import { corsOptions, credentials } from './utils/corsConfig';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

// middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(credentials);

// routes
app.get('/', (req, res) => {
  res.status(200).send({ message: 'hello world' });
});

// express error handler
app.use(
  (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    res.status(err.statusCode);
    return res.send({ error: err.message });
  }
);

export default app;
