import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Seat } from './Seat';
import { User } from './User';

export class Transaction {
  @prop({ required: true, ref: () => User })
  public userId!: Ref<User>;

  @prop({ type: () => [Types.ObjectId], ref: () => Seat, required: true })
  public seats!: Ref<Seat>[];

  @prop({
    required: true,
    enum: ['pending', 'completed'],
    default: 'pending',
  })
  public status!: 'pending' | 'completed';

  @prop({ required: true, default: Date.now })
  public createdAt!: Date;

  @prop()
  public completedAt?: Date;
}

export const TransactionModel = getModelForClass(Transaction);
