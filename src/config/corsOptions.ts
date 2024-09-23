// src/config/corsOptions.ts

import { CorsOptions } from 'cors';

export const allowedOrigins = [
  'http://localhost:3000', // Frontend development URL
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      // Origin is allowed
      callback(null, true);
    } else {
      // Origin is not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
  ],
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200, // For legacy browsers
};

export default corsOptions;
