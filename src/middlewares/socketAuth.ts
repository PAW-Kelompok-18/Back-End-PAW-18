// src/middlewares/socketAuth.ts

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { UserTokenModel } from '../models/UserToken';
import { UserModel } from '../models/User';

export interface SocketWithData extends Socket {
  data: {
    user: {
      userId: string;
      email: string;
      role: string;
    };
  };
}

export async function socketAuthMiddleware(
  socket: SocketWithData,
  next: (err?: Error) => void,
) {
  try {
    const cookies = cookie.parse(socket.request.headers.cookie || '');
    const token = cookies.jwt;

    if (!token)
      return next(new Error('Authentication error: No token provided'));

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    // Check if the token exists in the database
    const tokenRecord = await UserTokenModel.findOne({
      token,
      user: decoded._id,
    });
    if (!tokenRecord) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Retrieve the user from the database
    const user = await UserModel.findById(decoded._id).lean();
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user information to the socket object
    socket.data.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error('Socket.IO authentication error:', err);
    next(new Error('Authentication error'));
  }
}
