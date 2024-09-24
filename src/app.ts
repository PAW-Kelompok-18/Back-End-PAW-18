// src/app.ts

import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { customLoggerFormat, loggerStream } from './config/morganLogger';
import authRoutes from './routes/authRoutes';
import connectDB from './config/connectDB';
import createHttpError from 'http-errors';
import session from 'express-session';
import passport from 'passport';
import corsOptions from './config/corsOptions';
import transactionRoutes from './routes/transactionRoutes';
import seatRoutes from './routes/seatRoutes';

const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
} else {
  app.use(cors(corsOptions));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(morgan(customLoggerFormat, { stream: loggerStream }));
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/seat', seatRoutes);

// 404 Route
app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
  next(createHttpError(404, 'Not Found'));
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof createHttpError.HttpError) {
    const httpError = err as createHttpError.HttpError;
    console.error(httpError);
    res.status(httpError.status).json({ message: httpError.message });
  } else {
    if (process.env.NODE_ENV === 'development') console.error(err);
    res.status(500).json({ message: 'Unexpected error' });
  }
});

export default app;
