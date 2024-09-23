// src/index.ts

// ONE USER, ONE JWT, ONE COOKIE, ONE WEBSOCKET SESSION

import app from './app';
import http from 'http';
// import { initializeSocket } from './config/socket';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3500;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
// initializeSocket(server);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Decide whether to exit the process
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Decide whether to exit the process
  // process.exit(1);
});

// Start the server after MongoDB connection is open
mongoose.connection.on('open', () => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

mongoose.connection.on('error', (error: Error) => {
  console.error('MongoDB connection error:', error);
  // Optionally attempt to reconnect
  // mongoose.connect(process.env.MONGO_URI!, options).catch(err => console.error(err));
  // Or exit the process
  // process.exit(1);
});
