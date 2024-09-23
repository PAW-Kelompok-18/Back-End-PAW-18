// src/config/socket.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from './corsOptions';

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOptions.origin as string | string[],
      methods: corsOptions.methods,
      credentials: corsOptions.credentials,
    },
  });

  console.log('a user connected');

  io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
}
