// models/User.ts

import { prop, getModelForClass, DocumentType } from '@typegoose/typegoose';
import jwt from 'jsonwebtoken';
import { UserTokenModel } from './UserToken';
import tokenTime from '../utils/tokenTime';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true, unique: true })
  public googleId!: string;

  @prop({ enum: UserRole, required: true, default: UserRole.USER })
  public role!: UserRole;

  public async generateToken(this: DocumentType<User>): Promise<string> {
    const token = jwt.sign(
      {
        _id: this._id,
        role: this.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: tokenTime.string },
    );

    const expirationDate = new Date(Date.now() + tokenTime.number);

    await UserTokenModel.create({
      userId: this._id,
      token,
      expiresAt: expirationDate,
    });

    return token;
  }
}

export const UserModel = getModelForClass(User);
