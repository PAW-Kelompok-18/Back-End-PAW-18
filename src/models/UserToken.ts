/* eslint-disable @typescript-eslint/no-explicit-any */
// models/UserToken.ts

import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';

export class UserToken {
  @prop({ required: true, ref: 'User' })
  public userId!: Ref<ModelType<any>>;

  @prop({ required: true })
  public token!: string;

  @prop({ required: true })
  public expiresAt!: Date;
}

export const UserTokenModel = getModelForClass(UserToken);

// Ensure TTL index is created
UserTokenModel.collection.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);
