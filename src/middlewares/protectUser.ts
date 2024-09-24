import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { UserTokenModel } from '../models/UserToken';
import { User, UserModel } from '../models/User';
import { DocumentType } from '@typegoose/typegoose';
import createHttpError from 'http-errors';
import { UserTokenModel } from '../models/UserToken';

export async function protectUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw createHttpError(401, 'User not authenticated');
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;
    const [tokenRecord, user] = await Promise.all([
      UserTokenModel.findOne({ token, userId: decoded._id }),
      UserModel.findById(decoded._id) as Promise<DocumentType<User> | null>,
    ]);

    if (!tokenRecord || !user)
      throw createHttpError(401, 'User not authenticated');

    if (!user) throw createHttpError(401, 'User not authenticated');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError)
      next(createHttpError(401, 'User not authenticated'));
    next(createHttpError(500, 'Internal Server Error'));
  }
}
