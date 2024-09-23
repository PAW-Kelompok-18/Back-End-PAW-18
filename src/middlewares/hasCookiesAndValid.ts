import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserTokenModel } from '../models/UserToken';
import { User, UserModel } from '../models/User';
import { DocumentType } from '@typegoose/typegoose';
import createHttpError from 'http-errors';

export async function hasCookiesAndValid(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies['jwt'];

  if (!token) {
    return res.redirect('/auth/google');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    const [tokenRecord, user] = await Promise.all([
      UserTokenModel.findOne({ token, userId: decoded._id }),
      UserModel.findById(decoded._id) as Promise<DocumentType<User> | null>,
    ]);

    if (!tokenRecord || !user) {
      return res.redirect('/auth/google');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.redirect('/auth/google');
    }
    next(createHttpError(500, 'Internal Server Error'));
  }
}
